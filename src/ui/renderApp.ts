import { writeFileSync } from "fs";
import { resolve } from "path";
import type { UiState } from "./UiState";
import { renderDebuggerLayout } from "./DebuggerLayout";
import { renderStyles } from "./styles";
import { renderToolbarView } from "./ToolbarView";

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003C");
}

function renderDebuggerScript(state: UiState): string {
  return `
    <script>
      const snapshots = ${safeJson(state.snapshots)};
      let snapshotIndex = 0;
      let runTimer = null;

      const hexNibble = (value) => value.toString(16).toUpperCase();
      const hexByte = (value) => value.toString(16).toUpperCase().padStart(2, "0");
      const binaryNibble = (value) => value.toString(2).padStart(4, "0");

      function decodeMachineWord(word) {
        const opcode = Number.parseInt(word[0], 16);
        const a = word[1];
        const b = word[2];
        const c = word[3];
        const registers = ["D1", "D2", "D3", "D4"];
        const reg = (nibble) => registers[Number.parseInt(nibble, 16)] ?? "D?";

        switch (opcode) {
          case 0x0: return "LOAD " + reg(a) + ", [" + b + ":" + c + "]";
          case 0x1: return "STORE " + reg(a) + ", [" + b + ":" + c + "]";
          case 0x2: return "MOV " + reg(a) + ", " + reg(b);
          case 0x3: return "ADD " + reg(a) + ", " + reg(b);
          case 0x4: return "ADDI " + reg(a) + ", " + b;
          case 0x5: return "SUB " + reg(a) + ", " + reg(b);
          case 0x6: return "SUBI " + reg(a) + ", " + b;
          case 0x7: return "SET " + reg(a) + ", " + b;
          case 0x8: return "BEQ " + reg(a) + ", " + b + ", " + c;
          case 0x9: return "BGT " + reg(a) + ", " + b + ", " + c;
          case 0xA: return "BLT " + reg(a) + ", " + b + ", " + c;
          case 0xB: return "JMP " + a + ":" + b;
          case 0xC: return "HALT";
          case 0xD: return "NOP";
          case 0xE: return "STOREI " + reg(a) + ", [" + reg(b) + "]";
          default: return "UNKNOWN 0x" + word[0];
        }
      }

      function currentWord(snapshot) {
        const { bank, address } = snapshot.pc;
        return [0, 1, 2, 3]
          .map((offset) => snapshot.memory[bank][(address + offset) & 0xf])
          .map(hexNibble)
          .join("");
      }

      function isCurrentInstructionCell(snapshot, bank, address) {
        if (bank !== snapshot.pc.bank) {
          return false;
        }

        return [0, 1, 2, 3].some((offset) => ((snapshot.pc.address + offset) & 0xf) === address);
      }

      function setText(selector, value) {
        const node = document.querySelector(selector);
        if (node) {
          node.textContent = value;
        }
      }

      function updateSnapshot(index) {
        snapshotIndex = Math.max(0, Math.min(index, snapshots.length - 1));
        const snapshot = snapshots[snapshotIndex];
        const pcKey = snapshot.pc.bank + ":" + snapshot.pc.address;
        const executedSnapshot = snapshotIndex > 0 ? snapshots[snapshotIndex - 1] : null;
        const executedPcKey = executedSnapshot
          ? executedSnapshot.pc.bank + ":" + executedSnapshot.pc.address
          : "";
        const absolutePc = (snapshot.pc.bank << 4) | snapshot.pc.address;

        snapshot.registers.forEach((value, register) => {
          const previousValue = snapshotIndex > 0 ? snapshots[snapshotIndex - 1].registers[register] : value;
          setText("[data-register-value='" + register + "']", hexNibble(value));
          setText("[data-register-binary='" + register + "']", binaryNibble(value));
          const row = document.querySelector("[data-register-row='" + register + "']");
          if (row) {
            row.classList.toggle("changed", value !== previousValue);
          }
        });

        setText("#pc-bank", hexNibble(snapshot.pc.bank));
        setText("#pc-address", hexNibble(snapshot.pc.address));
        setText("#pc-absolute", hexByte(absolutePc));
        setText("#pc-label", hexNibble(snapshot.pc.bank) + ":" + hexNibble(snapshot.pc.address));

        const word = currentWord(snapshot);
        setText("#current-word", word);
        setText("#current-decode", decodeMachineWord(word));
        setText("#cpu-status", snapshot.halted ? "halted" : "paused");
        setText("#run-status", snapshot.halted ? "Halted" : "Paused");
        setText("#step-index", String(snapshotIndex));

        document.querySelectorAll(".listing tbody tr").forEach((row) => {
          row.classList.toggle("current", row.dataset.pc === pcKey);
          row.classList.toggle("executed", executedPcKey !== "" && row.dataset.pc === executedPcKey);
        });

        const currentRow = document.querySelector(".listing tbody tr.current");
        const sourceLine = currentRow?.dataset.sourceLine ?? "";
        document.querySelectorAll(".source-line").forEach((row) => {
          row.classList.toggle("current", sourceLine !== "" && row.dataset.sourceLine === sourceLine);
        });

        document.querySelectorAll(".memory-cell").forEach((cell) => {
          const bank = Number(cell.dataset.bank);
          const address = Number(cell.dataset.address);
          cell.textContent = hexNibble(snapshot.memory[bank][address]);
          cell.classList.toggle("pc", isCurrentInstructionCell(snapshot, bank, address));
        });

        let onCount = 0;
        document.querySelectorAll(".pixel").forEach((pixel) => {
          const address = Number(pixel.dataset.address);
          const value = snapshot.memory[15][address];
          if (value === 1) {
            onCount += 1;
          }
          pixel.classList.toggle("on", value === 1);
        });
        setText("#display-on-count", String(onCount));

        const atEnd = snapshotIndex >= snapshots.length - 1 || snapshot.halted;
        const stepButton = document.querySelector("#step-button");
        const runButton = document.querySelector("#run-button");
        if (stepButton) {
          stepButton.disabled = atEnd;
        }
        if (runButton) {
          runButton.disabled = atEnd;
        }
        if (atEnd && runTimer !== null) {
          window.clearInterval(runTimer);
          runTimer = null;
        }
      }

      document.querySelector("#step-button")?.addEventListener("click", () => {
        updateSnapshot(snapshotIndex + 1);
      });

      document.querySelector("#run-button")?.addEventListener("click", () => {
        if (runTimer !== null) {
          window.clearInterval(runTimer);
          runTimer = null;
          setText("#run-status", "Paused");
          return;
        }
        setText("#run-status", "Running");
        runTimer = window.setInterval(() => updateSnapshot(snapshotIndex + 1), 420);
      });

      document.querySelector("#reset-button")?.addEventListener("click", () => {
        if (runTimer !== null) {
          window.clearInterval(runTimer);
          runTimer = null;
        }
        updateSnapshot(0);
      });

      updateSnapshot(0);
    </script>
  `;
}

export function renderApp(state: UiState, outputPath = "ezpu-debugger.html"): string {
  const target = resolve(outputPath);
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>EZPU Debugger</title>
    <style>${renderStyles()}</style>
  </head>
  <body>
    <div class="app">
      ${renderToolbarView(state)}
      ${renderDebuggerLayout(state)}
    </div>
    ${renderDebuggerScript(state)}
  </body>
</html>
`;

  writeFileSync(target, html, "utf8");
  return target;
}
