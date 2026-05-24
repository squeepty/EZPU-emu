import { escapeHtml } from "./Html";

export function renderSourceCodeView(source: string): string {
  return `
    <section class="panel">
      <div class="panel-header">
        <h2 class="panel-title">EZC Source</h2>
        <span class="pill">simplified C</span>
      </div>
      <div class="panel-body">
        <pre class="code-block">${escapeHtml(source.trim())}</pre>
      </div>
    </section>
  `;
}

