# src/compiler/EZCCompiler.ts

## Responsibility

`EZCCompiler` is a tiny high-level language compiler that converts EZC source into emulator assembly.

It supports:

- variable declarations (`let x = ...;`)
- assignments (`x = ...;`)
- `while` loops
- comparisons for loop conditions
- pixel writes using `pixel(x,y) = value;`
- arithmetic expressions with `+` and `-`

## Language features

### Syntax

- `let <name> = <expression>;`
- `<name> = <expression>;`
- `pixel(<expr>, <expr>) = <expression>;`
- `while (<condition>) { ... }`
- Expressions: numbers, identifiers, `+`, `-`, and nested parentheses
- Conditions: expressions or comparisons using `==`, `!=`, `<`, `>`

### Pixel coordinates

- Constant coordinates compile directly to static video addresses.
- Dynamic coordinates compile to runtime address calculation and use `STOREI`.

## Compiler architecture

### Lexer

- Tokenizes identifiers, keywords, numbers, operators, and symbols.
- Recognizes `==` and `!=` as two-character operators.

### Parser

- Parses a `Program` as a sequence of statements.
- Parses `VariableDeclaration`, `Assignment`, `PixelAssignment`, and `WhileStatement`.
- Parses arithmetic expressions and nested parentheses.
- Allows `pixel(...)` arguments to be any expression.

### AST nodes

- `Program`
- `VariableDeclaration`
- `Assignment`
- `PixelAssignment`
- `WhileStatement`
- `ComparisonExpression`
- `BinaryExpression`
- `Identifier`
- `NumericLiteral`

### Code generation

- Each variable is allocated to one of 4 registers: `D1`..`D4`.
- Generated assembly is stored in `this.code`.
- `compileProgram` appends a final `HALT`.

### Expression compilation

- Numeric values use `SET`.
- Variables use `MOV` if the target register differs.
- Binary expressions generate `ADD`, `SUB`, `ADDI`, `SUBI` as needed.
- Temporary registers are allocated from available registers.

### Loops and conditions

- `while` compiles to labels and conditional branching.
- Non-comparison conditions are treated as `!= 0`.
- Comparison operators currently supported for loop conditions include `!=`.

### Pixel write compilation

- Constant `pixel(x,y)` is converted to `STORE` into `[15:addr]`.
- Dynamic coordinates are converted to a computed address in a register and written with `STOREI`.

## Internals

- `nextReg` tracks the next available register for variables.
- `nextLabelId` creates unique labels for loop start/body/end.
- `getTempRegister(exclude)` allocates a free register while avoiding used registers.

## Limitations

- Only four registers are available for variables and temporaries.
- Comparison conditions currently accept only numeric literals on the right-hand side in `compileComparisonCondition`.
- The compiler is intentionally minimal and targeted for the emulator sample workflow.
