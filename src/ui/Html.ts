export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function hexNibble(value: number): string {
  return value.toString(16).toUpperCase();
}

export function hexByte(value: number): string {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

export function binaryNibble(value: number): string {
  return (value & 0xf).toString(2).padStart(4, "0");
}

