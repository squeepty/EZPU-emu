type TokenType =
  | "number"
  | "identifier"
  | "keyword"
  | "operator"
  | "symbol"
  | "eof";

interface Token {
  type: TokenType;
  value: string;
  line: number;
}

type Program = {
  type: "Program";
  body: Statement[];
};

type Statement =
  | VariableDeclaration
  | Assignment
  | PixelAssignment
  | WhileStatement;

type VariableDeclaration = {
  type: "VariableDeclaration";
  line: number;
  name: string;
  init: Expression;
};

type Assignment = {
  type: "Assignment";
  line: number;
  name: string;
  value: Expression;
};

type PixelAssignment = {
  type: "PixelAssignment";
  line: number;
  x: Expression;
  y: Expression;
  value: Expression;
};

type WhileStatement = {
  type: "WhileStatement";
  line: number;
  condition: Condition;
  body: Statement[];
};

type Condition = ComparisonExpression | Expression;

type ComparisonExpression = {
  type: "ComparisonExpression";
  operator: "==" | "!=" | "<" | ">";
  left: Expression;
  right: Expression;
};

type Expression = BinaryExpression | Identifier | NumericLiteral;

type BinaryExpression = {
  type: "BinaryExpression";
  operator: "+" | "-";
  left: Expression;
  right: Expression;
};

type Identifier = {
  type: "Identifier";
  name: string;
};

type NumericLiteral = {
  type: "NumericLiteral";
  value: number;
};

const KEYWORDS = new Set(["let", "while", "pixel"]);

const REGISTER_NAMES = ["D1", "D2", "D3", "D4"];

export class EZCCompiler {
  private tokens: Token[] = [];
  private position = 0;
  private code: string[] = [];
  private sourceMap: Array<number | null> = [];
  private variables = new Map<string, number>();
  private nextReg = 0;
  private nextLabelId = 0;
  private currentSourceLine: number | null = null;

  public compileToAssembly(source: string): string[] {
    this.tokens = this.lex(source);
    this.position = 0;
    this.code = [];
    this.sourceMap = [];
    this.variables.clear();
    this.nextReg = 0;
    this.nextLabelId = 0;
    this.currentSourceLine = null;

    const program = this.parseProgram();
    this.compileProgram(program);
    return this.code;
  }

  public getAssemblySourceMap(): Array<number | null> {
    return [...this.sourceMap];
  }

  private lex(source: string): Token[] {
    const tokens: Token[] = [];
    let index = 0;
    let line = 1;

    while (index < source.length) {
      const char = source[index];

      if (/\s/.test(char)) {
        if (char === "\n") {
          line += 1;
        }
        index += 1;
        continue;
      }

      if (/[A-Za-z_]/.test(char)) {
        const start = index;
        index += 1;
        while (index < source.length && /[A-Za-z0-9_]/.test(source[index])) {
          index += 1;
        }
        const value = source.slice(start, index);
        const type: TokenType = KEYWORDS.has(value) ? "keyword" : "identifier";
        tokens.push({ type, value, line });
        continue;
      }

      if (/\d/.test(char)) {
        const start = index;
        if (char === "0" && source[index + 1]?.toLowerCase() === "x") {
          index += 2;
          while (index < source.length && /[0-9A-Fa-f]/.test(source[index])) {
            index += 1;
          }
        } else {
          index += 1;
          while (index < source.length && /\d/.test(source[index])) {
            index += 1;
          }
        }
        tokens.push({ type: "number", value: source.slice(start, index), line });
        continue;
      }

      const twoChar = source.slice(index, index + 2);
      if (twoChar === "==" || twoChar === "!=") {
        tokens.push({ type: "operator", value: twoChar, line });
        index += 2;
        continue;
      }

      if (/[+\-<>=]/.test(char)) {
        tokens.push({ type: "operator", value: char, line });
        index += 1;
        continue;
      }

      if (/[(),;{}]/.test(char)) {
        tokens.push({ type: "symbol", value: char, line });
        index += 1;
        continue;
      }

      throw new Error(`Unexpected character '${char}' at position ${index}.`);
    }

    tokens.push({ type: "eof", value: "", line });
    return tokens;
  }

