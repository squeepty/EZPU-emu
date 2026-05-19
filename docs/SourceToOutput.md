# Source → Compiled Assembly → Output

This document explains how the sample program in `src/main.ts` flows from EZC source text to final display output.

## 1. EZC source

The example source used by `main.ts` is:

```ts
let x = 3;
while (x != 0) {
  pixel(0,x) = 1;
  x = x - 1;
}
```

### Meaning

- Declare a variable `x` and initialize it to `3`.
- Repeat while `x != 0`:
  - set the pixel at position `(0,x)` to `1`
  - decrement `x`

This generates a vertical column of pixels in column 0 at rows 3, 2, and 1.

## 2. Compilation to assembly

`EZCCompiler.compileToAssembly(source)` performs:

- lexical analysis
- parsing into statements and expressions
- code generation for variables and control flow
- pixel address generation

For the sample program, the generated assembly looks like:

```asm
SET D1, 3
WHILE_START_0:
BEQ D1, 0, WHILE_FALSE_3
JMP WHILE_BODY_1
WHILE_FALSE_3:
JMP WHILE_END_2
WHILE_BODY_1:
SET D2, 1
MOV D3, D1
MOV D4, D3
ADD D4, D3
ADD D4, D3
ADD D4, D3
ADDI D4, 0
STOREI D2, [D4]
SUBI D1, 1
JMP WHILE_START_0
WHILE_END_2:
HALT
```

### Interpretation

- `SET D1, 3` initializes `x` in register `D1`.
- The loop condition tests `D1 != 0`.
- `STOREI D2, [D4]` writes the pixel value into video memory bank `0xF` using the computed address register `D4`.
- `HALT` stops execution when the loop finishes.

## 3. Assembly to machine code

`Assembler.assemble(assembly)` converts each assembly instruction to a 4-nibble machine word.

Example record format:

- `bank`: instruction bank
- `address`: instruction address within the bank
- `word`: 4-hex-digit machine code

The sample assembled output is:

```text
0:0 -> 7030
0:4 -> 800C
0:8 -> B100
0:C -> B380
1:0 -> 7110
1:4 -> 2200
1:8 -> 2320
1:C -> 3320
2:0 -> 3320
2:4 -> 3320
2:8 -> 4300
2:C -> E130
3:0 -> 6010
3:4 -> B040
3:8 -> C000
```

### Machine code format

Each `word` is encoded as:

- nibble 0: opcode
- nibble 1: register or bank operand
- nibble 2: register, immediate, or address operand
- nibble 3: final address or zero

For example:

- `7030` = `SET D1, 3`
- `E130` = `STOREI D2, [D4]`
- `C000` = `HALT`

## 4. Execution

The assembled records are loaded into memory with `EZPU.loadMachineCode(machineCode)`.

`EZPU.run()` then executes the CPU step-by-step:

- instructions are fetched from the current bank and address
- the CPU executes each opcode
- `incrementPC()` advances the PC by 4 nibbles and carries banks when needed
- execution stops when `HALT` is reached

## 5. Display output

`Display.render(memory)` reads from `Memory.VIDEO_BANK` (bank `0xF`).

It produces a 4×4 text grid where:

- `#` means the pixel value is `1`
- `.` means the pixel value is `0`

For the sample program, the rendered output is:

```text
. . . .
# . . .
# . . .
# . . .
```

This matches the expected pixel column in column 0 for rows 1, 2, and 3.

## 6. End-to-end coupling

The full pipeline is:

1. EZC source (`src/main.ts`)
2. `EZCCompiler` → assembly
3. `Assembler` → `MachineCodeRecord[]`
4. `EZPU.loadMachineCode()` → memory
5. `EZPU.run()` → CPU execution
6. `Display.render()` → textual screen output
