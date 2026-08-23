/** Remove CR/LF/NUL so values cannot be used for email header injection. */
export function stripHeaderUnsafe(value: string): string {
  return value.replace(/[\r\n\0]/g, " ").replace(/\s+/g, " ").trim();
}
