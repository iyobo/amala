export function isClass(type) {
  return type?.prototype?.constructor && type?.prototype?.constructor?.name !== 'Object';
}

export function ensureArray<T>(item: T | T[]): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}