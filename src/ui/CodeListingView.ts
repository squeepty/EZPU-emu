import type { MachineCodeRecord } from "../assembler/Assembler";
import { decodeMachineWord } from "./InstructionDecoder";
import { escapeHtml, hexNibble } from "./Html";

function isLabel(line: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*:$/.test(line.trim());
}

function formatAddress(record: MachineCodeRecord | undefined): string {
  return record ? `${hexNibble(record.bank)}:${hexNibble(record.address)}` : "";
}

export function renderCodeListingView(
  assembly: string[],
  assemblySourceMap: Array<number | null>,
  machineCode: MachineCodeRecord[],
  currentPc: { bank: number; address: number },
): string {
  let instructionIndex = 0;

  const rows = assembly
    .map((line, index) => {
      const label = isLabel(line);
      const record = label ? undefined : machineCode[instructionIndex];
      if (!label) {
        instructionIndex += 1;
      }

      const isCurrent = record?.bank === currentPc.bank && record.address === currentPc.address;
      const word = record?.word ?? "";
      const decoded = record ? decodeMachineWord(record.word) : "";
      const pcKey = record ? `${record.bank}:${record.address}` : "";
      const sourceLine = assemblySourceMap[index] ?? "";

      return `
        <tr${isCurrent ? ' class="current"' : ""} data-pc="${pcKey}" data-source-line="${sourceLine}">
          <td class="address">${index.toString().padStart(2, "0")}</td>
          <td class="address">${formatAddress(record)}</td>
          <td>${escapeHtml(line)}</td>
          <td class="word">${escapeHtml(word)}</td>
          <td>${escapeHtml(decoded)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <section class="panel code-panel">
      <div class="panel-header">
        <h2 class="panel-title">Assembly + Machine Code</h2>
        <span class="pill">source to nibbles</span>
      </div>
      <div class="panel-body">
        <table class="listing">
          <thead>
            <tr>
              <th>Line</th>
              <th>PC</th>
              <th>Assembly</th>
              <th>Word</th>
              <th>Decoded</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}
