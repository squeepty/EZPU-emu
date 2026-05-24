import { Assembler } from "./assembler/Assembler";
import { EZPU } from "./EZPU";
import { EZCCompiler } from "./compiler/EZCCompiler";
import { renderApp } from "./ui/renderApp";

const source = `
let x = 3;
while (x != 0) {
  pixel(0,x) = 1;
  x = x - 1;
}
`;

const compiler = new EZCCompiler();
const assembly = compiler.compileToAssembly(source);
const assemblySourceMap = compiler.getAssemblySourceMap();
const assembler = new Assembler();
const machineCode = assembler.assemble(assembly);

const machine = new EZPU();
machine.loadMachineCode(machineCode);
const traceMachine = new EZPU();
traceMachine.loadMachineCode(machineCode);
const snapshots = traceMachine.run({
  breakBeforeFirstInstruction: true,
  collectSnapshots: true,
});
if (!Array.isArray(snapshots)) {
  throw new Error("Expected step snapshots from EZPU run.");
}

console.log("Preparing EZC sample program for step-by-step debugging...");
console.log("EZC source:");
console.log(source.trim());
console.log("Assembly:");
console.log(assembly.join("\n"));
console.log("Machine code:");
console.log(
  machineCode
    .map((record) => `${record.bank}:${record.address.toString(16).toUpperCase()} -> ${record.word}`)
    .join("\n"),
);

const uiPath = renderApp({
  source,
  assembly,
  assemblySourceMap,
  machineCode,
  machine,
  snapshots,
});

console.log(`Debugger UI written to: ${uiPath}`);
