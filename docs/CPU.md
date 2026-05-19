# src/cpu/CPU.ts

## Responsibility

`src/cpu/CPU.ts` defines the EZPU central processor and its instruction set.

It executes instructions stored in `Memory` and exposes a simple register and PC model.

## State

- `registers`: four 4-bit registers `D1`..`D4`
- `pchigh`: current memory bank
- `pclow`: current address within the bank
- `halted`: execution state flag
- `memory`: reference to `Memory`

## Execution model

### `step()`

- Reads four consecutive nibbles from memory starting at the current PC.
- Decodes the opcode and operands.
- Executes the corresponding operation.

### `fetchNibble(offset)`

- Reads a nibble from the current bank at `pclow + offset`.
- Normalizes the address modulo 16.

### `incrementPC()`

- Advances the PC by 4 nibbles.
- Carries to the next bank when the address value exceeds `0xF`.

## Supported opcodes

| Opcode | Description |
| --- | --- |
| `LOAD` | Load memory into register |
| `STORE` | Store register into memory |
| `STOREI` | Store register into video bank using indirect register address |
| `MOV` | Copy register |
| `ADD` | Add two registers |
| `ADDI` | Add immediate to register |
| `SUB` | Subtract register from register |
| `SUBI` | Subtract immediate from register |
| `SET` | Load constant into register |
| `BEQ` | Branch if register equals immediate |
| `BGT` | Branch if register greater than immediate |
| `BLT` | Branch if register less than immediate |
| `JMP` | Unconditional jump with explicit bank/address |
| `HALT` | Stop execution |
| `NOP` | No operation |

## Register handling

- Registers are validated as indices 0–3.
- Values are kept as 4-bit nibbles using `toNibble`.

## Special instructions

### `opSTOREI(reg, addrReg)`

- Reads the target address from `addrReg`.
- Masks the resulting address to 4 bits.
- Writes to `Memory.VIDEO_BANK` at that address.

### Branch instructions

- `BEQ`, `BGT`, and `BLT` compare a register against an immediate value.
- If the condition is false, execution continues by incrementing the PC.
- If the condition is true, the low nibble of the PC is set to the branch target.

## Notes

- `JMP` changes both bank and address.
- `HALT` sets the halted flag so `EZPU.run()` stops.
