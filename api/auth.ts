import crypto from 'crypto';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface Session {
  userId: string;
  refreshToken: string;
  expiresAt: number;
}

// In-memory persistent database store for demo/embedded production
const USERS = new Map<string, User>();
const SESSIONS = new Map<string, Session>();

const JWT_SECRET = process.env.JWT_SECRET || 'incogniread_jwt_production_secret_key_32_chars_min!';

// Cryptographic helpers using Node.js native crypto
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

export function generateJwt(payload: object, expiresInSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Seed a default demo admin user if none exists
if (USERS.size === 0) {
  const { hash, salt } = hashPassword('IncogniRead2026!');
  const adminId = 'usr_admin_001';
  USERS.set('editor@incogniread.com', {
    id: adminId,
    email: 'editor@incogniread.com',
    passwordHash: hash,
    salt,
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  });
}

export default async function authHandler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname.replace(/^\/api\/auth\/?/, '').replace(/^\//, '');

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // 1. POST /api/auth/register
  if (req.method === 'POST' && (pathname === 'register' || pathname === '')) {
    const { email, password } = body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
      return;
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (USERS.has(normalizedEmail)) {
      res.status(409).json({ success: false, error: 'User with this email already exists.' });
      return;
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const user: User = {
      id: userId,
      email: normalizedEmail,
      passwordHash: hash,
      salt,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    USERS.set(normalizedEmail, user);

    const accessToken = generateJwt({ sub: user.id, email: user.email, role: user.role }, 900); // 15m
    const refreshToken = crypto.randomBytes(32).toString('hex');
    SESSIONS.set(refreshToken, {
      userId: user.id,
      refreshToken,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    });

    res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
      accessToken,
      refreshToken,
    });
    return;
  }

  // 2. POST /api/auth/login
  if (req.method === 'POST' && pathname === 'login') {
    const { email, password } = body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = USERS.get(normalizedEmail);
    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const accessToken = generateJwt({ sub: user.id, email: user.email, role: user.role }, 900);
    const refreshToken = crypto.randomBytes(32).toString('hex');
    SESSIONS.set(refreshToken, {
      userId: user.id,
      refreshToken,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    });

    res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
      accessToken,
      refreshToken,
    });
    return;
  }

  // 3. GET /api/auth/me
  if (req.method === 'GET' && pathname === 'me') {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization token required.' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyJwt(token);
    if (!payload) {
      res.status(401).json({ success: false, error: 'Invalid or expired access token.' });
      return;
    }

    // Find user
    const user = Array.from(USERS.values()).find((u) => u.id === payload.sub);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
    });
    return;
  }

  // 4. POST /api/auth/refresh
  if (req.method === 'POST' && pathname === 'refresh') {
    const { refreshToken } = body;
    if (!refreshToken || !SESSIONS.has(refreshToken)) {
      res.status(401).json({ success: false, error: 'Invalid refresh token.' });
      return;
    }

    const session = SESSIONS.get(refreshToken)!;
    if (session.expiresAt < Date.now()) {
      SESSIONS.delete(refreshToken);
      res.status(401).json({ success: false, error: 'Refresh token expired.' });
      return;
    }

    // Rotate refresh token
    SESSIONS.delete(refreshToken);
    const user = Array.from(USERS.values()).find((u) => u.id === session.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User account not found.' });
      return;
    }

    const newAccessToken = generateJwt({ sub: user.id, email: user.email, role: user.role }, 900);
    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    SESSIONS.set(newRefreshToken, {
      userId: user.id,
      refreshToken: newRefreshToken,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    return;
  }

  // 5. POST /api/auth/logout
  if (req.method === 'POST' && pathname === 'logout') {
    const { refreshToken } = body;
    if (refreshToken) {
      SESSIONS.delete(refreshToken);
    }
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
    return;
  }

  res.status(404).json({ success: false, error: `Endpoint /api/auth/${pathname} not found.` });
}
