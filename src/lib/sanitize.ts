import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes learning content HTML. Only allows the tags that renderBody() emits:
 * <strong> for bold, <code> for inline code. Everything else is stripped —
 * including <script>, event handlers, and raw HTML from untrusted sources.
 */
export function sanitizeLearningHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'code'],
    ALLOWED_ATTR: ['class'],
  });
}
