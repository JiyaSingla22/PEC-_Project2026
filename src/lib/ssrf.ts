import dns from 'dns';
import { promisify } from 'util';
import ipaddr from 'net';

const lookupAsync = promisify(dns.lookup);

/**
 * Checks if an IPv4 or IPv6 string is private, loopback, or reserved.
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  // Normalize IPv6-mapped IPv4
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // IPv4 Checks
  if (ipaddr.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;

    // 0.0.0.0/8 (Broadcast/Current network)
    if (a === 0) return true;
    // 10.0.0.0/8 (Private)
    if (a === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata AWS/GCP/Azure)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 (Private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (a === 192 && b === 168) return true;
    // 224.0.0.0/4 (Multicast)
    if (a >= 224) return true;

    return false;
  }

  // IPv6 Checks
  if (ipaddr.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::' || lower.startsWith('fe80:') || lower.startsWith('fc00:') || lower.startsWith('fd00:')) {
      return true;
    }
    return false;
  }

  return true; // Unknown format, treat as unsafe
}

/**
 * Validates target URL against SSRF attacks before initiating network requests.
 */
export async function validateTargetUrl(rawUrl: string): Promise<{ valid: boolean; reason?: string; resolvedUrl?: URL }> {
  try {
    const parsed = new URL(rawUrl);

    // 1. Protocol validation
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Disallowed protocol: Only HTTP and HTTPS are permitted.' };
    }

    // 2. Port validation (block internal admin/service ports)
    const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    if (![80, 443, 8080, 8443].includes(port)) {
      return { valid: false, reason: `Disallowed port: Port ${port} is restricted.` };
    }

    // 3. Hostname checks for well-known localhost aliases
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === 'metadata.google.internal'
    ) {
      return { valid: false, reason: 'Target hostname targets local or cloud metadata domain.' };
    }

    // 4. DNS resolution verification (detect DNS rebinding or resolving to internal IPs)
    const addresses = await lookupAsync(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateOrReservedIP(addr.address)) {
        return { valid: false, reason: `Target resolves to private or restricted IP address: ${addr.address}` };
      }
    }

    return { valid: true, resolvedUrl: parsed };
  } catch (err: any) {
    return { valid: false, reason: `Invalid URL format or DNS resolution failed: ${err.message}` };
  }
}
