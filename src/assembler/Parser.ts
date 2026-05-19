export type ParsedInstruction = {
  opcode: string;
  args: string[];
  lineNumber: number;
  address: number;
  text: string;
};

export type LabelMap = Record<string, number>;

export type MachineCodeRecord = {
  bank: number;
  address: number;
  word: string;
};

const REGISTER_MAP: Record<string, number> = {
  D1: 0,
  D2: 1,
  D3: 2,
  D4: 3,
};

const OPCODE_TO_CODE: Record<string, number> = {
  LOAD: 0x0,
  STORE: 0x1,
  MOV: 0x2,
  ADD: 0x3,
  ADDI: 0x4,
  SUB: 0x5,
  SUBI: 0x6,
  SET: 0x7,
  BEQ: 0x8,
  BGT: 0x9,
  BLT: 0xA,
  JMP: 0xB,
  HALT: 0xC,
  NOP: 0xD,
  STOREI: 0xE,
};

function stripComments(line: string): string {
  return line.replace(/;.*$/, "").replace(/\/\/.*$/, "").trim();
}

function isLabelLine(line: string): string | null {
  const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*:$/.exec(line);
  return match ? match[1] : null;
}

function isRegister(token: string): boolean {
  return Object.prototype.hasOwnProperty.call(REGISTER_MAP, token.toUpperCase());
}

function parseRegister(token: string, lineNumber: number): number {
  const normalized = token.toUpperCase();
  if (!isRegister(normalized)) {
    throw new Error(`Invalid register '${token}' on line ${lineNumber}. Expected D1-D4.`);
  }
  return REGISTER_MAP[normalized];
}

function parseNumber(token: string, lineNumber: number): number {
  const normalized = token.trim();

  if (/^0x[0-9A-Fa-f]+$/.test(normalized)) {
    return parseInt(normalized.slice(2), 16);
  }

  if (/^[0-9]+$/.test(normalized)) {
    return parseInt(normalized, 10);
  }

  if (/^[0-9A-Fa-f]$/.test(normalized)) {
    return parseInt(normalized, 16);
  }

  throw new Error(`Invalid numeric constant '${token}' on line ${lineNumber}.`);
}

function parseNibble(token: string, lineNumber: number): number {
  const value = parseNumber(token, lineNumber);
  if (value < 0 || value > 0xf) {
    throw new Error(`Value must be a 4-bit nibble (0-15): '${token}' on line ${lineNumber}.`);
  }
  return value;
}

function parseBankAddress(token: string, lineNumber: number): [number, number] {
  const match = /^([0-9A-Fa-fx]+)\s*:\s*([0-9A-Fa-fx]+)$/.exec(token);
  if (!match) {
    throw new Error(`Invalid bank:address '${token}' on line ${lineNumber}. Expected bank:addr.`);
  }

  const bank = parseNibble(match[1], lineNumber);
  const address = parseNibble(match[2], lineNumber);
  return [bank, address];
}

function parseMemoryReference(token: string, lineNumber: number): [number, number] {
  const match = /^\[\s*([0-9A-Fa-fx]+)\s*:\s*([0-9A-Fa-fx]+)\s*\]$/.exec(token);
  if (!match) {
    throw new Error(`Invalid memory reference '${token}' on line ${lineNumber}. Expected [bank:addr].`);
  }

  const bank = parseNibble(match[1], lineNumber);
  const address = parseNibble(match[2], lineNumber);
  return [bank, address];
}

function parseIndirectMemoryReference(token: string, lineNumber: number): number {
  const match = /^\[\s*(D[1-4])\s*\]$/i.exec(token);
  if (!match) {
    throw new Error(
      `Invalid indirect memory reference '${token}' on line ${lineNumber}. Expected [D1] through [D4].`,
    );
  }

  return parseRegister(match[1], lineNumber);
}

