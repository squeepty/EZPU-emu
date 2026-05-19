# src/memory/Memory.ts

## Responsibility

`src/memory/Memory.ts` implements the emulator memory model.
It stores 16 banks of 16 nibbles each, for a total of 256 memory cells.

## Constants

- `BANK_COUNT = 16`
- `ADDRESS_COUNT = 16`
- `TOTAL_CELLS = 256`
- `VIDEO_BANK = 0xF` (bank 15 is reserved for display pixels)

## Internal representation

- Memory is represented as a single flat array of `number` values.
- Each cell is a 4-bit nibble.
- `toIndex(bank, address)` converts bank/address into a flat index.

## Public methods

### `read(bank, address)`
- Validates bank and address bounds.
- Returns the nibble stored at the location.

### `write(bank, address, value)`
- Validates bank and address bounds.
- Validates that `value` is a 4-bit nibble.
- Stores the nibble after normalization.

### `reset()`
- Zeros all memory cells.

### `dump()`
- Returns a copy of all memory cell values as an array.

## Validation

- `validateBank(bank)` ensures bank is 0–15.
- `validateAddress(address)` ensures address is 0–15.
- `isValidNibble(value)` is used to enforce nibble storage.
