import DOMPurify from 'dompurify';

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
    'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'code',
    'pre', 'img', 'figure', 'figcaption', 'table', 'thead',
    'tbody', 'tr', 'th', 'td', 'hr', 'br', 'span', 'sub', 'sup'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel', 'src', 'alt', 'width',
    'height', 'class', 'loading'
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target', 'rel'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Strips malicious XSS vectors and formats outbound links securely.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';

  // Setup hook to guarantee external links open safely in blank tab with noopener
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer nofollow');
    }
  });

  return String(DOMPurify.sanitize(dirtyHtml, SANITIZE_CONFIG));
}

/**
 * Strips all HTML tags to pure text (ideal for Text-To-Speech audio engine).
 */
export function stripHtmlToPlainText(html: string): string {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = String(DOMPurify.sanitize(html));
  return tempDiv.textContent || tempDiv.innerText || '';
}
