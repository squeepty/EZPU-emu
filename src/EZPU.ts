import { CPU } from "./cpu/CPU";
import { Display } from "./display/Display";
import { Memory } from "./memory/Memory";
import type { MachineCodeRecord } from "./assembler/Assembler";
import type { RegisterIndex } from "./cpu/CPU";

export type EZPUSnapshot = {
  pc: { bank: number; address: number };
  registers: number[];
  halted: boolean;
  memory: number[][];
};

export type EZPURunOptions = {
  maxCycles?: number;
  breakBeforeFirstInstruction?: boolean;
  collectSnapshots?: boolean;
};

export class EZPU {
  public readonly memory: Memory;
  public readonly cpu: CPU;
  public readonly display: Display;

  constructor() {
    this.memory = new Memory();
    this.cpu = new CPU(this.memory);
    this.display = new Display();
  }

  public reset(): void {
    this.memory.reset();
    this.cpu.reset();
  }

  public loadMachineCode(lines: string[] | MachineCodeRecord[]): void {
    this.memory.reset();
    this.cpu.reset();

    if (lines.length === 0) {
      return;
    }

    if (typeof lines[0] === "string") {
      let pointer = 0;
      for (const line of lines as string[]) {
        const trimmed = line.trim();
        if (trimmed.length === 0) {
          continue;
        }
        if (trimmed.length !== 4) {
          throw new Error(`Expected 4-digit machine code line, got: ${trimmed}`);
        }

        for (const char of trimmed) {
          const nibble = parseInt(char, 16);
          if (Number.isNaN(nibble)) {
            throw new Error(`Invalid machine code nibble: ${char}`);
          }
          const bank = pointer >> 4;
          const address = pointer & 0xF;
          this.memory.write(bank, address, nibble);
          pointer += 1;
        }
      }
      return;
    }

    for (const record of lines as MachineCodeRecord[]) {
      const trimmed = record.word.trim();
      if (trimmed.length !== 4) {
        throw new Error(`Expected 4-digit machine code word, got: ${trimmed}`);
      }
      if (record.address % 4 !== 0) {
        throw new Error(
          `Instruction at bank ${record.bank}, address ${record.address} is not aligned to 4 nibbles.`,
        );
      }

      for (let offset = 0; offset < 4; offset += 1) {
        const char = trimmed[offset];
        const nibble = parseInt(char, 16);
        if (Number.isNaN(nibble)) {
          throw new Error(`Invalid machine code nibble: ${char}`);
        }
        const address = (record.address + offset) & 0xf;
        this.memory.write(record.bank, address, nibble);
      }
    }
  }

  public step(): void {
    this.cpu.step();
  }

  public snapshot(): EZPUSnapshot {
    const memory: number[][] = [];
    for (let bank = 0; bank < Memory.BANK_COUNT; bank += 1) {
      const cells: number[] = [];
      for (let address = 0; address < Memory.ADDRESS_COUNT; address += 1) {
        cells.push(this.memory.read(bank, address));
      }
      memory.push(cells);
    }

    return {
      pc: this.cpu.getPC(),
      registers: ([0, 1, 2, 3] as RegisterIndex[]).map((register) => this.cpu.getRegister(register)),
      halted: this.cpu.isHalted(),
      memory,
    };
  }

  public run(maxCyclesOrOptions: number | EZPURunOptions = 1024): void | EZPUSnapshot[] {
    const options =
      typeof maxCyclesOrOptions === "number"
        ? { maxCycles: maxCyclesOrOptions }
        : maxCyclesOrOptions;
    const maxCycles = options.maxCycles ?? 1024;
    const snapshots: EZPUSnapshot[] = [];

    if (options.collectSnapshots && options.breakBeforeFirstInstruction) {
      snapshots.push(this.snapshot());
    }

    let cycles = 0;
    while (!this.cpu.isHalted() && cycles < maxCycles) {
      this.step();
      cycles += 1;
      if (options.collectSnapshots) {
        snapshots.push(this.snapshot());
      }
    }
    if (cycles >= maxCycles) {
      throw new Error("Maximum cycle count reached; possible infinite loop.");
    }

    return options.collectSnapshots ? snapshots : undefined;
  }

  public renderScreen(): string {
    return this.display.render(this.memory);
  }
}
