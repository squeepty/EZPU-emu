# EZPU — 4-Bit Fantasy Computer

## Vision

EZPU is a tiny educational fantasy computer designed to teach:

* emulator architecture
* CPU design
* assembly language
* compiler basics
* low-level programming
* memory-mapped graphics

The system intentionally embraces extreme constraints:

* 4-bit architecture
* 256 total memory cells
* 4×4 monochrome display
* fixed-size instructions
* no stack
* no pointers
* no hidden complexity

The goal is not performance.

The goal is complete understandability.

A developer should be able to fully understand:

* the hardware
* the instruction set
* the emulator
* the assembler
* the compiler

within a single weekend.

---

# Core Philosophy

EZPU should feel:

* educational
* retro
* elegant
* weird
* minimalistic
* readable

The project should prioritize:

1. clarity over cleverness
2. explicitness over abstraction
3. documentation over brevity
4. educational value over optimization

---

# Hardware Specification

## Core Architecture

| Component          | Value          |
| ------------------ | -------------- |
| Word Size          | 4 bits         |
| Opcode Size        | 4 bits         |
| Instruction Size   | 4 nibbles      |
| Total Memory       | 256 nibbles    |
| Memory Banks       | 16             |
| Addresses per Bank | 16             |
| Registers          | 4              |
| Display            | 4×4 monochrome |

---

# Memory Layout

Memory is organized as:

```text
16 banks × 16 addresses
```

Each memory cell stores:

```text
1 nibble (4 bits)
```

Addressing format:

```text
[bank:address]
```

Example:

```text
[2:5]
```

---

# Video Memory

Bank:

```text
15 (0xF)
```

is reserved for video RAM.

Display layout:

```text
Addr 0  -> pixel (0,0)
Addr 1  -> pixel (1,0)
Addr 2  -> pixel (2,0)
Addr 3  -> pixel (3,0)

Addr 4  -> pixel (0,1)
...
Addr 15 -> pixel (3,3)
```

Pixel values:

| Value | Meaning |
| ----- | ------- |
| 0     | black   |
| 1     | green   |

---

# Registers

## General Registers

| Binary | Register |
| ------ | -------- |
| 0000   | D1       |
| 0001   | D2       |
| 0010   | D3       |
| 0011   | D4       |

All registers are 4-bit.

Arithmetic wraps automatically:

```text
15 + 1 = 0
0 - 1 = 15
```

---

# Program Counter

The program counter is split into:

| Register | Purpose |
| -------- | ------- |
| PCHIGH   | bank    |
| PCLOW    | address |

Combined:

```text
PC = (PCHIGH << 4) | PCLOW
```

---

# Instruction Format

Every instruction is exactly 4 nibbles:

```text
[ OPCODE ][ ARG1 ][ ARG2 ][ ARG3 ]
```

This ensures:

* trivial fetch logic
* easy decoding
* predictable assembly
* readable machine code

---

# EZPU ISA v1

This document defines the complete instruction set architecture for EZPU v1.

The ISA is intentionally:

* tiny
* fixed-width
* educational
* readable
* deterministic

Every instruction:

* occupies exactly 4 nibbles
* uses a single 4-bit opcode
* executes in a highly predictable way

---

# Design Goals

The EZPU ISA was designed around the following principles:

## 1. Simplicity

A beginner should be able to:

* understand every instruction
* decode machine code manually
* implement the CPU from scratch

without requiring advanced computer architecture knowledge.

---

## 2. Fixed-Width Instructions

Every instruction uses exactly:

```text
4 nibbles
```

Layout:

```text
[ OPCODE ][ ARG1 ][ ARG2 ][ ARG3 ]
```

Advantages:

* trivial fetch logic
* predictable decoding
* easy debugging
* compact assembler implementation
* easy visualization of execution

---

## 3. No Hidden State

EZPU intentionally avoids:

* status flags
* carry registers
* hidden arithmetic state
* implicit memory access

Branch instructions directly evaluate conditions.

This keeps execution logic extremely transparent.

---

## 4. 4-Bit Arithmetic

All values are normalized to:

```text
0-15
```

Equivalent implementation:

```ts
value & 0xF
```

Examples:

```text
15 + 1 = 0
0 - 1 = 15
```

---

# Register Encoding

EZPU contains four general-purpose registers.

| Binary | Decimal | Register |
| ------ | ------- | -------- |
| 0000   | 0       | D1       |
| 0001   | 1       | D2       |
| 0010   | 2       | D3       |
| 0011   | 3       | D4       |

