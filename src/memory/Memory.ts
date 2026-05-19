import { isValidNibble, toNibble } from "../utils/Nibble";

export class Memory {
  public static readonly BANK_COUNT = 16;
  public static readonly ADDRESS_COUNT = 16;
  public static readonly TOTAL_CELLS = Memory.BANK_COUNT * Memory.ADDRESS_COUNT;
  public static readonly VIDEO_BANK = 0xF;

  private cells: number[];

  constructor() {
    this.cells = new Array<number>(Memory.TOTAL_CELLS).fill(0);
  }

  public read(bank: number, address: number): number {
    this.validateBank(bank);
    this.validateAddress(address);
    return this.cells[this.toIndex(bank, address)];
  }

  public write(bank: number, address: number, value: number): void {
    this.validateBank(bank);
    this.validateAddress(address);
    if (!isValidNibble(value)) {
      throw new RangeError(`Memory value must be a 4-bit nibble: ${value}`);
    }
    this.cells[this.toIndex(bank, address)] = toNibble(value);
  }

  public reset(): void {
    this.cells.fill(0);
  }

  public dump(): number[] {
    return [...this.cells];
  }

  private toIndex(bank: number, address: number): number {
    return (bank << 4) | address;
  }

  private validateBank(bank: number): void {
    if (!Number.isInteger(bank) || bank < 0 || bank >= Memory.BANK_COUNT) {
      throw new RangeError(`Bank must be between 0 and ${Memory.BANK_COUNT - 1}: ${bank}`);
    }
  }

  private validateAddress(address: number): void {
    if (!Number.isInteger(address) || address < 0 || address >= Memory.ADDRESS_COUNT) {
      throw new RangeError(`Address must be between 0 and ${Memory.ADDRESS_COUNT - 1}: ${address}`);
    }
  }
}
