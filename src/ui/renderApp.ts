import { writeFileSync } from "fs";
import { resolve } from "path";
import type { UiState } from "./UiState";
import { renderDebuggerLayout } from "./DebuggerLayout";
import { renderStyles } from "./styles";
import { renderToolbarView } from "./ToolbarView";

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
  </body>
</html>
`;

  writeFileSync(target, html, "utf8");
  return target;
}