function parseBranchTarget(
  token: string,
  labelMap: LabelMap,
  currentBank: number,
  lineNumber: number,
): number {
  if (Object.prototype.hasOwnProperty.call(labelMap, token)) {
    const labelAddress = labelMap[token];
    const labelBank = labelAddress >> 4;
    const labelOffset = labelAddress & 0xf;
    if (labelBank !== currentBank) {
      throw new Error(
        `Branch target '${token}' on line ${lineNumber} must be in the same bank (${currentBank}) as the branch instruction.`,
      );
    }
    if (labelOffset % 4 !== 0) {
      throw new Error(
        `Label '${token}' on line ${lineNumber} is not aligned to a 4-nibble instruction boundary.`,
      );
    }
    return labelOffset;
  }

  const value = parseNibble(token, lineNumber);
  if (value % 4 !== 0) {
    throw new Error(
      `Branch address '${token}' on line ${lineNumber} must be aligned to 4 nibbles.`,
    );
  }
  return value;
}

function parseJumpTarget(
  token: string,
  labelMap: LabelMap,
  targetBank: number,
  lineNumber: number,
): number {
  if (Object.prototype.hasOwnProperty.call(labelMap, token)) {
    const labelAddress = labelMap[token];
    const labelBank = labelAddress >> 4;
    const labelOffset = labelAddress & 0xf;
    if (labelBank !== targetBank) {
      throw new Error(
        `JMP target '${token}' on line ${lineNumber} must be in bank ${targetBank}.`,
      );
    }
    if (labelOffset % 4 !== 0) {
      throw new Error(
        `Label '${token}' on line ${lineNumber} is not aligned to a 4-nibble instruction boundary.`,
      );
    }
    return labelOffset;
  }

  const value = parseNibble(token, lineNumber);
  if (value % 4 !== 0) {
    throw new Error(`JMP address '${token}' on line ${lineNumber} must be aligned to 4 nibbles.`);
  }
  return value;
}

function parseOriginDirective(tokens: string[], lineNumber: number): number {
  if (tokens.length !== 2) {
    throw new Error(`ORG requires 1 argument on line ${lineNumber}.`);
  }

  const [bank, address] = parseBankAddress(tokens[1], lineNumber);
  if (address % 4 !== 0) {
    throw new Error(`ORG address '${tokens[1]}' on line ${lineNumber} must be aligned to 4 nibbles.`);
  }

  return (bank << 4) | address;
}

function toHexNibble(value: number): string {
  return value.toString(16).toUpperCase();
}

export function parseAssembly(source: string): { instructions: ParsedInstruction[]; labels: LabelMap } {
  const lines = source.split(/\r?\n/);
  const labels: LabelMap = {};
  const instructions: ParsedInstruction[] = [];
  let currentAddress = 0;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = stripComments(rawLine);
    if (!line) {
      return;
    }

    const label = isLabelLine(line);
    if (label) {
      if (Object.prototype.hasOwnProperty.call(labels, label)) {
        throw new Error(`Duplicate label '${label}' on line ${lineNumber}.`);
      }
      labels[label] = currentAddress;
      return;
    }

    const tokens = line.split(/[,\s]+/).filter(Boolean);
    if (tokens.length === 0) {
      return;
    }

    const opcode = tokens[0].toUpperCase();
    if (opcode === "ORG") {
      currentAddress = parseOriginDirective(tokens, lineNumber);
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(OPCODE_TO_CODE, opcode)) {
      throw new Error(`Unknown opcode '${opcode}' on line ${lineNumber}.`);
    }

    instructions.push({
      opcode,
      args: tokens.slice(1),
      lineNumber,
      address: currentAddress,
      text: line,
    });

    currentAddress = (currentAddress + 4) & 0xff;
  });

  return { instructions, labels };
}

