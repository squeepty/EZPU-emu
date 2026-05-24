import type { MachineCodeRecord } from "../assembler/Assembler";
import type { EZPU, EZPUSnapshot } from "../EZPU";

export type UiState = {
  source: string;
  assembly: string[];
  assemblySourceMap: Array<number | null>;
  machineCode: MachineCodeRecord[];
  machine: EZPU;
  snapshots: EZPUSnapshot[];
};
