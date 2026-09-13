export const SECURITY_HEADERS: Record<string, string> = {
  // Content Security Policy permitting WebGL, Three.js shaders, inline styles, audio blobs, and wss: Live API
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' wss: https:",
    "media-src 'self' blob:",
    "frame-ancestors 'none'",
  ].join("; "),
  // Strict Transport Security (HSTS)
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  // MIME sniffing prevention
  "X-Content-Type-Options": "nosniff",
  // Clickjacking mitigation
  "X-Frame-Options": "DENY",
  // Legacy XSS filter protection
  "X-XSS-Protection": "1; mode=block",
  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Hardware Permissions Policy
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=()",
};

/**
 * Applies standard security headers to a Response object.
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}
