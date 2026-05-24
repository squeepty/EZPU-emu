import type { UiState } from "./UiState";

export function renderToolbarView(state: UiState): string {
  const status = state.machine.cpu.isHalted() ? "Halted" : "Ready";

  return `
    <header class="toolbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
        <div>
          <h1>EZPU Debugger</h1>
          <p class="toolbar-subtitle">Final-state educational workbench</p>
        </div>
      </div>
      <div class="toolbar-actions">
        <button class="button primary" disabled>Step</button>
        <button class="button" disabled>Run</button>
        <button class="button" disabled>Reset</button>
        <button class="button" disabled>Compile</button>
        <span class="pill">State: ${status}</span>
        <span class="pill">${state.machineCode.length} instructions</span>
      </div>
    </header>
  `;
}

