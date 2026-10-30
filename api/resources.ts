import crypto from 'crypto';
import { verifyJwt } from './auth';

interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  feedTitle: string;
  category: string;
  authorId: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

// In-memory data store for resources
const RESOURCES = new Map<string, ResourceItem>();

// Seed initial items if empty
if (RESOURCES.size === 0) {
  RESOURCES.set('res_001', {
    id: 'res_001',
    title: 'The Architecture of Decentralized Offline RSS Readers',
    slug: 'architecture-offline-rss-readers',
    excerpt: 'How client-side IndexedDB caching and Web Speech API enable zero-cloud tracking for digital journalism.',
    content: 'In-browser feed parsing eliminates the need for centralized servers to observe user reading habits. By coupling DOMPurify sanitization with IndexedDB persistence, readers retain absolute sovereignty over their data.',
    feedTitle: 'IncogniRead Engineering',
    category: 'Engineering & Privacy',
    authorId: 'usr_admin_001',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  });
  RESOURCES.set('res_002', {
    id: 'res_002',
    title: 'Defending Local Subnets: Modern SSRF Mitigation in Feed Relays',
    slug: 'defending-local-subnets-ssrf',
    excerpt: 'Preventing malicious feed XML payloads from probing internal cloud metadata and private IP address ranges.',
    content: 'Server-Side Request Forgery remains one of the primary vulnerabilities in open RSS readers. By implementing strict IP resolution blacklists and payload size ceilings, edge proxies isolate local host interfaces.',
    feedTitle: 'Security Dispatch',
    category: 'Cybersecurity',
    authorId: 'usr_admin_001',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export default async function resourcesHandler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const cleanPath = urlObj.pathname.replace(/^\/api\/resources\/?/, '').replace(/^\//, '');
  const resourceId = cleanPath.length > 0 ? cleanPath : null;

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // Helper to extract JWT user
  const getUserFromToken = () => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return verifyJwt(authHeader.substring(7));
  };

  // 1. GET /api/resources (List with pagination & search)
  if (req.method === 'GET' && !resourceId) {
    const page = Math.max(1, parseInt(urlObj.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(urlObj.searchParams.get('limit') || '10', 10)));
    const search = (urlObj.searchParams.get('search') || '').toLowerCase().trim();
    const category = urlObj.searchParams.get('category');

    let allItems = Array.from(RESOURCES.values()).filter((r) => r.status === 'PUBLISHED');

    if (category) {
      allItems = allItems.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      allItems = allItems.filter(
        (r) =>
          r.title.toLowerCase().includes(search) ||
          r.excerpt.toLowerCase().includes(search) ||
          r.feedTitle.toLowerCase().includes(search)
      );
    }

    const total = allItems.length;
    const startIndex = (page - 1) * limit;
    const items = allItems.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return;
  }

  // 2. GET /api/resources/:id (Get single item)
  if (req.method === 'GET' && resourceId) {
    const resource = RESOURCES.get(resourceId);
    if (!resource || resource.status === 'ARCHIVED') {
      res.status(404).json({ success: false, error: 'Resource not found.' });
      return;
    }
    res.status(200).json({ success: true, resource });
    return;
  }

  // 3. POST /api/resources (Create new item - requires Auth)
  if (req.method === 'POST') {
    const user = getUserFromToken();
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required to publish dispatches.' });
      return;
    }

    const { title, excerpt, content, feedTitle, category } = body;
    if (!title || !content) {
      res.status(400).json({ success: false, error: 'Title and content are required.' });
      return;
    }

    const newId = `res_${crypto.randomBytes(6).toString('hex')}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newResource: ResourceItem = {
      id: newId,
      title: title.trim(),
      slug: `${slug}-${Date.now().toString(36)}`,
      excerpt: excerpt?.trim() || content.substring(0, 160) + '...',
      content: content.trim(),
      feedTitle: feedTitle?.trim() || 'Community Dispatch',
      category: category?.trim() || 'General',
      authorId: user.sub,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    RESOURCES.set(newId, newResource);
    res.status(201).json({ success: true, resource: newResource });
    return;
  }

  // 4. PUT /api/resources/:id (Update item - requires Auth & Ownership)
  if (req.method === 'PUT' && resourceId) {
    const user = getUserFromToken();
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const resource = RESOURCES.get(resourceId);
    if (!resource) {
      res.status(404).json({ success: false, error: 'Resource not found.' });
      return;
    }

    if (resource.authorId !== user.sub && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Forbidden: You do not own this resource.' });
      return;
    }

    const { title, excerpt, content, category } = body;
    const updated: ResourceItem = {
      ...resource,
      title: title?.trim() || resource.title,
      excerpt: excerpt?.trim() || resource.excerpt,
      content: content?.trim() || resource.content,
      category: category?.trim() || resource.category,
      updatedAt: new Date().toISOString(),
    };

    RESOURCES.set(resourceId, updated);
    res.status(200).json({ success: true, resource: updated });
    return;
  }

  // 5. DELETE /api/resources/:id (Soft delete)
  if (req.method === 'DELETE' && resourceId) {
    const user = getUserFromToken();
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const resource = RESOURCES.get(resourceId);
    if (!resource) {
      res.status(404).json({ success: false, error: 'Resource not found.' });
      return;
    }

    if (resource.authorId !== user.sub && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Forbidden.' });
      return;
    }

    resource.status = 'ARCHIVED';
    RESOURCES.set(resourceId, resource);
    res.status(200).json({ success: true, message: 'Resource archived successfully.' });
    return;
  }

  res.status(405).json({ success: false, error: 'Method Not Allowed.' });
}
