import type { CPU, RegisterIndex } from "../cpu/CPU";
import type { Memory } from "../memory/Memory";
import { decodeMachineWord } from "./InstructionDecoder";
import { binaryNibble, escapeHtml, hexByte, hexNibble } from "./Html";

const REGISTERS: Array<{ index: RegisterIndex; name: string }> = [
  { index: 0, name: "D1" },
  { index: 1, name: "D2" },
  { index: 2, name: "D3" },
  { index: 3, name: "D4" },
];

function renderRegisterRows(cpu: CPU): string {
  return REGISTERS.map(({ index, name }) => {
    const value = cpu.getRegister(index);
    return `
      <div class="register-row">
        <span class="register-name">${name}</span>
        <span class="register-value">${hexNibble(value)}</span>
        <span>${binaryNibble(value)}</span>
      </div>
    `;
  }).join("");
}

function currentWord(memory: Memory, pc: { bank: number; address: number }): string {
  return [0, 1, 2, 3]
    .map((offset) => memory.read(pc.bank, (pc.address + offset) & 0xf))
    .map(hexNibble)
    .join("");
}

export function renderCpuStateView(cpu: CPU, memory: Memory): string {
  const pc = cpu.getPC();
  const absolutePc = (pc.bank << 4) | pc.address;
  const word = currentWord(memory, pc);

  return `
    <section class="panel cpu-panel">
      <div class="panel-header">
        <h2 class="panel-title">CPU State</h2>
        <span class="pill">${cpu.isHalted() ? "halted" : "ready"}</span>
      </div>
      <div class="panel-body cpu-state">
        <div class="state-section">
          <h3 class="section-title">Registers</h3>
          <div class="register-grid">${renderRegisterRows(cpu)}</div>
        </div>
        <div class="state-section">
          <h3 class="section-title">Program Counter</h3>
          <div class="state-grid">
            <div class="pc-row">
              <span class="pc-name">PCHIGH</span>
              <span class="pc-value">${hexNibble(pc.bank)}</span>
              <span>bank</span>
            </div>
            <div class="pc-row">
              <span class="pc-name">PCLOW</span>
              <span class="pc-value">${hexNibble(pc.address)}</span>
              <span>address</span>
            </div>
            <div class="pc-row">
              <span class="pc-name">PC</span>
              <span class="pc-value">${hexByte(absolutePc)}</span>
              <span>${hexNibble(pc.bank)}:${hexNibble(pc.address)}</span>
            </div>
          </div>
        </div>
        <div class="state-section">
          <h3 class="section-title">Current Instruction</h3>
          <div class="state-grid">
            <div class="stat-row">
              <span class="stat-name">Word</span>
              <span class="stat-value">${word}</span>
              <span>nibbles</span>
            </div>
            <div class="stat-row wide-value">
              <span class="stat-name">Decode</span>
              <span class="stat-value">${escapeHtml(decodeMachineWord(word))}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

