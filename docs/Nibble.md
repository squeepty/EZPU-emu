# src/utils/Nibble.ts

## Responsibility

`src/utils/Nibble.ts` provides low-level helpers for working with 4-bit values.

## Exports

### `toNibble(value)`
- Returns `value & 0xF`.
- Normalizes any number to its lowest 4 bits.

### `isValidNibble(value)`
- Returns `true` when `value` is an integer between `0` and `0xF`.

## Role

These helpers are used by the CPU and memory layer to ensure that all register and memory values remain within the expected 4-bit range.
