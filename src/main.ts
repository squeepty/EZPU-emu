import { Assembler } from "./assembler/Assembler";
import { EZPU } from "./EZPU";
import { EZCCompiler } from "./compiler/EZCCompiler";

const source = `
let x = 3;
while (x != 0) {
  pixel(0,x) = 1;
  x = x - 1;
}
`;

const compiler = new EZCCompiler();
const assembly = compiler.compileToAssembly(source);
const assembler = new Assembler();
const machineCode = assembler.assemble(assembly);

const machine = new EZPU();
machine.loadMachineCode(machineCode);

console.log("Executing EZC sample program...");
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

machine.run();

console.log("Display:");
console.log(machine.renderScreen());
