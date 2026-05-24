import type { UiState } from "./UiState";
import { renderCodeListingView } from "./CodeListingView";
import { renderCpuStateView } from "./CpuStateView";
import { renderDisplayMatrix } from "./DisplayMatrix";
import { renderMemoryBanksView } from "./MemoryBanksView";
import { renderSourceCodeView } from "./SourceCodeView";

function currentSourceLine(state: UiState, pc: { bank: number; address: number }): number | null {
  let instructionIndex = 0;

  for (let assemblyIndex = 0; assemblyIndex < state.assembly.length; assemblyIndex += 1) {
    const line = state.assembly[assemblyIndex].trim();
    const isLabel = /^[A-Za-z_][A-Za-z0-9_]*:$/.test(line);
    if (isLabel) {
      continue;
    }

    const record = state.machineCode[instructionIndex];
    instructionIndex += 1;
    if (record?.bank === pc.bank && record.address === pc.address) {
      return state.assemblySourceMap[assemblyIndex] ?? null;
    }
  }

  return null;
}

export function renderDebuggerLayout(state: UiState): string {
  const currentPc = state.machine.cpu.getPC();
  const sourceLine = currentSourceLine(state, currentPc);

  return `
    <main class="workbench">
      ${renderSourceCodeView(state.source, sourceLine)}
      ${renderCodeListingView(state.assembly, state.assemblySourceMap, state.machineCode, currentPc)}
      ${renderCpuStateView(state.machine.cpu, state.machine.memory)}
      ${renderMemoryBanksView(state.machine.memory, currentPc, state.machineCode)}
      ${renderDisplayMatrix(state.machine.memory)}
    </main>
  `;
}
