# src/EZPU.ts

## Responsibility

`src/EZPU.ts` defines the top-level virtual machine that wires together:

- `Memory`
- `CPU`
- `Display`

It is the emulator shell used by the runtime to load code and execute it.

## Public API

### `new EZPU()`
Creates a fresh machine with separate memory, CPU, and display subsystems.

### `reset()`
Resets memory and CPU state to an initial zeroed state.

### `loadMachineCode(lines)`
Loads machine code into emulator memory.

- Accepts either:
  - `string[]` of 4-digit hex words, or
  - `MachineCodeRecord[]` produced by the `Assembler`.
- Validates that each record contains exactly 4 nibbles.
- Validates instruction alignment: instructions must start at addresses divisible by 4.
- Writes each nibble into the correct bank and address.

### `run(maxCycles = 1024)`
Executes CPU steps until the CPU halts or `maxCycles` is reached.

- Increments cycles on each `CPU.step()`.
- Throws when maximum cycles are exceeded to prevent infinite loops.

### `renderScreen()`
Calls `Display.render(memory)` to convert the video bank into a 4×4 text screen.

## Machine structure

- The `memory` object is a 16-bank × 16-address nibble memory.
- The `cpu` object executes instructions from that memory.
- The `display` reads the video bank at runtime.

## Notes

- `loadMachineCode` resets memory and CPU before loading.
- The emulator uses banked memory, and the loader supports both plain hex and structured machine records.
