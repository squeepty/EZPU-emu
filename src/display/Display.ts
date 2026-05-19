import { Memory } from "../memory/Memory";

export class Display {
  public render(memory: Memory): string {
    const rows: string[] = [];
    const bank = Memory.VIDEO_BANK;

    for (let row = 0; row < 4; row += 1) {
      const pixels: string[] = [];
      for (let col = 0; col < 4; col += 1) {
        const address = row * 4 + col;
        const value = memory.read(bank, address);
        pixels.push(value === 1 ? "#" : ".");
      }
      rows.push(pixels.join(" "));
    }

    return rows.join("\n");
  }
}
