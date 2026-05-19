import { Memory } from "../memory/Memory";
import { toNibble, isValidNibble } from "../utils/Nibble";

export type RegisterIndex = 0 | 1 | 2 | 3;

export class CPU {
  private readonly registers: number[] = [0, 0, 0, 0];
  private pchigh = 0;
  private pclow = 0;
  private halted = false;
  private memory: Memory;

  constructor(memory: Memory) {
    this.memory = memory;
  }

  public reset(): void {
    this.registers.fill(0);
    this.pchigh = 0;
    this.pclow = 0;
    this.halted = false;
  }

  public isHalted(): boolean {
    return this.halted;
  }

  public getPC(): { bank: number; address: number } {
    return { bank: this.pchigh, address: this.pclow };
  }

  public getRegister(register: RegisterIndex): number {
    return this.registers[register];
  }

  public step(): void {
    if (this.halted) {
      return;
    }

    const opcode = this.fetchNibble(0);
    const arg1 = this.fetchNibble(1);
    const arg2 = this.fetchNibble(2);
    const arg3 = this.fetchNibble(3);

    switch (opcode) {
      case 0x0:
        this.opLOAD(arg1, arg2, arg3);
        this.incrementPC();
        break;
      case 0x1:
        this.opSTORE(arg1, arg2, arg3);
        this.incrementPC();
        break;
      case 0x2:
        this.opMOV(arg1, arg2);
        this.incrementPC();
        break;
      case 0x3:
        this.opADD(arg1, arg2);
        this.incrementPC();
        break;
      case 0x4:
        this.opADDI(arg1, arg2);
        this.incrementPC();
        break;
      case 0x5:
        this.opSUB(arg1, arg2);
        this.incrementPC();
        break;
      case 0x6:
        this.opSUBI(arg1, arg2);
        this.incrementPC();
        break;
      case 0x7:
        this.opSET(arg1, arg2);
        this.incrementPC();
        break;
      case 0x8:
        this.opBEQ(arg1, arg2, arg3);
        break;
      case 0x9:
        this.opBGT(arg1, arg2, arg3);
        break;
      case 0xA:
        this.opBLT(arg1, arg2, arg3);
        break;
      case 0xB:
        this.opJMP(arg1, arg2);
        break;
      case 0xC:
        this.opHALT();
        break;
      case 0xD:
        this.incrementPC();
        break;
      case 0xE:
        this.opSTOREI(arg1, arg2);
        this.incrementPC();
        break;
      default:
        throw new Error(`Unknown opcode: 0x${opcode.toString(16).toUpperCase().padStart(1, "0")}`);
    }
  }

  private fetchNibble(offset: number): number {
    const address = this.pclow + offset;
    const normalizedAddress = address & 0xF;
    return this.memory.read(this.pchigh, normalizedAddress);
  }

  private incrementPC(): void {
    const nextAddress = this.pclow + 4;
    if (nextAddress > 0xF) {
      this.pchigh = (this.pchigh + 1) & 0xf;
    }
    this.pclow = nextAddress & 0xF;
  }

  private getRegisterIndex(value: number): RegisterIndex {
    if (!Number.isInteger(value) || value < 0 || value > 3) {
      throw new RangeError(`Register index must be 0-3: ${value}`);
    }
    return value as RegisterIndex;
  }

  private readRegister(index: number): number {
    return this.registers[this.getRegisterIndex(index)];
  }

  private writeRegister(index: number, value: number): void {
    if (!isValidNibble(value)) {
      throw new RangeError(`Register value must be a nibble: ${value}`);
    }
    this.registers[this.getRegisterIndex(index)] = toNibble(value);
  }

  private opLOAD(reg: number, bank: number, address: number): void {
    const value = this.memory.read(bank, address);
    this.writeRegister(reg, value);
  }

  private opSTORE(reg: number, bank: number, address: number): void {
    const value = this.readRegister(reg);
    this.memory.write(bank, address, value);
  }

  private opSTOREI(reg: number, addrReg: number): void {
    const value = this.readRegister(reg);
    const address = this.readRegister(addrReg) & 0xf;
    this.memory.write(0xF, address, value);
  }

  private opMOV(dst: number, src: number): void {
    const value = this.readRegister(src);
    this.writeRegister(dst, value);
  }

  private opADD(dst: number, src: number): void {
    const sum = this.readRegister(dst) + this.readRegister(src);
    this.writeRegister(dst, toNibble(sum));
  }

  private opADDI(reg: number, immediate: number): void {
    this.writeRegister(reg, toNibble(this.readRegister(reg) + immediate));
  }

  private opSUB(dst: number, src: number): void {
    this.writeRegister(dst, toNibble(this.readRegister(dst) - this.readRegister(src)));
  }

  private opSUBI(reg: number, immediate: number): void {
    this.writeRegister(reg, toNibble(this.readRegister(reg) - immediate));
  }

  private opSET(reg: number, immediate: number): void {
    if (!isValidNibble(immediate)) {
      throw new RangeError(`Immediate value must be a nibble: ${immediate}`);
    }
    this.writeRegister(reg, immediate);
  }

  private opBEQ(reg: number, value: number, address: number): void {
    if (this.readRegister(reg) === value) {
      this.pclow = address & 0xF;
    } else {
      this.incrementPC();
    }
  }

  private opBGT(reg: number, value: number, address: number): void {
    if (this.readRegister(reg) > value) {
      this.pclow = address & 0xF;
    } else {
      this.incrementPC();
    }
  }

  private opBLT(reg: number, value: number, address: number): void {
    if (this.readRegister(reg) < value) {
      this.pclow = address & 0xF;
    } else {
      this.incrementPC();
    }
  }

  private opJMP(bank: number, address: number): void {
    this.pchigh = bank & 0xF;
    this.pclow = address & 0xF;
  }

  private opHALT(): void {
    this.halted = true;
  }
}
