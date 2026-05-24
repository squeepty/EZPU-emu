const REGISTER_NAMES = ["D1", "D2", "D3", "D4"];

function registerName(index: number): string {
  return REGISTER_NAMES[index] ?? `R?${index}`;
}

export function decodeMachineWord(word: string): string {
  const nibbles = word
    .trim()
    .toUpperCase()
    .split("")
    .map((char) => parseInt(char, 16));

  if (nibbles.length !== 4 || nibbles.some(Number.isNaN)) {
    return "Invalid word";
  }

  const [opcode, arg1, arg2, arg3] = nibbles;

  switch (opcode) {
    case 0x0:
      return `LOAD ${registerName(arg1)}, [${arg2.toString(16).toUpperCase()}:${arg3.toString(16).toUpperCase()}]`;
    case 0x1:
      return `STORE ${registerName(arg1)}, [${arg2.toString(16).toUpperCase()}:${arg3.toString(16).toUpperCase()}]`;
    case 0x2:
      return `MOV ${registerName(arg1)}, ${registerName(arg2)}`;
    case 0x3:
      return `ADD ${registerName(arg1)}, ${registerName(arg2)}`;
    case 0x4:
      return `ADDI ${registerName(arg1)}, ${arg2}`;
    case 0x5:
      return `SUB ${registerName(arg1)}, ${registerName(arg2)}`;
    case 0x6:
      return `SUBI ${registerName(arg1)}, ${arg2}`;
    case 0x7:
      return `SET ${registerName(arg1)}, ${arg2}`;
    case 0x8:
      return `BEQ ${registerName(arg1)}, ${arg2}, ${arg3.toString(16).toUpperCase()}`;
    case 0x9:
      return `BGT ${registerName(arg1)}, ${arg2}, ${arg3.toString(16).toUpperCase()}`;
    case 0xa:
      return `BLT ${registerName(arg1)}, ${arg2}, ${arg3.toString(16).toUpperCase()}`;
    case 0xb:
      return `JMP ${arg1.toString(16).toUpperCase()}, ${arg2.toString(16).toUpperCase()}`;
    case 0xc:
      return "HALT";
    case 0xd:
      return "NOP";
    case 0xe:
      return `STOREI ${registerName(arg1)}, [${registerName(arg2)}]`;
    default:
      return `Unknown opcode ${opcode.toString(16).toUpperCase()}`;
  }
}

