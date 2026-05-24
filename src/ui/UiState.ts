import type { MachineCodeRecord } from "../assembler/Assembler";
import type { EZPU } from "../EZPU";

export type UiState = {
  source: string;
  assembly: string[];
  machineCode: MachineCodeRecord[];
  machine: EZPU;
};