  private current(): Token {
    return this.tokens[this.position];
  }

  private next(): Token {
    return this.tokens[this.position + 1];
  }

  private consume(expected?: string): Token {
    const token = this.current();
    if (expected && token.value !== expected) {
      throw new Error(`Expected '${expected}' but found '${token.value}'.`);
    }
    this.position += 1;
    return token;
  }

  private match(value: string): boolean {
    return this.current().value === value;
  }

  private accept(value: string): boolean {
    if (this.match(value)) {
      this.consume(value);
      return true;
    }
    return false;
  }

  private parseProgram(): Program {
    const body: Statement[] = [];
    while (!this.match("")) {
      body.push(this.parseStatement());
    }
    return { type: "Program", body };
  }

  private parseStatement(): Statement {
    const token = this.current();
    if (token.type === "keyword" && token.value === "let") {
      return this.parseVariableDeclaration();
    }

    if (token.type === "keyword" && token.value === "while") {
      return this.parseWhileStatement();
    }

    if (token.type === "keyword" && token.value === "pixel") {
      return this.parsePixelAssignment();
    }

    if (token.type === "identifier") {
      return this.parseAssignment();
    }

    throw new Error(`Unexpected token '${token.value}' while parsing statement.`);
  }

  private parseVariableDeclaration(): VariableDeclaration {
    const start = this.consume("let");
    const nameToken = this.consume();
    if (nameToken.type !== "identifier") {
      throw new Error(`Expected variable name after let, got '${nameToken.value}'.`);
    }
    this.consume("=");
    const init = this.parseExpression();
    this.consume(";");
    return { type: "VariableDeclaration", line: start.line, name: nameToken.value, init };
  }

  private parseAssignment(): Assignment {
    const nameToken = this.consume();
    if (nameToken.type !== "identifier") {
      throw new Error(`Expected identifier for assignment, got '${nameToken.value}'.`);
    }
    this.consume("=");
    const value = this.parseExpression();
    this.consume(";");
    return { type: "Assignment", line: nameToken.line, name: nameToken.value, value };
  }

  private parsePixelAssignment(): PixelAssignment {
    const start = this.consume("pixel");
    this.consume("(");
    const xExpr = this.parseExpression();
    this.consume(",");
    const yExpr = this.parseExpression();
    this.consume(")");
    this.consume("=");
    const value = this.parseExpression();
    this.consume(";");

    return {
      type: "PixelAssignment",
      line: start.line,
      x: xExpr,
      y: yExpr,
      value,
    };
  }

  private parseWhileStatement(): WhileStatement {
    const start = this.consume("while");
    this.consume("(");
    const condition = this.parseCondition();
    this.consume(")");
    this.consume("{");
    const body: Statement[] = [];
    while (!this.match("}")) {
      body.push(this.parseStatement());
    }
    this.consume("}");
    return { type: "WhileStatement", line: start.line, condition, body };
  }

  private parseCondition(): Condition {
    const left = this.parseExpression();
    const token = this.current();
    if (token.type === "operator" && ["==", "!=", "<", ">"].includes(token.value)) {
      const operator = token.value as ComparisonExpression["operator"];
      this.consume();
      const right = this.parseExpression();
      return { type: "ComparisonExpression", operator, left, right };
    }
    return left;
  }

  private parseExpression(): Expression {
    let expr = this.parseTerm();
    while (this.match("+") || this.match("-")) {
      const operator = this.consume().value as "+" | "-";
      const right = this.parseTerm();
      expr = { type: "BinaryExpression", operator, left: expr, right };
    }
    return expr;
  }

  private parseTerm(): Expression {
    const token = this.current();
    if (token.type === "number") {
      this.consume();
      return { type: "NumericLiteral", value: this.parseNumber(token.value) };
    }

    if (token.type === "identifier") {
      this.consume();
      return { type: "Identifier", name: token.value };
    }

    if (token.value === "(") {
      this.consume("(");
      const expr = this.parseExpression();
      this.consume(")");
      return expr;
    }

    throw new Error(`Unexpected token '${token.value}' while parsing expression.`);
  }

