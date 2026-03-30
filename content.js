(() => {
  "use strict";

  const BUTTON_ID = "mammouth-pdf-export-button";
  const DIALOG_ID = "mammouth-pdf-export-dialog";
  const STORAGE_INCLUDE_THINKING = "mammouth_pdf_include_thinking";
  const STORAGE_DENSITY_MODE = "mammouth_pdf_density_mode";

  const HIDE_IN_EXPORT = [
    "button",
    "[role='button']",
    "[aria-haspopup]",
    "svg",
    ".copy-code-button-wrapper",
    ".copy-table-button-wrapper",
    ".absolute.right-4.-bottom-8\\.5",
    ".web-search-status"
  ];

  const THINKING_SELECTORS = [
    ".thinking-collapse",
    ".thinking-block",
    ".thinking-block-collapsed",
    ".thinking-block-expanded",
    ".reasoning-content",
    "[data-thinking]",
    "[aria-label*='Thinking']"
  ];

  function getIncludeThinkingDefault() {
    return localStorage.getItem(STORAGE_INCLUDE_THINKING) === "1";
  }

  function setIncludeThinkingDefault(value) {
    localStorage.setItem(STORAGE_INCLUDE_THINKING, value ? "1" : "0");
  }

  function getDensityModeDefault() {
    const saved = localStorage.getItem(STORAGE_DENSITY_MODE);
    if (saved === "compact" || saved === "ultra") return saved;
    return "normal";
  }

  function setDensityModeDefault(mode) {
    localStorage.setItem(STORAGE_DENSITY_MODE, mode);
  }

  function addButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.type = "button";
    btn.textContent = "PDF Export";
    btn.title = "MammouthAI-Chat als sauberes PDF vorbereiten";

    Object.assign(btn.style, {
      position: "fixed",
      right: "18px",
      bottom: "18px",
      zIndex: "2147483647",
      border: "0",
      borderRadius: "999px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      color: "#fff",
      background: "#202124",
      boxShadow: "0 8px 24px rgba(0,0,0,.25)"
    });

    btn.addEventListener("click", async () => {
      const options = await showExportDialog();
      if (!options) return;

      btn.disabled = true;
      const oldLabel = btn.textContent;
      btn.textContent = "Bereite PDF vor...";

      try {
        await exportConversation(options);
      } catch (err) {
        console.error("[Mammouth PDF Export]", err);
        alert("PDF-Export fehlgeschlagen. Details in der Browser-Konsole.");
      } finally {
        btn.disabled = false;
        btn.textContent = oldLabel;
      }
    });

    document.body.appendChild(btn);
  }

  function showExportDialog() {
    const existing = document.getElementById(DIALOG_ID);
    if (existing) existing.remove();

    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.id = DIALOG_ID;
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,.40)",
        zIndex: "2147483647",
        display: "grid",
        placeItems: "center",
        padding: "20px"
      });

      const panel = document.createElement("div");
      Object.assign(panel.style, {
        width: "min(460px, 100%)",
        background: "#fff",
        color: "#111",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,.35)",
        fontFamily: "Segoe UI, Arial, sans-serif"
      });

      panel.innerHTML = `
        <h3 style="margin:0 0 10px;font-size:18px;line-height:1.3;">PDF Export konfigurieren</h3>
        <p style="margin:0 0 12px;font-size:13px;color:#555;">Papierformat: <strong>A4</strong></p>
        <label style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.35;cursor:pointer;">
          <input id="mammouth-opt-thinking" type="checkbox" style="margin-top:2px;" />
          <span>Thinking-/Reasoning-Blöcke einbeziehen (optional)</span>
        </label>
        <div style="margin-top:8px;font-size:14px;line-height:1.35;">
          <div style="margin-bottom:6px;">Seitendichte:</div>
          <label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer;">
            <input name="mammouth-opt-density" value="normal" type="radio" style="margin-top:2px;" />
            <span>Normal</span>
          </label>
          <label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer;margin-top:4px;">
            <input name="mammouth-opt-density" value="compact" type="radio" style="margin-top:2px;" />
            <span>Compact</span>
          </label>
          <label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer;margin-top:4px;">
            <input name="mammouth-opt-density" value="ultra" type="radio" style="margin-top:2px;" />
            <span>Ultra Compact</span>
          </label>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">
          <button id="mammouth-export-cancel" type="button" style="border:1px solid #d0d0d0;background:#fff;border-radius:8px;padding:8px 12px;cursor:pointer;">Abbrechen</button>
          <button id="mammouth-export-run" type="button" style="border:0;background:#202124;color:#fff;border-radius:8px;padding:8px 12px;cursor:pointer;font-weight:700;">Export starten</button>
        </div>
      `;

      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      const input = panel.querySelector("#mammouth-opt-thinking");
      const densityMode = getDensityModeDefault();
      const densityInput = panel.querySelector(`input[name="mammouth-opt-density"][value="${densityMode}"]`);
      input.checked = getIncludeThinkingDefault();
      if (densityInput) densityInput.checked = true;

      function close(result) {
        overlay.remove();
        resolve(result);
      }

      overlay.addEventListener("click", (ev) => {
        if (ev.target === overlay) close(null);
      });

      panel.querySelector("#mammouth-export-cancel").addEventListener("click", () => close(null));
      panel.querySelector("#mammouth-export-run").addEventListener("click", () => {
        const includeThinking = Boolean(input.checked);
        const density = panel.querySelector("input[name='mammouth-opt-density']:checked")?.value || "normal";
        setIncludeThinkingDefault(includeThinking);
        setDensityModeDefault(density);
        close({ includeThinking, density });
      });
    });
  }

  function cleanClone(root, options) {
    const node = root.cloneNode(true);

    for (const selector of HIDE_IN_EXPORT) {
      node.querySelectorAll(selector).forEach((el) => el.remove());
    }

    if (!options.includeThinking) {
      for (const selector of THINKING_SELECTORS) {
        node.querySelectorAll(selector).forEach((el) => el.remove());
      }
    }

    node.querySelectorAll("[hidden]").forEach((el) => el.remove());

    node.querySelectorAll("img").forEach((img) => {
      img.removeAttribute("srcset");
      img.loading = "eager";
      img.decoding = "sync";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.breakInside = "avoid";
      img.style.pageBreakInside = "avoid";
    });

    return node;
  }

  function sanitizeForFilename(raw) {
    const base = (raw || "")
      .replace(/[*_`#>~[\](){}]/g, " ")
      .replace(/&[a-zA-Z]+;/g, " ")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
      .slice(0, 80);

    return base || "Chat";
  }

  function getChatNameCandidate() {
    const activeSidebarTitle =
      document.querySelector("a[aria-current='page'] .leading-5")?.textContent ||
      document.querySelector("a[aria-current='page'] [class*='truncate']")?.textContent;

    const pageTitle =
      document.querySelector("title")?.textContent ||
      document.title;

    const fromMeta = document.querySelector("meta[property='og:title']")?.getAttribute("content");

    return (activeSidebarTitle || pageTitle || fromMeta || "Chat").trim();
  }

  function buildExportBaseName() {
    const chat = sanitizeForFilename(getChatNameCandidate());
    return `MammouthAI-${chat}`;
  }

  function extractMessages(options) {
    const rows = Array.from(document.querySelectorAll("div[data-index][is-streaming-message]"));
    const entries = [];

    rows.forEach((row) => {
      const userRoot =
        row.querySelector(".user-content-span")?.closest(".message_content_1332") ||
        row.querySelector(".user-content-span");

      if (userRoot) {
        const userHtml = cleanClone(userRoot, options).innerHTML.trim();
        if (userHtml) {
          entries.push({ role: "Eingabe", html: userHtml });
        }
      }

      const assistantRoot = row.querySelector(".markdown-content");
      if (assistantRoot) {
        const assistantHtml = cleanClone(assistantRoot, options).innerHTML.trim();
        if (assistantHtml) {
          entries.push({ role: "Antwort", html: assistantHtml });
        }
      }
    });

    return entries;
  }

  function groupTurns(messages) {
    const turns = [];
    let current = null;

    messages.forEach((msg) => {
      if (!current) {
        current = { input: null, responses: [] };
        turns.push(current);
      }

      if (msg.role === "Eingabe") {
        if (current.input || current.responses.length) {
          current = { input: msg, responses: [] };
          turns.push(current);
        } else {
          current.input = msg;
        }
      } else {
        current.responses.push(msg);
      }
    });

    return turns;
  }

  function renderMessageCard(msg, number) {
    const roleClass = msg.role === "Eingabe" ? "user" : "assistant";
    return `
      <article class="msg role-${roleClass}">
        <header>
          <span class="badge">${msg.role}</span>
          <span class="idx">#${number}</span>
        </header>
        <section class="content">${msg.html}</section>
      </article>
    `;
  }

  function buildDocument(messages, options, exportBaseName) {
    const now = new Date();
    const stamp = now.toLocaleString("de-DE", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const turns = groupTurns(messages);
    let runningNumber = 0;
    const items = turns
      .map((turn, idx) => {
        const parts = [];
        if (turn.input) {
          runningNumber += 1;
          parts.push(renderMessageCard(turn.input, runningNumber));
        }
        turn.responses.forEach((response) => {
          runningNumber += 1;
          parts.push(renderMessageCard(response, runningNumber));
        });

        return `
          <section class="turn ${idx > 0 ? "turn-break" : ""}">
            <div class="turn-head">Dialog-Block ${idx + 1}</div>
            ${parts.join("\n")}
          </section>
        `;
      })
      .join("\n");

    const density = options.density || "normal";
    const layoutByDensity = {
      normal: {
        sheetPadding: "14mm 10mm",
        metaMargin: "8mm",
        metaPadding: "3mm",
        turnMargin: "0 0 8mm",
        msgMargin: "0 0 5mm",
        contentPadding: "8px 10px",
        contentGap: "8px",
        pageMargin: "10mm",
        printMsgMargin: "4mm"
      },
      compact: {
        sheetPadding: "10mm 7mm",
        metaMargin: "6mm",
        metaPadding: "2mm",
        turnMargin: "0 0 6mm",
        msgMargin: "0 0 3mm",
        contentPadding: "7px 9px",
        contentGap: "6px",
        pageMargin: "8mm",
        printMsgMargin: "3mm"
      },
      ultra: {
        sheetPadding: "8mm 5mm",
        metaMargin: "4mm",
        metaPadding: "2mm",
        turnMargin: "0 0 4mm",
        msgMargin: "0 0 2mm",
        contentPadding: "6px 8px",
        contentGap: "4px",
        pageMargin: "6mm",
        printMsgMargin: "2mm"
      }
    };
    const cfg = layoutByDensity[density] || layoutByDensity.normal;

    return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${exportBaseName}</title>
  <style>
    :root {
      --text: #1b1f24;
      --muted: #616b75;
      --line: #d6dee7;
      --bg: #ffffff;
      --user: #fff8ec;
      --assistant: #f6f9ff;
      --accent: #1f5d8b;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: "Noto Sans", "Source Sans 3", "Segoe UI", sans-serif;
      line-height: 1.5;
    }

    .sheet {
      max-width: 980px;
      margin: 0 auto;
      padding: ${cfg.sheetPadding};
    }

    .meta {
      border-bottom: 1px solid var(--line);
      margin-bottom: ${cfg.metaMargin};
      padding-bottom: ${cfg.metaPadding};
    }

    .meta h1 {
      margin: 0 0 6px;
      font-size: 24px;
      line-height: 1.25;
      letter-spacing: .01em;
    }

    .meta p {
      margin: 2px 0 0;
      color: var(--muted);
      font-size: 12px;
    }

    .turn {
      margin: ${cfg.turnMargin};
      padding-top: 0;
      border-top: 1px solid #edf2f7;
    }

    .turn-head {
      color: var(--muted);
      font-size: 11px;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin: 0 0 4px;
    }

    .role-user { background: var(--user); }
    .role-assistant { background: var(--assistant); }

    .msg {
      border: 1px solid var(--line);
      border-radius: 12px;
      margin: ${cfg.msgMargin};
      overflow: hidden;
      box-shadow: 0 1px 0 rgba(0,0,0,.02);
    }

    .msg > header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--line);
      padding: 8px 11px;
      background: #fcfdff;
      font-size: 12px;
      color: var(--muted);
    }

    .badge {
      font-weight: 700;
      letter-spacing: .02em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .content {
      padding: ${cfg.contentPadding};
      font-size: 13px;
      overflow-wrap: anywhere;
    }

    .content > * {
      margin-top: 0;
      margin-bottom: ${cfg.contentGap};
    }

    .content p,
    .content li {
      orphans: 3;
      widows: 3;
      break-inside: auto;
      page-break-inside: auto;
    }

    .msg .content pre,
    .msg .content code {
      white-space: pre-wrap !important;
      word-break: break-word;
      overflow-wrap: anywhere;
      max-width: 100%;
    }

    .msg .content pre {
      background: #f2f5f8;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px;
      break-inside: auto;
      page-break-inside: auto;
    }

    .msg .content table {
      width: 100%;
      border-collapse: collapse;
      display: block;
      overflow-x: auto;
      margin: 8px 0;
      background: #fff;
    }

    .msg .content th,
    .msg .content td {
      border: 1px solid var(--line);
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
      font-size: 12px;
    }

    .msg .content tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .msg .content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 6px 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .msg .content h1,
    .msg .content h2,
    .msg .content h3,
    .msg .content h4 {
      page-break-after: avoid;
      break-after: avoid;
      color: #223548;
    }

    @media print {
      @page {
        size: A4;
        margin: ${cfg.pageMargin};
      }

      .sheet {
        max-width: none;
        margin: 0;
        padding: 0;
      }

      .msg {
        margin-bottom: ${cfg.printMsgMargin};
      }

      a[href]:after {
        content: "";
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="meta">
      <h1>MammouthAI Chat Export</h1>
      <p>Quelle: ${location.href}</p>
      <p>Exportiert am: ${stamp}</p>
      <p>Dialog-Blöcke: ${turns.length}</p>
      <p>Nachrichten: ${messages.length}</p>
      <p>Thinking einbezogen: ${options.includeThinking ? "Ja" : "Nein"}</p>
      <p>Seitendichte: ${density === "ultra" ? "Ultra Compact" : density === "compact" ? "Compact" : "Normal"}</p>
      <p>Papierformat: A4</p>
    </div>
    ${items}
  </div>
</body>
</html>`;
  }

  async function waitForImages(doc) {
    const images = Array.from(doc.images || []);
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
          setTimeout(resolve, 3000);
        });
      })
    );
  }

  async function exportConversation(options) {
    const messages = extractMessages(options);
    const exportBaseName = buildExportBaseName();

    if (!messages.length) {
      alert("Keine exportierbaren Nachrichten gefunden. Bitte Chat vollständig laden und erneut versuchen.");
      return;
    }

    const win = window.open("about:blank", "_blank");
    if (!win) {
      alert("Popup wurde blockiert. Bitte Popups für mammouth.ai erlauben.");
      return;
    }

    const html = buildDocument(messages, options, exportBaseName);

    try {
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (err) {
      // Fallback for browsers that restrict writing into a freshly opened tab.
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      win.location.href = blobUrl;
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    }

    await new Promise((resolve) => {
      if (win.document.readyState === "complete") resolve();
      else win.addEventListener("load", resolve, { once: true });
    });

    await waitForImages(win.document);
    try {
      win.focus();
      win.print();
    } catch (err) {
      // Auto-print script in exported document handles this path.
    }
  }

  addButton();

  const observer = new MutationObserver(() => {
    if (!document.getElementById(BUTTON_ID)) addButton();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
