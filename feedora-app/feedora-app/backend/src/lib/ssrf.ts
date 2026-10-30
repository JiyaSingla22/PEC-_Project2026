import dns from 'dns/promises';
import net from 'net';

const BLOCKED_CIDRS = [
  // Loopback
  /^127\./,
  /^::1$/,
  // Private ranges
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  // Link-local
  /^169\.254\./,
  /^fe80:/i,
  // Cloud metadata
  /^100\.64\./,
];

export async function validateTargetUrl(rawUrl: string): Promise<{ valid: boolean; reason?: string }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return { valid: false, reason: 'Malformed URL.' };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { valid: false, reason: `Protocol "${parsedUrl.protocol}" is not allowed. Only http/https.` };
  }

  const hostname = parsedUrl.hostname;

  // Block cloud metadata endpoints
  if (/169\.254\.169\.254|metadata\.google\.internal/i.test(hostname)) {
    return { valid: false, reason: 'Access to cloud metadata endpoints is not permitted.' };
  }

  // Resolve hostname to IPs and verify
  try {
    const addresses = await dns.resolve(hostname);
    for (const addr of addresses) {
      for (const pattern of BLOCKED_CIDRS) {
        if (pattern.test(addr)) {
          return { valid: false, reason: `Resolved IP "${addr}" is in a blocked private/internal range.` };
        }
      }
      // Block raw private IP access
      if (net.isIP(hostname)) {
        for (const pattern of BLOCKED_CIDRS) {
          if (pattern.test(hostname)) {
            return { valid: false, reason: `Direct access to private IP "${hostname}" is not permitted.` };
          }
        }
      }
    }
  } catch {
    return { valid: false, reason: `DNS resolution failed for "${hostname}".` };
  }

  return { valid: true };
}
