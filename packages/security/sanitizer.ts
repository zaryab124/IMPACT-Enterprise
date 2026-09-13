/**
 * Strips dangerous HTML tags, javascript: URIs, and event handlers.
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // 1. Remove script, iframe, object, embed tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");

  // 2. Remove javascript: and data: text/html URIs
  sanitized = sanitized.replace(/javascript\s*:/gi, "");
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, "");

  // 3. Remove inline event handlers (e.g. onload, onerror, onclick)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, "");

  return sanitized.trim();
}

/**
 * Recursively walks an object or array and sanitizes all string properties.
 */
export function sanitizeObject<T>(target: T): T {
  if (target === null || target === undefined) {
    return target;
  }

  if (typeof target === "string") {
    return sanitizeString(target) as unknown as T;
  }

  if (Array.isArray(target)) {
    return target.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof target === "object") {
    const copy: any = {};
    for (const [key, value] of Object.entries(target as Record<string, any>)) {
      copy[key] = sanitizeObject(value);
    }
    return copy;
  }

  return target;
}

/**
 * Heuristic detector for obvious SQL injection attempts in string inputs.
 */
export function detectSqlInjection(input: string): boolean {
  if (!input || typeof input !== "string") return false;

  const patterns = [
    /(\bunion\s+select\b)/i,
    /(\bselect\s+.*\s+from\s+)/i,
    /(\bdrop\s+table\b)/i,
    /(\balter\s+table\b)/i,
    /(\bdelete\s+from\b)/i,
    /(\binsert\s+into\b)/i,
    /(;\s*--)/i,
    /('\s*or\s+'?1'?\s*=\s*'?1)/i,
    /("\s*or\s+"?1"?\s*=\s*"?1)/i,
    /(\bor\s+1=1\b)/i,
    /(\bexec(\s|\+)+(s|x)p\w+)/i,
  ];

  return patterns.some((p) => p.test(input));
}