  private parseNumber(value: string): number {
    if (value.toLowerCase().startsWith("0x")) {
      return parseInt(value.slice(2), 16);
    }
    return parseInt(value, 10);
  }

  private compileProgram(program: Program): void {
    for (const statement of program.body) {
      this.compileStatement(statement);
    }
    this.emit("HALT");
  }

  private compileStatement(statement: Statement): void {
    const previousSourceLine = this.currentSourceLine;
    this.currentSourceLine = statement.line;

    try {
      switch (statement.type) {
        case "VariableDeclaration":
          this.allocateVariable(statement.name);
          this.compileExpressionToRegister(statement.init, this.getVariableRegister(statement.name));
          break;
        case "Assignment":
          this.assertVariableDeclared(statement.name);
          this.compileExpressionToRegister(statement.value, this.getVariableRegister(statement.name));
          break;
        case "PixelAssignment": {
          const usedRegs = Array.from(this.variables.values());
          const valueReg = this.getTempRegister(usedRegs);
          usedRegs.push(valueReg);
          this.compileExpressionToRegister(statement.value, valueReg);

          if (this.isNumericLiteral(statement.x) && this.isNumericLiteral(statement.y)) {
            const address = this.compilePixelAddress(statement.x.value, statement.y.value);
            this.emit(`STORE ${REGISTER_NAMES[valueReg]}, [15:${address}]`);
            break;
          }

          let xReg: number | null = null;
          if (!this.isNumericLiteral(statement.x)) {
            xReg = this.getTempRegister(usedRegs);
            usedRegs.push(xReg);
            this.compileExpressionToRegister(statement.x, xReg);
          }

          let yReg: number | null = null;
          if (!this.isNumericLiteral(statement.y)) {
            yReg = this.getTempRegister(usedRegs);
            usedRegs.push(yReg);
            this.compileExpressionToRegister(statement.y, yReg);
          }

          const addressReg = this.getTempRegister(usedRegs);
          this.compilePixelAddressToRegister(addressReg, statement.x, statement.y, xReg, yReg);
          this.emit(`STOREI ${REGISTER_NAMES[valueReg]}, [${REGISTER_NAMES[addressReg]}]`);
          break;
        }
        case "WhileStatement":
          this.compileWhileStatement(statement);
          break;
        default:
          throw new Error(`Unsupported statement type ${(statement as any).type}.`);
      }
    } finally {
      this.currentSourceLine = previousSourceLine;
    }
  }

  private compileWhileStatement(statement: WhileStatement): void {
    const startLabel = this.newLabel("WHILE_START");
    const bodyLabel = this.newLabel("WHILE_BODY");
    const exitLabel = this.newLabel("WHILE_END");

    this.emitLabel(startLabel);
    const previousSourceLine = this.currentSourceLine;
    this.currentSourceLine = statement.line;
    this.compileCondition(statement.condition, bodyLabel, exitLabel);
    this.currentSourceLine = previousSourceLine;

    this.emitLabel(bodyLabel);
    for (const inner of statement.body) {
      this.compileStatement(inner);
    }

    this.currentSourceLine = statement.line;
    this.emit(`JMP ${startLabel}`);
    this.currentSourceLine = previousSourceLine;
    this.emitLabel(exitLabel);
  }

  private compileCondition(condition: Condition, bodyLabel: string, exitLabel: string): void {
    if (condition.type === "ComparisonExpression") {
      this.compileComparisonCondition(condition, bodyLabel, exitLabel);
      return;
    }

    const targetReg =
      condition.type === "Identifier"
        ? this.getVariableRegister(condition.name)
        : this.getTempRegister(this.collectExpressionRegisters(condition));

    const conditionReg = this.compileExpressionToRegister(condition, targetReg);
    const falseLabel = this.newLabel("WHILE_FALSE");
    this.emit(`BEQ ${REGISTER_NAMES[conditionReg]}, 0, ${falseLabel}`);
    this.emit(`JMP ${bodyLabel}`);
    this.emitLabel(falseLabel);
    this.emit(`JMP ${exitLabel}`);
  }

