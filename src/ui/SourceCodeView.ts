import { escapeHtml } from "./Html";

export function renderSourceCodeView(source: string, currentSourceLine: number | null): string {
  const rawLines = source.split(/\r?\n/);
  let firstLine = 0;
  let lastLine = rawLines.length - 1;

  while (firstLine <= lastLine && rawLines[firstLine].trim() === "") {
    firstLine += 1;
  }
  while (lastLine >= firstLine && rawLines[lastLine].trim() === "") {
    lastLine -= 1;
  }

  const lines = rawLines.slice(firstLine, lastLine + 1).map((line, index) => {
    const sourceLine = firstLine + index + 1;
    const current = sourceLine === currentSourceLine ? " current" : "";

    return `
          <div class="source-line${current}" data-source-line="${sourceLine}">
            <span class="source-line-number">${sourceLine.toString().padStart(2, "0")}</span>
            <code>${escapeHtml(line)}</code>
          </div>
    `;
  });

  return `
    <section class="panel">
      <div class="panel-header">
        <h2 class="panel-title">EZC Source</h2>
        <span class="pill">simplified C</span>
      </div>
      <div class="panel-body">
        <pre class="code-block source-listing">${lines.join("")}</pre>
      </div>
    </section>
  `;
}
