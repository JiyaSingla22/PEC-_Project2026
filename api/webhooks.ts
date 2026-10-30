import crypto from 'crypto';
import { verifyJwt } from './auth';

export interface WebhookEvent {
  id: string;
  event: string;
  timestamp: string;
  payload: any;
  signatureVerified: boolean;
  status: 'PROCESSED' | 'FAILED' | 'DUPLICATE';
  receivedAt: string;
}

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'incogniread_webhook_secret_key_2026';

// In-memory store for idempotency tracking and audit logging
const PROCESSED_EVENT_IDS = new Set<string>();
const WEBHOOK_LOGS: WebhookEvent[] = [
  {
    id: 'evt_initial_seed_001',
    event: 'editorial.bulletin',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    payload: {
      bulletinId: 'bul_77',
      headline: 'Special Gazette Dispatch: Zero-Telemetry RSS Protocol v2.4 Certified',
      urgency: 'HIGH',
      author: 'Bureau Chief',
    },
    signatureVerified: true,
    status: 'PROCESSED',
    receivedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export function computeHmacSignature(payloadString: string, secret: string = WEBHOOK_SECRET): string {
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

export function verifyHmacSignature(rawBody: string, signatureHeader?: string, secret: string = WEBHOOK_SECRET): boolean {
  if (!signatureHeader) return false;

  // Clean prefix if provided like sha256=...
  const signature = signatureHeader.replace(/^sha256=/, '').trim();
  const expectedSignature = computeHmacSignature(rawBody, secret);

  try {
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export default async function webhooksHandler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-signature, x-hub-signature-256');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname.replace(/^\/api\/webhooks\/?/, '').replace(/^\//, '');

  // 1. GET /api/webhooks - Retrieve audit log of received webhooks
  if (req.method === 'GET' && (pathname === '' || pathname === 'logs')) {
    res.status(200).json({
      success: true,
      count: WEBHOOK_LOGS.length,
      secretHint: `${WEBHOOK_SECRET.substring(0, 8)}...`,
      events: [...WEBHOOK_LOGS].reverse().slice(0, 50),
    });
    return;
  }

  // 2. POST /api/webhooks/test - Simulate an incoming webhook dispatch from an external publisher
  if (req.method === 'POST' && pathname === 'test') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const testEvent = {
      id: `evt_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      event: body.event || 'feed.published',
      timestamp: new Date().toISOString(),
      payload: body.payload || {
        feedId: 'press_wire_global',
        title: 'Newspaper Special Edition: The Privacy Ledger Dispatches',
        category: 'Investigative',
        source: 'Associated Independent Gazette',
      },
    };

    const payloadString = JSON.stringify(testEvent);
    const signature = computeHmacSignature(payloadString, WEBHOOK_SECRET);

    // Process through the idempotency & audit ledger
    PROCESSED_EVENT_IDS.add(testEvent.id);
    const loggedEntry: WebhookEvent = {
      ...testEvent,
      signatureVerified: true,
      status: 'PROCESSED',
      receivedAt: new Date().toISOString(),
    };
    WEBHOOK_LOGS.push(loggedEntry);

    res.status(200).json({
      success: true,
      message: 'Simulated webhook processed and verified with HMAC-SHA256.',
      computedSignature: `sha256=${signature}`,
      event: loggedEntry,
    });
    return;
  }

  // 3. POST /api/webhooks - Ingest webhook event from external provider
  if (req.method === 'POST') {
    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));
    const signatureHeader = req.headers['x-signature'] || req.headers['x-hub-signature-256'];

    const isVerified = verifyHmacSignature(rawBody, signatureHeader);

    let parsed: any = {};
    try {
      parsed = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(rawBody);
    } catch {
      res.status(400).json({ success: false, error: 'Malformed JSON payload.' });
      return;
    }

    const eventId = parsed.id || `evt_${crypto.randomBytes(8).toString('hex')}`;
    const eventType = parsed.event || parsed.type || 'unknown.event';

    // Idempotency check
    if (PROCESSED_EVENT_IDS.has(eventId)) {
      const duplicateLog: WebhookEvent = {
        id: eventId,
        event: eventType,
        timestamp: parsed.timestamp || new Date().toISOString(),
        payload: parsed.payload || parsed,
        signatureVerified: isVerified,
        status: 'DUPLICATE',
        receivedAt: new Date().toISOString(),
      };
      WEBHOOK_LOGS.push(duplicateLog);

      res.status(200).json({
        success: true,
        duplicate: true,
        message: 'Event already ingested (idempotent no-op).',
        eventId,
      });
      return;
    }

    if (!isVerified) {
      const failedLog: WebhookEvent = {
        id: eventId,
        event: eventType,
        timestamp: parsed.timestamp || new Date().toISOString(),
        payload: parsed.payload || parsed,
        signatureVerified: false,
        status: 'FAILED',
        receivedAt: new Date().toISOString(),
      };
      WEBHOOK_LOGS.push(failedLog);

      res.status(401).json({
        success: false,
        error: 'Invalid HMAC-SHA256 signature. Header x-signature does not match webhook secret.',
      });
      return;
    }

    // Mark as processed
    PROCESSED_EVENT_IDS.add(eventId);

    const successfulLog: WebhookEvent = {
      id: eventId,
      event: eventType,
      timestamp: parsed.timestamp || new Date().toISOString(),
      payload: parsed.payload || parsed,
      signatureVerified: true,
      status: 'PROCESSED',
      receivedAt: new Date().toISOString(),
    };
    WEBHOOK_LOGS.push(successfulLog);

    res.status(200).json({
      success: true,
      message: 'Webhook received, verified, and logged to audit dispatch successfully.',
      eventId,
      status: 'PROCESSED',
    });
    return;
  }

  res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
