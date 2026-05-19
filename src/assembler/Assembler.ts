import { assembleParsed, parseAssembly, MachineCodeRecord } from "./Parser";

export type { MachineCodeRecord };

export class Assembler {
  public assemble(source: string | string[]): MachineCodeRecord[] {
    const assemblySource = Array.isArray(source) ? source.join("\n") : source;
    const { instructions, labels } = parseAssembly(assemblySource);
    return assembleParsed(instructions, labels);
  }
}
