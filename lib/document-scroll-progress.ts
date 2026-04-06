/** Document scroll progress [0, 1] for canvas / parallax. */
export function getDocumentScrollProgressY(): number {
  if (typeof window === "undefined") return 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  const scrollTop = window.scrollY || 0;
  const clamped = Math.min(Math.max(scrollTop, 0), maxScroll);
  return clamped / maxScroll;
}

export function getDocumentScrollProgressX(): number {
  if (typeof window === "undefined") return 0;
  const maxScroll = document.documentElement.scrollWidth - window.innerWidth;
  if (maxScroll <= 0) return 0;
  const scrollLeft = window.scrollX || 0;
  const clamped = Math.min(Math.max(scrollLeft, 0), maxScroll);
  return clamped / maxScroll;
}
