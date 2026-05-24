import type { UiState } from "./UiState";

export function renderToolbarView(state: UiState): string {
  const status = state.machine.cpu.isHalted() ? "Halted" : "Paused";

  return `
    <header class="toolbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
        <div>
          <h1>EZPU Debugger</h1>
          <p class="toolbar-subtitle">Step-by-step educational workbench</p>
        </div>
      </div>
      <div class="toolbar-actions">
        <button class="button primary" id="step-button">Step</button>
        <button class="button" id="run-button">Run</button>
        <button class="button" id="reset-button">Reset</button>
        <button class="button" disabled>Compile</button>
        <span class="pill">State: <span id="run-status">${status}</span></span>
        <span class="pill">Step <span id="step-index">0</span>/<span id="step-count">${Math.max(0, state.snapshots.length - 1)}</span></span>
        <span class="pill">${state.machineCode.length} instructions</span>
      </div>
    </header>
  `;
}
