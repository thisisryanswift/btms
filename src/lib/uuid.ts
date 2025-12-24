/**
 * Generate a unique session ID using browser crypto
 */
export function generateSessionId(): string {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a prefixed session ID for different session sources
 * @param source - The source type: 'manual', 'auto', or 'import'
 */
export function generatePrefixedSessionId(source: 'manual' | 'auto' | 'import' = 'manual'): string {
  const uuid = generateSessionId();
  switch (source) {
    case 'auto':
      return `auto_${uuid}`;
    case 'import':
      return `import_${uuid}`;
    default:
      return uuid;
  }
}

/**
 * Generate a URL-safe base64 ID
 */
export function generateShortId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}