Remaining register values are currently reserved.

---

# Memory Addressing

EZPU memory is organized as:

```text
16 banks × 16 addresses
```

Memory references use:

```text
[bank:address]
```

Example:

```asm
LOAD D1, [2:5]
```

Meaning:

```text
D1 = memory[2][5]
```

---

# Program Counter Behavior

The program counter is split into:

| Register | Purpose |
| -------- | ------- |
| PCHIGH   | bank    |
| PCLOW    | address |

Combined:

```text
PC = (PCHIGH << 4) | PCLOW
```

Normal execution advances by:

```text
PCLOW += 4
```

unless modified by:

* JMP
* BEQ
* BGT
* BLT
* HALT

---

# Instruction Table

| Opcode | Mnemonic | Description           |
| ------ | -------- | --------------------- |
| 0000   | LOAD     | memory → register     |
| 0001   | STORE    | register → memory     |
| 0010   | MOV      | register copy         |
| 0011   | ADD      | register arithmetic   |
| 0100   | ADDI     | immediate arithmetic  |
| 0101   | SUB      | register subtraction  |
| 0110   | SUBI     | immediate subtraction |
| 0111   | SET      | immediate assignment  |
| 1000   | BEQ      | branch if equal       |
| 1001   | BGT      | branch if greater     |
| 1010   | BLT      | branch if lower       |
| 1011   | JMP      | absolute jump         |
| 1100   | HALT     | stop execution        |
| 1101   | NOP      | no operation          |
| 1110   | RESERVED | future expansion      |
| 1111   | RESERVED | future expansion      |

---

# Instruction Reference

---

# 0000 — LOAD

Load memory into register.

## Assembly Syntax

```asm
LOAD reg, [bank:addr]
```

## Binary Layout

```text
[0000][REG][BANK][ADDR]
```

## Example

```asm
LOAD D1, [2:5]
```

Machine code:

```text
0000 0000 0010 0101
```

## Semantics

```text
REG = MEMORY[BANK][ADDR]
```

## TypeScript Equivalent

```ts
register = memory.read(bank, addr);
```

---

# 0001 — STORE

Store register value into memory.

## Assembly Syntax

```asm
STORE reg, [bank:addr]
```

## Binary Layout

```text
[0001][REG][BANK][ADDR]
```

## Example

```asm
STORE D1, [15:0]
```

## Semantics

```text
MEMORY[BANK][ADDR] = REG
```

## TypeScript Equivalent

```ts
memory.write(bank, addr, register);
```

---

# 0010 — MOV

Copy one register into another.

## Assembly Syntax

```asm
MOV dst, src
```

## Binary Layout

```text
[0010][DST][SRC][0000]
```

## Example

```asm
MOV D1, D2
```

## Semantics

```text
DST = SRC
```

---

# 0011 — ADD

Add register value to another register.

## Assembly Syntax

```asm
ADD dst, src
```

## Binary Layout

```text
[0011][DST][SRC][0000]
```

## Example

```asm
ADD D1, D2
```

## Semantics

```text
DST = DST + SRC
```

Arithmetic wraps automatically to 4 bits.

---

# 0100 — ADDI

Add immediate value to register.

## Assembly Syntax

```asm
ADDI reg, value
```

## Binary Layout

```text
[0100][REG][VALUE][0000]
```

## Example

```asm
ADDI D1, 1
```

## Semantics

```text
REG = REG + VALUE
```

---

# 0101 — SUB

Subtract register value from another register.

## Assembly Syntax

```asm
SUB dst, src
```

## Binary Layout

```text
[0101][DST][SRC][0000]
```

## Example

```asm
SUB D1, D2
```

## Semantics

```text
DST = DST - SRC
```

Arithmetic wraps automatically to 4 bits.

---

# 0110 — SUBI

Subtract immediate value from register.

## Assembly Syntax

```asm
SUBI reg, value
```

## Binary Layout

```text
[0110][REG][VALUE][0000]
```

## Example

```asm
SUBI D1, 1
```

## Semantics

```text
REG = REG - VALUE
```

---

# 0111 — SET

Set register to immediate value.

## Assembly Syntax

```asm
SET reg, value
```

## Binary Layout

```text
[0111][REG][VALUE][0000]
```

## Example

```asm
SET D1, 5
```

## Semantics

```text
REG = VALUE
```

---

# 1000 — BEQ

Branch if register equals value.

