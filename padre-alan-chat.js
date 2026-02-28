/* padre-alan-chat.js
   Chat local (gratis) “Pregúntale al Padre Alan”
   - Inyecta UI (botón + panel) automáticamente
   - GitHub Pages compatible
   - SIN backend / SIN API
   - “Se alimenta” de tus páginas HTML: ramos.html, jueves.html, misal-ramos.html, coro-jueves.html, etc.
   - Escalación: si no encuentra respuesta, ofrece botón para enviarte WhatsApp (manual, tú presionas enviar)
*/
(function () {
  // Evitar doble carga
  if (window.__PADRE_ALAN_CHAT_LOADED__) return;
  window.__PADRE_ALAN_CHAT_LOADED__ = true;

  // ====== Config rápida ======
  const CONFIG = {
    title: "Pregúntale al Padre Alan",
    subtitle: "Semana Santa y Triduo Pascual 2026 (Ciclo A)",
    fabText: "Pregúntale al Padre Alan",
    height: 560,
    width: 420,
    zIndex: 9999,
    pages: {
      ramos: { file: "ramos.html", label: "Domingo de Ramos" },
      lunes: { file: "lunes.html", label: "Lunes Santo" },
      martes: { file: "martes.html", label: "Martes Santo" },
      miercoles: { file: "miercoles.html", label: "Miércoles Santo" },
      jueves: { file: "jueves.html", label: "Jueves Santo" },
      viernes: { file: "viernes.html", label: "Viernes Santo" },
      sabado: { file: "sabado.html", label: "Sábado Santo" },
      vigilia: { file: "vigilia.html", label: "Vigilia Pascual" },
      pascua: { file: "pascua.html", label: "Domingo de Pascua" }
    }
  };

  // Tu WhatsApp (formato internacional SIN "+")
  const WHATSAPP_NUMBER = "19567401370";

  // ====== Helpers ======
  const esc = (s) =>
    (s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[c]));

  function waLink(message) {
    const txt = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${txt}`;
  }

  const el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    children.forEach(ch => n.appendChild(typeof ch === "string" ? document.createTextNode(ch) : ch));
    return n;
  };

  function currentFile() {
    const p = (window.location.pathname || "").toLowerCase();
    return (p.split("/").pop() || "index.html");
  }

  function contextFromFile(file) {
    const entries = Object.entries(CONFIG.pages);
    for (const [key, val] of entries) {
      if (val.file.toLowerCase() === file) return { key, ...val };
    }
    return null;
  }

  const ctx = contextFromFile(currentFile());

  function goTo(pageKey) {
    const p = CONFIG.pages[pageKey];
    if (!p) return;
    window.location.href = p.file;
  }

  function linkTo(pageKey) {
    const p = CONFIG.pages[pageKey];
    if (!p) return "";
    return `<a class="pa-link" href="${p.file}">${esc(p.file)}</a>`;
  }

  // ====== Inject styles ======
  const style = el("style", {}, [`
    .pa-fab{
      position:fixed;right:18px;bottom:18px;z-index:${CONFIG.zIndex};
      display:flex;gap:10px;align-items:center
    }
    .pa-btn{
      border:0;background:#5b21b6;color:#fff;padding:12px 14px;border-radius:999px;
      font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:12px;
      box-shadow:0 12px 28px rgba(0,0,0,.18);cursor:pointer;display:inline-flex;
      align-items:center;gap:10px
    }
    .pa-btn:hover{background:#4c1d95}
    .pa-panel{
      position:fixed;right:18px;bottom:86px;width:min(${CONFIG.width}px,calc(100vw - 36px));
      height:${CONFIG.height}px;z-index:${CONFIG.zIndex};display:none
    }
    .pa-card{
      height:100%;width:100%;background:#fff;border-radius:18px;overflow:hidden;
      border:1px solid #e5e7eb;box-shadow:0 18px 48px rgba(0,0,0,.25);
      display:flex;flex-direction:column;
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif
    }
    .pa-head{
      background:#111827;color:#fff;padding:10px 12px;display:flex;
      align-items:center;justify-content:space-between
    }
    .pa-head-title{
      font-weight:900;letter-spacing:.12em;text-transform:uppercase;font-size:11px
    }
    .pa-close{
      border:0;background:transparent;color:rgba(255,255,255,.9);font-size:20px;
      cursor:pointer;line-height:1
    }
    .pa-close:hover{color:#fff}
    .pa-sub{
      padding:10px 12px;background:#f9fafb;border-bottom:1px solid #eef2f7;
      color:#374151;font-size:12px
    }
    .pa-msgs{
      flex:1;overflow:auto;padding:12px;background:#f3f4f6;display:flex;
      flex-direction:column;gap:10px
    }
    .pa-row{display:flex}
    .pa-row.user{justify-content:flex-end}
    .pa-row.bot{justify-content:flex-start}
    .pa-bubble{
      max-width:88%;padding:10px 12px;border-radius:16px;font-size:13px;line-height:1.35;
      box-shadow:0 1px 0 rgba(0,0,0,.05);border:1px solid rgba(0,0,0,.04);
      background:#fff;color:#111827
    }
    .pa-row.user .pa-bubble{
      background:#5b21b6;color:#fff;border-color:rgba(255,255,255,.12)
    }
    .pa-foot{
      padding:10px 12px;background:#fff;border-top:1px solid #eef2f7
    }
    .pa-quickbar{
      display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px
    }
    .pa-chip{
      border:0;background:#ede9fe;color:#4c1d95;font-weight:800;border-radius:999px;
      padding:6px 10px;font-size:11px;cursor:pointer
    }
    .pa-chip:hover{background:#ddd6fe}
    .pa-inputrow{display:flex;gap:8px}
    .pa-input{
      flex:1;padding:10px 12px;border-radius:12px;border:1px solid #d1d5db;outline:none;
      font-size:13px
    }
    .pa-send{
      border:0;background:#5b21b6;color:#fff;font-weight:900;border-radius:12px;
      padding:10px 12px;cursor:pointer
    }
    .pa-send:hover{background:#4c1d95}
    .pa-link{color:#5b21b6;font-weight:900;text-decoration:underline}
    .pa-note{margin-top:8px;font-size:11px;color:#6b7280}

    /* Botón WhatsApp dentro del chat */
    .pa-wa{
      display:inline-flex;align-items:center;gap:8px;
      background:#16a34a;color:#fff;text-decoration:none;
      padding:10px 12px;border-radius:12px;font-weight:900;
      box-shadow:0 10px 22px rgba(0,0,0,.15);
      text-transform:uppercase;letter-spacing:.06em;font-size:11px
    }
    .pa-wa:hover{background:#15803d}
    .pa-wa-dot{
      width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.85)
    }
  `]);
  document.head.appendChild(style);

  // ====== Build UI ======
  const fab = el("div", { class: "pa-fab" }, [
    el("button", { class: "pa-btn", type: "button", id: "paOpen" }, [CONFIG.fabText])
  ]);

  const panel = el("div", { class: "pa-panel", id: "paPanel" }, [
    el("div", { class: "pa-card" }, [
      el("div", { class: "pa-head" }, [
        el("div", { class: "pa-head-title" }, [CONFIG.title]),
        el("button", { class: "pa-close", type: "button", id: "paClose", "aria-label": "Cerrar" }, ["×"])
      ]),
      el("div", { class: "pa-sub", id: "paSub" }, [
        ctx ? `Estás en: ${ctx.label}. ` : "",
        CONFIG.subtitle
      ]),
      el("div", { class: "pa-msgs", id: "paMsgs" }, []),
      el("div", { class: "pa-foot" }, [
        el("div", { class: "pa-quickbar", id: "paQuick" }, []),
        el("div", { class: "pa-inputrow" }, [
          el("input", { class: "pa-input", id: "paInput", type: "text", placeholder: "Escribe tu pregunta..." }),
          el("button", { class: "pa-send", id: "paSend", type: "button" }, ["Enviar"])
        ]),
        el("div", { class: "pa-note" }, ["Asistente local (gratis): busca en tus páginas del manual y responde con fuentes."])
      ])
    ])
  ]);

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const $ = (id) => document.getElementById(id);
  const msgs = $("paMsgs");
  const input = $("paInput");

  function addMsg(role, html) {
    const row = el("div", { class: "pa-row " + role }, [el("div", { class: "pa-bubble" }, [])]);
    row.firstChild.innerHTML = html;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function open() { panel.style.display = "block"; }
  function close() { panel.style.display = "none"; }

  $("paOpen").addEventListener("click", open);
  $("paClose").addEventListener("click", close);

  // Handlers (reply async)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.style.display === "block") close();
    if (e.key === "Enter" && document.activeElement === input) reply(input.value);
  });
  $("paSend").addEventListener("click", () => reply(input.value));

  // ====== Motor local (lee tus HTML y busca fragmentos relevantes) ======
  const MINISTRIES = ["misal", "mec", "monaguillos", "lectores", "coro", "ujieres", "sacristia"];
  const DAYS = ["ramos", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "vigilia", "pascua"];
  const __DOC_CACHE__ = new Map();

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function detectDay(q) {
    const t = normalize(q);
    for (const d of DAYS) if (t.includes(d)) return d;
    if (t.includes("domingo de ramos")) return "ramos";
    if (t.includes("sabado santo")) return "sabado";
    if (t.includes("domingo de pascua") || t.includes("resurreccion")) return "pascua";
    return null;
  }

  function detectMinistry(q) {
    const t = normalize(q);
    for (const m of MINISTRIES) if (t.includes(m)) return m;
    if (t.includes("ministerio de musica") || t.includes("cantos")) return "coro";
    if (t.includes("acomodadores")) return "ujieres";
    if (t.includes("monaguillo")) return "monaguillos";
    return null;
  }

  function pickFiles(day, ministry) {
    const files = [];
    if (day && ministry) files.push(`${ministry}-${day}.html`);
    if (day && day !== "sabado" && day !== "pascua") files.push(`${day}.html`);
    if (day === "sabado") files.push("sabado.html");
    if (day === "pascua") files.push("pascua.html");
    if (!day) files.push("index.html");
    return [...new Set(files)];
  }

  async function loadDoc(file) {
    if (__DOC_CACHE__.has(file)) return __DOC_CACHE__.get(file);

    const res = await fetch(file, { cache: "force-cache" });
    if (!res.ok) throw new Error(`No pude abrir ${file}`);

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const blocks = [];
    doc.querySelectorAll("h1,h2,h3,p,li").forEach(n => {
      const text = (n.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      if (text.length < 20) return;
      blocks.push({ tag: n.tagName.toLowerCase(), text, norm: normalize(text) });
    });

    const data = { file, blocks };
    __DOC_CACHE__.set(file, data);
    return data;
  }

  function scoreBlock(blockNorm, queryTokens) {
    let s = 0;
    for (const tok of queryTokens) {
      if (tok.length < 3) continue;
      if (blockNorm.includes(tok)) s += 2;
    }
    return s;
  }

  async function searchSite(question, day, ministry, maxHits = 3) {
    const tokens = normalize(question).split(" ").filter(Boolean);
    const files = pickFiles(day, ministry);

    const allHits = [];
    for (const f of files) {
      try {
        const doc = await loadDoc(f);
        for (const b of doc.blocks) {
          const base = scoreBlock(b.norm, tokens);
          if (base <= 0) continue;
          const bonus = (b.tag === "h1" || b.tag === "h2" || b.tag === "h3") ? 1 : 0;
          allHits.push({ file: doc.file, text: b.text, score: base + bonus });
        }
      } catch (_) { /* ignore */ }
    }

    allHits.sort((a, b) => b.score - a.score);

    const seen = new Set();
    const picks = [];
    for (const h of allHits) {
      const key = h.file + "::" + h.text.slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);
      picks.push(h);
      if (picks.length >= maxHits) break;
    }

    return { files, picks };
  }

  // ====== Knowledge base (respuestas rápidas) ======
  const KB = [
    {
      test: [/^\/?help$/i, /ayuda/i],
      answer: () => `
        Puedo ayudarte con <b>Semana Santa 2026 (Ciclo A)</b>.<br>
        Prueba preguntas como:<br>
        • <b>checklist monaguillos ramos</b><br>
        • <b>qué es obligatorio viernes</b><br>
        • <b>mec vigilia lecturas</b><br>
        • <b>coro jueves cantos</b><br><br>
        Comandos de navegación:<br>
        • <b>abrir ramos</b>, <b>abrir jueves</b>, <b>abrir vigilia</b>…<br>
        Páginas: ${Object.keys(CONFIG.pages).map(k => linkTo(k)).join(" · ")}
      `
    },
    {
      test: [/hola|buenas|buenos d[ií]as|buenas tardes|buenas noches/i],
      answer: () => `
        Paz y bien. Soy el <b>Padre Alan</b>.<br>
        ${ctx ? `Veo que estás en <b>${esc(ctx.label)}</b>. ¿Qué necesitas: rúbricas, checklist, o un ministerio?` : `¿Qué día o ministerio estás preparando?`}
      `
    },
    {
      test: [/colores?|ornamentos?|morado|rojo|blanco|dorado/i],
      answer: () => `
        <b>Colores litúrgicos (resumen)</b><br>
        • Ramos y Viernes Santo: <b>rojo</b><br>
        • Lunes, Martes, Miércoles: <b>morado</b><br>
        • Jueves Santo, Vigilia y Pascua: <b>blanco</b> (o <b>dorado</b>)<br>
        • Sábado Santo: sobriedad (antes de la Vigilia)
      `
    }
  ];

  // ====== Comandos “abrir X” ======
  function parseOpenCommand(text) {
    const t = (text || "").toLowerCase().trim();
    const m = t.match(/^(abrir|abre|ir a|ve a|abrir la|abre la)\s+(.+)$/i);
    if (!m) return null;

    const target = (m[2] || "").trim();
    const normalized = target
      .replace(/domingo de /g, "")
      .replace(/de la /g, "")
      .replace(/del /g, "")
      .replace(/santo|santa/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const aliases = {
      ramos: "ramos",
      lunes: "lunes",
      martes: "martes",
      miercoles: "miercoles",
      "miércoles": "miercoles",
      jueves: "jueves",
      viernes: "viernes",
      sabado: "sabado",
      "sábado": "sabado",
      vigilia: "vigilia",
      pascua: "pascua",
      resurreccion: "pascua",
      "resurrección": "pascua"
    };

    if (aliases[normalized]) return aliases[normalized];
    for (const [a, k] of Object.entries(aliases)) if (normalized.includes(a)) return k;
    return null;
  }

  // ====== WhatsApp escalation UI ======
  function whatsappEscalation(q) {
    const page = currentFile();
    const url = window.location.href;

    const message =
`Pregunta desde Pascua 2026:
"${q}"

Página: ${page}
URL: ${url}

(Enviado desde el chatbot del manual)`;

    addMsg("bot", `
      No encontré una respuesta exacta en el manual.<br><br>
      Si lo deseas, envíame tu pregunta por WhatsApp y la reviso:<br><br>
      <a class="pa-wa" href="${waLink(message)}" target="_blank" rel="noopener">
        <span class="pa-wa-dot"></span> Enviar al Padre Alan por WhatsApp
      </a>
    `);
  }

  function fallback(q = "") {
    // en fallback siempre ofrece WhatsApp (si hay pregunta)
    if (q) return whatsappEscalation(q);

    if (ctx) {
      addMsg("bot", `
        Estoy en <b>${esc(ctx.label)}</b>.<br>
        Puedes pedirme: “<b>checklist</b>”, “<b>qué es obligatorio</b>”, o un ministerio: “<b>coro</b> / <b>lectores</b> / <b>monaguillos</b>…”.<br>
        Abrir guía: ${linkTo(ctx.key)}
      `);
      return;
    }

    addMsg("bot", `
      Puedo ayudarte con <b>Semana Santa 2026</b>.<br>
      Dime el día y (si aplica) el ministerio, por ejemplo:<br>
      • “<b>lectores jueves</b>”<br>
      • “<b>coro ramos</b>”<br>
      • “<b>misal vigilia</b>”<br><br>
      Páginas: ${Object.keys(CONFIG.pages).map(k => linkTo(k)).join(" · ")}
    `);
  }

  // ====== Reply (async, usa motor local + comandos + KB) ======
  async function reply(text) {
    const q = (text || "").trim();
    if (!q) return;

    addMsg("user", esc(q));
    input.value = "";

    // 1) comando abrir
    const key = parseOpenCommand(q);
    if (key && CONFIG.pages[key]) {
      addMsg("bot", `De acuerdo. Te llevo a <b>${esc(CONFIG.pages[key].label)}</b>…`);
      setTimeout(() => goTo(key), 250);
      return;
    }

    // 2) motor local: buscar en HTML (si detecta intención)
    const day = detectDay(q) || (ctx?.key || null);
    const ministry = detectMinistry(q);

    const shouldSearch =
      !!ministry ||
      /obligatorio|rubrica|rúbrica|checklist|pasos|estructura|entrada|procesion|procesión|comunion|comunión|oracion|oración|monicion|monición|lecturas|cantos|ministros|incens|inciens|cirio|lavatorio|adoracion|adoración/i
        .test(q.toLowerCase());

    if (shouldSearch) {
      addMsg("bot", "Buscando en el manual…");

      try {
        const result = await searchSite(q, day, ministry, 3);

        if (result.picks.length) {
          const header =
            `<b>Según tu manual${day ? ` (${esc(day)})` : ""}${ministry ? ` — ${esc(ministry)}` : ""}:</b><br><br>`;

          const snippets = result.picks.map(h => {
            const link = `<a class="pa-link" href="${h.file}">${esc(h.file)}</a>`;
            return `• ${esc(h.text)}<br><span style="font-size:11px;color:#6b7280;">Fuente: ${link}</span>`;
          }).join("<br><br>");

          addMsg("bot", header + snippets);
          return;
        }

        // Nada exacto: ofrece links y WhatsApp
        const files = pickFiles(day, ministry);
        addMsg("bot",
          `No encontré un fragmento exacto, pero puedo llevarte al apartado correcto:<br>` +
          files.map(f => `• <a class="pa-link" href="${f}">${esc(f)}</a>`).join("<br>")
        );
        // además ofrece WhatsApp
        whatsappEscalation(q);
        return;

      } catch (_) {
        addMsg("bot", "No pude consultar el manual en este momento.");
        whatsappEscalation(q);
        return;
      }
    }

    // 3) KB match
    const hit = KB.find(item => item.test.some(rgx => rgx.test(q)));
    if (hit) {
      addMsg("bot", (typeof hit.answer === "function") ? hit.answer() : hit.answer);
      return;
    }

    // 4) fallback + WhatsApp
    fallback(q);
  }

  // ====== Quick buttons ======
  function addQuick(label, question, action) {
    const btn = el("button", { class: "pa-chip", type: "button" }, [label]);
    btn.addEventListener("click", () => {
      if (action) action();
      else reply(question);
    });
    $("paQuick").appendChild(btn);
  }

  if (ctx) addQuick("Este día", `checklist ${ctx.key}`);

  addQuick("Ramos", "abrir ramos");
  addQuick("Jueves", "abrir jueves");
  addQuick("Viernes", "abrir viernes");
  addQuick("Vigilia", "abrir vigilia");
  addQuick("Pascua", "abrir pascua");
  addQuick("Colores", "colores litúrgicos");
  addQuick("Ayuda", "/help");
  addQuick("WhatsApp", null, () => {
    whatsappEscalation("Necesito ayuda con el manual (mensaje manual).");
  });

  // Mensaje inicial
  addMsg("bot", `
    Soy el <b>Padre Alan</b>.<br>
    ${ctx
      ? `Estás en <b>${esc(ctx.label)}</b>. Pregúntame por <b>checklist</b> o por un ministerio: <b>misal</b>, <b>mec</b>, <b>monaguillos</b>, <b>lectores</b>, <b>coro</b>, <b>ujieres</b>, <b>sacristía</b>.`
      : `Estoy listo para ayudarte con <b>${esc(CONFIG.subtitle)}</b>.<br>
         Ejemplos: “<b>lectores jueves</b>”, “<b>coro ramos</b>”, “<b>misal vigilia</b>”.`
    }
  `);
})();
