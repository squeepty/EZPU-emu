import { Memory } from "../memory/Memory";
import { hexNibble } from "./Html";

export function renderDisplayMatrix(memory: Memory): string {
  const pixels: string[] = [];
  let onCount = 0;

  for (let address = 0; address < Memory.ADDRESS_COUNT; address += 1) {
    const value = memory.read(Memory.VIDEO_BANK, address);
    const x = address % 4;
    const y = Math.floor(address / 4);
    if (value === 1) {
      onCount += 1;
    }
    pixels.push(
      `<div class="pixel${value === 1 ? " on" : ""}" title="pixel(${x}, ${y}) / [F:${hexNibble(address)}]"></div>`,
    );
  }

  return `
    <section class="panel display-panel">
      <div class="panel-header">
        <h2 class="panel-title">Display Matrix</h2>
        <span class="pill">4 x 4</span>
      </div>
      <div class="panel-body">
        <div class="display-wrap">
          <div class="display-grid">${pixels.join("")}</div>
          <div class="display-meta">
            <div class="stat-row">
              <span class="stat-name">VRAM</span>
              <span class="stat-value">F</span>
              <span>bank</span>
            </div>
            <div class="stat-row">
              <span class="stat-name">On</span>
              <span class="stat-value">${onCount}</span>
              <span>pixels</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