Branches only modify:

```text
PCLOW
```

Execution remains inside current bank.

## Assembly Syntax

```asm
BEQ reg, value, addr
```

## Binary Layout

```text
[1000][REG][VALUE][ADDR]
```

## Example

```asm
BEQ D1, 5, 12
```

## Semantics

```text
if REG == VALUE:
    PCLOW = ADDR
```

---

# 1001 — BGT

Branch if register is greater than value.

## Assembly Syntax

```asm
BGT reg, value, addr
```

## Binary Layout

```text
[1001][REG][VALUE][ADDR]
```

## Example

```asm
BGT D1, 7, 8
```

## Semantics

```text
if REG > VALUE:
    PCLOW = ADDR
```

---

# 1010 — BLT

Branch if register is lower than value.

## Assembly Syntax

```asm
BLT reg, value, addr
```

## Binary Layout

```text
[1010][REG][VALUE][ADDR]
```

## Example

```asm
BLT D1, 3, 4
```

## Semantics

```text
if REG < VALUE:
    PCLOW = ADDR
```

---

# 1011 — JMP

Jump to absolute address.

## Assembly Syntax

```asm
JMP bank, addr
```

## Binary Layout

```text
[1011][BANK][ADDR][0000]
```

## Example

```asm
JMP 2, 8
```

## Semantics

```text
PCHIGH = BANK
PCLOW  = ADDR
```

---

# 1100 — HALT

Stop CPU execution.

## Assembly Syntax

```asm
HALT
```

## Binary Layout

```text
[1100][0000][0000][0000]
```

## Semantics

```text
CPU execution stops.
```

The emulator should stop calling:

```ts
cpu.step()
```

---

# 1101 — NOP

No operation.

## Assembly Syntax

```asm
NOP
```

## Binary Layout

```text
[1101][0000][0000][0000]
```

## Semantics

CPU performs no action.

Program counter advances normally.

Useful for:

* timing
* debugging
* alignment
* future patching

---

# Reserved Opcodes

## 1110

Reserved for future expansion.

Potential uses:

* AND
* OR
* XOR
* RNG
* SOUND

---

## 1111

Reserved for future expansion.

Potential uses:

* extended instructions
* interrupts
* sprites
* operating system hooks

---

# Example Program

## Fill Top Row Of Screen

### Assembly

```asm
SET D1, 1

STORE D1, [15:0]
STORE D1, [15:1]
STORE D1, [15:2]
STORE D1, [15:3]

HALT
```

---

## Corresponding Machine Code

```text
7010
10F0
10F1
10F2
10F3
C000
```

---

# CPU Execution Cycle

Each cycle:

```text
1. Fetch instruction
2. Decode opcode
3. Execute instruction
4. Advance program counter
```

---

# Emulator Design Notes

The reference emulator should favor:

* switch-case decoding
* explicit instruction handlers
* highly commented code
* beginner readability

Preferred approach:

```ts
switch(opcode)
```

instead of:

* dynamic dispatch
* metaprogramming
* reflection
* decorators

---

# Educational Philosophy

EZPU intentionally avoids:

* stack management
* indirect addressing
* pointers
* status flags
* interrupts
* multiplication/division
* variable instruction sizes

This keeps the architecture:

* fully understandable
* small enough to visualize mentally
* ideal for emulator education
* approachable for beginners

---

# Assembly Language

## Example Syntax

```asm
SET D1, 1
STORE D1, [15:0]
JMP 0, 0
```

---

# Assembly Design Goals

EZASM should:

* map almost 1:1 to hardware
* remain readable
* avoid hidden behavior
* use labels for jumps
* avoid macros initially

---

# High-Level Language

Future compiler target:

EZC

Example:

```c
let x = 1;

while (1) {
    pixel(0,0) = x;
    x = x + 1;
}
```

Compiler pipeline:

```text
EZC
 ↓
Tokenizer
 ↓
Parser
 ↓
AST
 ↓
EZASM
 ↓
Assembler
 ↓
Machine Code
```

---

# Recommended Repository Structure

