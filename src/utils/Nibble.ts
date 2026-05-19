export function toNibble(value: number): number {
  return value & 0xF;
}

export function isValidNibble(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xF;
}
