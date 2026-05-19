# src/assembler/Parser.ts

## Responsibility

`src/assembler/Parser.ts` parses custom assembly and turns it into machine code records.

It provides two functions:

- `parseAssembly(source)`
- `assembleParsed(instructions, labels)`

## Parsing phase

`parseAssembly` performs:

- comment stripping for `;` and `//`
- label detection (`name:`)
- `ORG bank:addr` directives to set the instruction origin
- tokenization of opcode and arguments
- validation of known opcodes
- address tracking in 4-nibble steps

### Instruction model

Parsed instructions are represented as:

- `opcode`
- `args`
- `lineNumber`
- `address`
- `text`

### Labels

- Label declarations record the current address.
- Label addresses encode bank and offset in a single byte.
- Branch labels within `BEQ`, `BGT`, and `BLT` must stay in the same bank.
- `JMP` supports both label and explicit bank:address forms.

## Assembly generation phase

`assembleParsed` converts parsed instructions into `MachineCodeRecord[]`.

Supported opcodes:

- `LOAD reg, [bank:addr]`
- `STORE reg, [bank:addr]`
- `STOREI reg, [D1|D2|D3|D4]`
- `MOV dst, src`
- `ADD dst, src`
- `ADDI reg, value`
- `SUB dst, src`
- `SUBI reg, value`
- `SET reg, value`
- `BEQ reg, value, target`
- `BGT reg, value, target`
- `BLT reg, value, target`
- `JMP label`
- `JMP bank addr`
- `HALT`
- `NOP`

### Special parsing rules

- Registers are normalized to `D1`..`D4`.
- Numeric arguments support decimal, single hex nibble, and `0x` hex notation.
- Memory references require `[bank:addr]` notation.
- `STOREI` uses an indirect register address like `[D1]`.
- Branch targets are validated for correct alignment and bank constraints.

## Output

Each record contains:

- `bank`
- `address`
- `word` (4 hex nibbles)

This form is directly consumable by the emulator loader.