export function assembleParsed(
  instructions: ParsedInstruction[],
  labels: LabelMap,
): MachineCodeRecord[] {
  return instructions.map((instruction) => {
    const { opcode, args, lineNumber, address } = instruction;
    const base = OPCODE_TO_CODE[opcode];
    let nibbles: number[];
    const currentBank = address >> 4;

    switch (opcode) {
      case "LOAD": {
        if (args.length !== 2) {
          throw new Error(`LOAD requires 2 arguments on line ${lineNumber}.`);
        }
        const reg = parseRegister(args[0], lineNumber);
        const [bank, addr] = parseMemoryReference(args[1], lineNumber);
        nibbles = [base, reg, bank, addr];
        break;
      }
      case "STORE": {
        if (args.length !== 2) {
          throw new Error(`STORE requires 2 arguments on line ${lineNumber}.`);
        }
        const reg = parseRegister(args[0], lineNumber);
        const [bank, addr] = parseMemoryReference(args[1], lineNumber);
        nibbles = [base, reg, bank, addr];
        break;
      }
      case "STOREI": {
        if (args.length !== 2) {
          throw new Error(`STOREI requires 2 arguments on line ${lineNumber}.`);
        }
        const reg = parseRegister(args[0], lineNumber);
        const addrReg = parseIndirectMemoryReference(args[1], lineNumber);
        nibbles = [base, reg, addrReg, 0];
        break;
      }
      case "MOV":
      case "ADD":
      case "SUB": {
        if (args.length !== 2) {
          throw new Error(`${opcode} requires 2 arguments on line ${lineNumber}.`);
        }
        const dst = parseRegister(args[0], lineNumber);
        const src = parseRegister(args[1], lineNumber);
        nibbles = [base, dst, src, 0];
        break;
      }
      case "ADDI":
      case "SUBI":
      case "SET": {
        if (args.length !== 2) {
          throw new Error(`${opcode} requires 2 arguments on line ${lineNumber}.`);
        }
        const reg = parseRegister(args[0], lineNumber);
        const value = parseNibble(args[1], lineNumber);
        nibbles = [base, reg, value, 0];
        break;
      }
      case "BEQ":
      case "BGT":
      case "BLT": {
        if (args.length !== 3) {
          throw new Error(`${opcode} requires 3 arguments on line ${lineNumber}.`);
        }
        const reg = parseRegister(args[0], lineNumber);
        const value = parseNibble(args[1], lineNumber);
        const target = parseBranchTarget(args[2], labels, currentBank, lineNumber);
        nibbles = [base, reg, value, target];
        break;
      }
      case "JMP": {
        if (args.length === 1) {
          const target = args[0];
          if (!Object.prototype.hasOwnProperty.call(labels, target)) {
            throw new Error(`Unknown JMP target '${target}' on line ${lineNumber}.`);
          }
          const targetAddress = labels[target];
          const targetBank = targetAddress >> 4;
          const targetOffset = targetAddress & 0xf;
          if (targetOffset % 4 !== 0) {
            throw new Error(
              `Label '${target}' on line ${lineNumber} is not aligned to a 4-nibble instruction boundary.`,
            );
          }
          nibbles = [base, targetBank, targetOffset, 0];
        } else if (args.length === 2) {
          const bank = parseNibble(args[0], lineNumber);
          const addr = parseJumpTarget(args[1], labels, bank, lineNumber);
          nibbles = [base, bank, addr, 0];
        } else {
          throw new Error(`JMP requires 1 or 2 arguments on line ${lineNumber}.`);
        }
        break;
      }
      case "HALT":
      case "NOP": {
        if (args.length !== 0) {
          throw new Error(`${opcode} does not accept arguments on line ${lineNumber}.`);
        }
        nibbles = [base, 0, 0, 0];
        break;
      }
      default:
        throw new Error(`Unhandled opcode '${opcode}' on line ${lineNumber}.`);
    }

    return {
      bank: currentBank,
      address: address & 0xf,
      word: nibbles.map(toHexNibble).join(""),
    };
  });
}
