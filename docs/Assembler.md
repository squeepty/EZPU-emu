# src/assembler/Assembler.ts

## Responsibility

`src/assembler/Assembler.ts` is a thin wrapper around the assembly parser and code generator.

It exposes one public method:

- `assemble(source: string | string[]): MachineCodeRecord[]`

## Behavior

- Accepts either a single assembly string or an array of assembly lines.
- Joins arrays into a single source string when needed.
- Parses assembly text with `parseAssembly`.
- Generates machine code with `assembleParsed`.
- Returns an array of `MachineCodeRecord` objects.

## Output format

Each `MachineCodeRecord` contains:

- `bank`: the memory bank the instruction belongs to
- `address`: the 4-nibble instruction address within that bank
- `word`: the assembled 4-nibble machine word in hex

## Role in the pipeline

This module sits between the EZC compiler and the emulator loader.
It converts readable assembly into the structured machine code format required by `EZPU.loadMachineCode()`.