  private compileComparisonCondition(
    condition: ComparisonExpression,
    bodyLabel: string,
    exitLabel: string,
  ): void {
    if (condition.right.type !== "NumericLiteral") {
      throw new Error("Comparison expressions currently support only numeric literals on the right-hand side.");
    }

    const value = condition.right.value;
    let leftReg: number;

    if (condition.left.type === "Identifier") {
      leftReg = this.getVariableRegister(condition.left.name);
    } else {
      const leftRegs = this.collectExpressionRegisters(condition.left);
      const rightRegs = this.collectExpressionRegisters(condition.right);
      leftReg = this.getTempRegister([...leftRegs, ...rightRegs]);
    }

    this.compileExpressionToRegister(condition.left, leftReg);
    const registerName = REGISTER_NAMES[leftReg];

    switch (condition.operator) {
      case "!=": {
        const falseLabel = this.newLabel("WHILE_FALSE");
        this.emit(`BEQ ${registerName}, ${value}, ${falseLabel}`);
        this.emit(`JMP ${bodyLabel}`);
        this.emitLabel(falseLabel);
        this.emit(`JMP ${exitLabel}`);
        break;
      }
      default:
        throw new Error(
          `Comparison operator '${condition.operator}' is not supported for EZC while loops.`,
        );
    }
  }

  private compilePixelAddress(x: number, y: number): number {
    if (x < 0 || x > 3 || y < 0 || y > 3) {
      throw new Error("Pixel coordinates must be between 0 and 3.");
    }
    return y * 4 + x;
  }

  private compilePixelAddressToRegister(
    addressReg: number,
    xExpr: Expression,
    yExpr: Expression,
    xReg: number | null,
    yReg: number | null,
  ): void {
    if (this.isNumericLiteral(xExpr) && this.isNumericLiteral(yExpr)) {
      const address = this.compilePixelAddress(xExpr.value, yExpr.value);
      this.emit(`SET ${REGISTER_NAMES[addressReg]}, ${address}`);
      return;
    }

    if (this.isNumericLiteral(yExpr) && yReg === null) {
      const yValue = yExpr.value;
      this.emit(`SET ${REGISTER_NAMES[addressReg]}, ${yValue * 4}`);
      if (xReg !== null) {
        this.emit(`ADD ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[xReg]}`);
      } else {
        throw new Error("Internal compiler error: x register expected.");
      }
      return;
    }

    if (this.isNumericLiteral(xExpr) && xReg === null) {
      const xValue = xExpr.value;
      this.emit(`MOV ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[yReg!]}`);
      this.emit(`ADD ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[yReg!]}`);
      this.emit(`ADD ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[yReg!]}`);
      this.emit(`ADD ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[yReg!]}`);
      this.emit(`ADDI ${REGISTER_NAMES[addressReg]}, ${xValue}`);
      return;
    }

    if (xReg !== null && yReg !== null) {
      this.emit(`MOV ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[yReg]}`);
      this.emit(`ADD ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[yReg]}`);
      this.emit(`ADD ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[yReg]}`);
      this.emit(`ADD ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[yReg]}`);
      this.emit(`ADD ${REGISTER_NAMES[addressReg]}, ${REGISTER_NAMES[xReg]}`);
      return;
    }

    throw new Error("Internal compiler error: failed to compile dynamic pixel address.");
  }

