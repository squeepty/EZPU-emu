# src/main.ts

## Responsibility

`src/main.ts` is the demo entry point for the emulator and compiler pipeline.
It coordinates the full flow from EZC source text to rendered display output.

## Key steps

1. Define high-level EZC source in the `source` string.
2. Instantiate `EZCCompiler` and compile EZC to assembly text.
3. Instantiate `Assembler` and assemble the generated assembly into machine code records.
4. Create an `EZPU` machine instance.
5. Load the machine code into memory with `machine.loadMachineCode(machineCode)`.
6. Execute the program with `machine.run()`.
7. Render and print the display output with `machine.renderScreen()`.

## Important details

- `main.ts` is not a parser or emulator itself. It is a harness that demonstrates and validates the other subsystems.
- It prints three major stages:
  - EZC source input
  - generated assembly
  - assembled machine code records
  - final rendered display

## Example flow

```ts
const compiler = new EZCCompiler();
const assembly = compiler.compileToAssembly(source);
const assembler = new Assembler();
const machineCode = assembler.assemble(assembly);
const machine = new EZPU();
machine.loadMachineCode(machineCode);
machine.run();
console.log(machine.renderScreen());
```
