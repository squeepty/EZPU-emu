import type { UiState } from "./UiState";
import { renderCodeListingView } from "./CodeListingView";
import { renderCpuStateView } from "./CpuStateView";
import { renderDisplayMatrix } from "./DisplayMatrix";
import { renderMemoryBanksView } from "./MemoryBanksView";
import { renderSourceCodeView } from "./SourceCodeView";

export function renderDebuggerLayout(state: UiState): string {
  const currentPc = state.machine.cpu.getPC();

  return `
    <main class="workbench">
      ${renderSourceCodeView(state.source)}
      ${renderCodeListingView(state.assembly, state.machineCode, currentPc)}
      ${renderCpuStateView(state.machine.cpu, state.machine.memory)}
      ${renderMemoryBanksView(state.machine.memory, currentPc, state.machineCode)}
      ${renderDisplayMatrix(state.machine.memory)}
    </main>
  `;
}
