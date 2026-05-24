export function renderStyles(): string {
  return `
    :root {
      color-scheme: dark;
      --bg: #090d12;
      --panel: #111820;
      --panel-soft: #151f29;
      --panel-raised: #1a2632;
      --border: #263544;
      --border-strong: #3d5366;
      --text: #dbe7f1;
      --muted: #8192a4;
      --code: #edf6ff;
      --accent: #63b3ed;
      --accent-soft: #102d42;
      --pc: #f6b84a;
      --pc-soft: #372711;
      --video: #39d98a;
      --video-soft: #113725;
      --danger: #ff6b6b;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
    }

    .app {
      min-height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      background: #0d131a;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .brand-mark {
      width: 34px;
      height: 34px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3px;
      padding: 5px;
      border: 1px solid var(--border-strong);
      background: #05080c;
    }

    .brand-mark span {
      background: var(--video);
      box-shadow: 0 0 10px rgba(57, 217, 138, 0.42);
    }

    h1, h2, h3, p {
      margin: 0;
    }

    h1 {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0;
    }

    .toolbar-subtitle {
      color: var(--muted);
      font-size: 12px;
      margin-top: 2px;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .button {
      height: 32px;
      min-width: 72px;
      border: 1px solid var(--border-strong);
      background: var(--panel-raised);
      color: var(--text);
      font: inherit;
      font-size: 12px;
      font-weight: 650;
      border-radius: 6px;
      padding: 0 10px;
    }

    .button:not(:disabled) {
      cursor: pointer;
    }

    .button.primary {
      background: var(--accent);
      color: #061019;
      border-color: var(--accent);
    }

    .button:disabled {
      color: #69798a;
      background: #111820;
      border-color: #23303d;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      height: 26px;
      padding: 0 9px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: #0d151d;
      color: var(--muted);
      font-size: 12px;
      font-weight: 650;
    }

    .workbench {
      display: grid;
      grid-template-columns: minmax(280px, 0.88fr) minmax(560px, 1.58fr) minmax(300px, 0.94fr);
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 12px;
      padding: 12px;
      min-height: 0;
    }

    .panel {
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--panel);
      overflow: hidden;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
    }

    .code-panel {
      grid-column: 2;
      grid-row: 1;
    }

    .cpu-panel {
      grid-column: 3;
      grid-row: 1;
    }

    .memory-panel {
      grid-column: 1 / span 2;
      grid-row: 2;
    }

    .display-panel {
      grid-column: 3;
      grid-row: 2;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 41px;
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
      background: var(--panel-soft);
    }

    .panel-title {
      font-size: 13px;
      font-weight: 750;
    }

    .section-title {
      color: var(--muted);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .panel-body {
      min-height: 0;
      overflow: auto;
      padding: 10px;
    }

    .code-block {
      margin: 0;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: 12px;
      line-height: 1.55;
      color: var(--code);
      white-space: pre;
    }

    .source-listing {
      display: grid;
      gap: 2px;
      white-space: pre-wrap;
    }

    .source-line {
      display: grid;
      grid-template-columns: 30px 1fr;
      gap: 10px;
      min-height: 23px;
      align-items: center;
      padding: 2px 6px;
      border: 1px solid transparent;
      border-radius: 5px;
    }

    .source-line.current {
      background: var(--pc-soft);
      border-color: #6d4f18;
    }

    .source-line-number {
      color: var(--muted);
      text-align: right;
      user-select: none;
    }

    .listing {
      width: 100%;
      border-collapse: collapse;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: 12px;
    }

    .listing th,
    .listing td {
      padding: 6px 8px;
      border-bottom: 1px solid #1f2c38;
      text-align: left;
      white-space: nowrap;
      vertical-align: top;
    }

    .listing th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #17222d;
      color: var(--muted);
      font-weight: 750;
    }

    .listing tr.current td {
      background: var(--pc-soft);
      border-bottom-color: #6d4f18;
    }

    .listing tr.executed:not(.current) td {
      background: #0f2630;
      border-bottom-color: #2a6478;
    }

    .address {
      color: var(--muted);
    }

    .word {
      font-weight: 750;
      color: #96d7ff;
    }

    .cpu-state,
    .state-section,
    .register-grid,
    .state-grid,
    .display-meta {
      display: grid;
      gap: 8px;
    }

    .cpu-state {
      align-content: start;
      gap: 14px;
    }

    .register-row,
    .pc-row,
    .stat-row {
      display: grid;
      grid-template-columns: 54px 58px 1fr;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border: 1px solid #22303d;
      border-radius: 6px;
      background: #0d151d;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: 12px;
    }

    .register-row.changed {
      border-color: var(--video);
      background: #0f281f;
      box-shadow: inset 3px 0 0 var(--video);
    }

    .wide-value {
      grid-template-columns: 54px 1fr;
    }

    .register-name,
    .pc-name,
    .stat-name {
      color: var(--muted);
      font-weight: 750;
    }

    .register-value,
    .pc-value,
    .stat-value {
      min-width: 0;
      overflow-wrap: anywhere;
      font-weight: 800;
      color: var(--accent);
    }

    .memory-grid {
      display: grid;
      grid-template-columns: 50px repeat(16, minmax(20px, 1fr));
      gap: 2px;
      align-items: stretch;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: 11px;
    }

    .memory-panel .panel-body {
      overflow: hidden;
    }

    .memory-cell,
    .memory-label,
    .memory-head {
      min-height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #22303d;
      border-radius: 4px;
      background: #0d151d;
    }

    .memory-head,
    .memory-label {
      color: var(--muted);
      background: #17222d;
      font-weight: 750;
    }

    .memory-cell.video {
      color: #bcfbd7;
      background: var(--video-soft);
      border-color: #236643;
    }

    .memory-cell.instruction {
      color: #d7ecff;
      background: #10273a;
      border-color: #2b5e83;
    }

    .memory-cell.instruction-start {
      box-shadow: inset 3px 0 0 #63b3ed;
    }

    .memory-cell.pc {
      color: #ffe2a5;
      background: var(--pc-soft);
      border-color: var(--pc);
      box-shadow: inset 0 0 0 1px var(--pc);
    }

    .display-wrap {
      display: grid;
      grid-template-columns: minmax(150px, 190px) 1fr;
      align-items: start;
      gap: 16px;
    }

    .display-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      aspect-ratio: 1 / 1;
      width: 100%;
      max-width: 190px;
      padding: 8px;
      border: 1px solid var(--border-strong);
      background: #05080c;
    }

    .pixel {
      border: 1px solid #253445;
      background: #020509;
      min-width: 0;
      aspect-ratio: 1 / 1;
    }

    .pixel.on {
      background: var(--video);
      border-color: #86efac;
      box-shadow: 0 0 14px rgba(57, 217, 138, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.18);
    }

    @media (max-width: 1100px) {
      .workbench {
        grid-template-columns: 1fr;
        grid-template-rows: none;
      }

      .code-panel,
      .cpu-panel,
      .memory-panel,
      .display-panel {
        grid-column: auto;
        grid-row: auto;
      }

      .toolbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .toolbar-actions {
        justify-content: flex-start;
      }
    }
  `;
}
