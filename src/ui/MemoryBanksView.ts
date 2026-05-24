import { Memory } from "../memory/Memory";
import type { MachineCodeRecord } from "../assembler/Assembler";
import { hexNibble } from "./Html";

function instructionCellKeys(machineCode: MachineCodeRecord[]): Set<string> {
  const keys = new Set<string>();

  for (const record of machineCode) {
    for (let offset = 0; offset < 4; offset += 1) {
      const address = (record.address + offset) & 0xf;
      keys.add(`${record.bank}:${address}`);
    }
  }

  return keys;
}

function instructionStartKeys(machineCode: MachineCodeRecord[]): Set<string> {
  return new Set(machineCode.map((record) => `${record.bank}:${record.address}`));
}

export function renderMemoryBanksView(
  memory: Memory,
  currentPc: { bank: number; address: number },
  machineCode: MachineCodeRecord[],
): string {
  const cells: string[] = ['<div class="memory-head">Bank</div>'];
  const instructionCells = instructionCellKeys(machineCode);
  const instructionStarts = instructionStartKeys(machineCode);

  for (let address = 0; address < Memory.ADDRESS_COUNT; address += 1) {
    cells.push(`<div class="memory-head">${hexNibble(address)}</div>`);
  }

  for (let bank = 0; bank < Memory.BANK_COUNT; bank += 1) {
    cells.push(`<div class="memory-label">${hexNibble(bank)}</div>`);

    for (let address = 0; address < Memory.ADDRESS_COUNT; address += 1) {
      const value = memory.read(bank, address);
      const key = `${bank}:${address}`;
      const classes = [
        "memory-cell",
        instructionCells.has(key) ? "instruction" : "",
        instructionStarts.has(key) ? "instruction-start" : "",
        bank === Memory.VIDEO_BANK ? "video" : "",
        bank === currentPc.bank && address === currentPc.address ? "pc" : "",
      ]
        .filter(Boolean)
        .join(" ");

      cells.push(
        `<div class="${classes}" title="[${hexNibble(bank)}:${hexNibble(address)}]">${hexNibble(value)}</div>`,
      );
    }
  }

  return `
    <section class="panel memory-panel">
      <div class="panel-header">
        <h2 class="panel-title">Memory Banks</h2>
        <span class="pill">bank F is video RAM</span>
      </div>
      <div class="panel-body">
        <div class="memory-grid">${cells.join("")}</div>
      </div>
    </section>
  `;
}