  private compileExpressionToRegister(expr: Expression, targetReg: number): number {
    if (expr.type === "NumericLiteral") {
      this.emit(`SET ${REGISTER_NAMES[targetReg]}, ${expr.value}`);
      return targetReg;
    }

    if (expr.type === "Identifier") {
      this.assertVariableDeclared(expr.name);
      const source = this.getVariableRegister(expr.name);
      if (source !== targetReg) {
        this.emit(`MOV ${REGISTER_NAMES[targetReg]}, ${REGISTER_NAMES[source]}`);
      }
      return targetReg;
    }

    if (expr.type === "BinaryExpression") {
      const rightIsSimple = expr.right.type === "NumericLiteral" || expr.right.type === "Identifier";
      const rightSourceReg = expr.right.type === "Identifier" ? this.getVariableRegister(expr.right.name) : -1;
      const shouldUseTemp = !rightIsSimple || rightSourceReg === targetReg;
      const leftRegs = this.collectExpressionRegisters(expr.left);

      if (shouldUseTemp) {
        const tempReg = this.getTempRegister([...leftRegs, targetReg]);
        this.compileExpressionToRegister(expr.right, tempReg);
        this.compileExpressionToRegister(expr.left, targetReg);
        this.applyOperator(expr.operator, targetReg, tempReg, expr.right.type === "NumericLiteral" ? expr.right.value : undefined);
        return targetReg;
      }

      this.compileExpressionToRegister(expr.left, targetReg);
      if (expr.right.type === "NumericLiteral") {
        if (expr.operator === "+") {
          this.emit(`ADDI ${REGISTER_NAMES[targetReg]}, ${expr.right.value}`);
        } else {
          this.emit(`SUBI ${REGISTER_NAMES[targetReg]}, ${expr.right.value}`);
        }
      } else if (expr.right.type === "Identifier") {
        const rightReg = this.getVariableRegister(expr.right.name);
        this.applyOperator(expr.operator, targetReg, rightReg);
      } else {
        const temp = this.getTempRegister([...leftRegs, targetReg]);
        this.compileExpressionToRegister(expr.right, temp);
        this.applyOperator(expr.operator, targetReg, temp);
      }
      return targetReg;
    }

    throw new Error(`Unsupported expression type '${(expr as any).type}'.`);
  }

  private isNumericLiteral(expr: Expression): expr is NumericLiteral {
    return expr.type === "NumericLiteral";
  }

  private applyOperator(operator: "+" | "-", targetReg: number, sourceReg: number, literalValue?: number): void {
    if (literalValue !== undefined) {
      if (operator === "+") {
        this.emit(`ADDI ${REGISTER_NAMES[targetReg]}, ${literalValue}`);
      } else {
        this.emit(`SUBI ${REGISTER_NAMES[targetReg]}, ${literalValue}`);
      }
      return;
    }

    if (operator === "+") {
      this.emit(`ADD ${REGISTER_NAMES[targetReg]}, ${REGISTER_NAMES[sourceReg]}`);
    } else {
      this.emit(`SUB ${REGISTER_NAMES[targetReg]}, ${REGISTER_NAMES[sourceReg]}`);
    }
  }

  private collectExpressionRegisters(expr: Expression): number[] {
    const regs = new Set<number>();
    this.walkExpression(expr, regs);
    return Array.from(regs);
  }

  private walkExpression(expr: Expression, regs: Set<number>): void {
    if (expr.type === "Identifier") {
      if (this.variables.has(expr.name)) {
        regs.add(this.getVariableRegister(expr.name));
      }
      return;
    }

    if (expr.type === "BinaryExpression") {
      this.walkExpression(expr.left, regs);
      this.walkExpression(expr.right, regs);
      return;
    }
  }

  private getVariableRegister(name: string): number {
    const reg = this.variables.get(name);
    if (reg === undefined) {
      throw new Error(`Undefined variable '${name}'.`);
    }
    return reg;
  }

  private assertVariableDeclared(name: string): void {
    if (!this.variables.has(name)) {
      throw new Error(`Variable '${name}' has not been declared.`);
    }
  }

  private allocateVariable(name: string): number {
    if (this.variables.has(name)) {
      throw new Error(`Variable '${name}' is already declared.`);
    }

    if (this.nextReg >= REGISTER_NAMES.length) {
      throw new Error("EZC compiler only supports up to 4 variables.");
    }

    const reg = this.nextReg;
    this.variables.set(name, reg);
    this.nextReg += 1;
    return reg;
  }

  private emit(line: string): void {
    this.code.push(line);
    this.sourceMap.push(this.currentSourceLine);
  }

  private emitLabel(label: string): void {
    this.code.push(`${label}:`);
    this.sourceMap.push(null);
  }

  private newLabel(prefix: string): string {
    return `${prefix}_${this.nextLabelId++}`;
  }

  private getTempRegister(exclude: number[]): number {
    for (let reg = 0; reg < REGISTER_NAMES.length; reg += 1) {
      if (!exclude.includes(reg)) {
        return reg;
      }
    }
    throw new Error("No temporary register available for expression compilation.");
  }
}
