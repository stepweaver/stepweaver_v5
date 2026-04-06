export function normalizeInput(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function tokenize(normalized: string): string[] {
  return normalized.split(' ').filter(Boolean);
}