```text
EZPU/
 ├── docs/
 │    ├── ISA.md
 │    ├── memory.md
 │    ├── assembly.md
 │    └── compiler.md
 │
 ├── src/
 │    ├── cpu/
 │    │    ├── CPU.ts
 │    │    ├── Instruction.ts
 │    │    └── Registers.ts
 │    │
 │    ├── memory/
 │    │    └── Memory.ts
 │    │
 │    ├── display/
 │    │    └── Display.ts
 │    │
 │    ├── assembler/
 │    │    ├── Tokenizer.ts
 │    │    ├── Parser.ts
 │    │    └── Assembler.ts
 │    │
 │    ├── compiler/
 │    │    └── EZCCompiler.ts
 │    │
 │    ├── utils/
 │    │    └── Nibble.ts
 │    │
 │    ├── roms/
 │    │    ├── blink.ez
 │    │    └── fill_screen.ez
 │    │
 │    ├── EZPU.ts
 │    └── main.ts
 │
 ├── package.json
 ├── tsconfig.json
 └── README.md
```

---

# Fundamental Classes

## Memory

Responsibilities:

* store 256 nibbles
* read/write memory
* validate values
* translate bank/address pairs

Core API:

```ts
read(bank, addr)
write(bank, addr, value)
```

---

## CPU

Responsibilities:

* register state
* fetch/decode/execute
* arithmetic
* branching
* PC management

Core API:

```ts
step()
fetch()
execute()
```

---

## Display

Responsibilities:

* read VRAM
* render framebuffer
* terminal output initially
* canvas renderer later

Core API:

```ts
render(memory)
```

---

## EZPU

Top-level machine object.

Responsibilities:

* coordinate components
* reset state
* machine lifecycle

Structure:

```ts
class EZPU {
    memory
    cpu
    display
}
```

---

# Emulator Architecture

## CPU Execution Loop

```ts
step(): void {

    const instruction = this.fetch();

    switch (instruction.opcode) {

        case 0x0:
            this.opLOAD(instruction);
            break;

        case 0x1:
            this.opSTORE(instruction);
            break;

        case 0x2:
            this.opMOV(instruction);
            break;

        case 0x3:
            this.opADD(instruction);
            break;

        case 0x4:
            this.opADDI(instruction);
            break;

        case 0xB:
            this.opJMP(instruction);
            return;

        case 0xC:
            this.halted = true;
            return;

        default:
            throw new Error("Unknown opcode");
    }

    this.incrementPC();
}
```

---

# Development Rules

## Important Principles

### 1. Avoid Cleverness

Prefer:

```ts
switch(opcode)
```

over:

* reflection
* decorators
* dynamic dispatch
* metaprogramming

---

### 2. Document Everything

Every instruction handler should contain:

* encoding
* examples
* semantics
* binary layout

Example:

```ts
/**
 * Opcode: 0111
 *
 * SET
 *
 * Layout:
 * [0111][REG][VALUE][0000]
 *
 * Example:
 * SET D1, 5
 */
```

---

### 3. Normalize All Values

Everything is 4-bit.

Always mask:

```ts
value & 0xF
```

---

### 4. Keep Bank/Address Explicit

Prefer:

```ts
memory.read(bank, addr)
```

instead of:

```ts
memory.readAbsolute(address)
```

This reinforces the fantasy architecture.

---

# Initial Milestone Plan

## Milestone 1 — Core Emulator

Implement:

* Memory
* CPU
* Display
* SET
* STORE
* ADDI
* JMP
* HALT

Goal:

Render pixels and execute loops.

---

## Milestone 2 — Full ISA

Implement:

* LOAD
* MOV
* ADD
* SUB
* BEQ
* BGT
* BLT
* NOP

Goal:

Fully operational fantasy CPU.

---

## Milestone 3 — Assembler

Implement:

* tokenizer
* parser
* labels
* machine code generation

Goal:

Human-readable programs.

---

## Milestone 4 — Debugger

Implement:

* register dump
* memory dump
* step execution
* breakpoints

Goal:

Educational introspection.

---

## Milestone 5 — EZC Compiler

Implement:

* variables
* loops
* conditions
* pixel syntax

Goal:

Tiny high-level language.

---

# Suggested Example Programs

## Initial ROMs

* fill screen
* blinking pixel
* moving pixel
* bouncing pixel
* counter
* checkerboard
* Conway-like automata

---

# Recommended VS Code Setup

## Extensions

* GitHub Copilot
* ESLint
* Prettier
* Error Lens

---

# TypeScript Configuration

Enable strict mode:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

# Long-Term Vision

Potential future additions:

* sound bank
* sprites
* random instruction
* browser renderer
* debugger UI
* web IDE
* ROM cartridges
* fantasy operating system
* educational website

But the core project should remain:

* tiny
* readable
* fully understandable
* deeply documented
* approachable to beginners
