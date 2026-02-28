/* padre-alan-chat.js
   Chat local (gratis) “Pregúntale al Padre Alan”
   - Inyecta UI (botón + panel) automáticamente
   - GitHub Pages compatible
   - No requiere backend ni servicios externos
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
    // Páginas del manual
    pages: {
      "ramos": { file: "ramos.html", label: "Domingo de Ramos" },
      "lunes": { file: "lunes.html", label: "Lunes Santo" },
      "martes": { file: "martes.html", label: "Martes Santo" },
      "miercoles": { file: "miercoles.html", label: "Miércoles Santo" },
      "jueves": { file: "jueves.html", label: "Jueves Santo" },
      "viernes": { file: "viernes.html", label: "Viernes Santo" },
      "sabado": { file: "sabado.html", label: "Sábado Santo" },
      "vigilia": { file: "vigilia.html", label: "Vigilia Pascual" },
      "pascua": { file: "pascua.html", label: "Domingo de Pascua" }
    }
  };

  // ====== Helpers ======
  const esc = (s) =>
    (s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));

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
    const file = p.split("/").pop() || "index.html";
    return file;
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
    .pa-fab {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: ${CONFIG.zIndex};
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .pa-btn {
      border: 0;
      background: #5b21b6;
      color: #fff;
      padding: 12px 14px;
      border-radius: 999px;
      font-weight: 800;
      letter-spacing: .06em;
      text-transform: uppercase;
      font-size: 12px;
      box-shadow: 0 12px 28px rgba(0,0,0,.18);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .pa-btn:hover { background: #4c1d95; }

    .pa-panel {
      position: fixed;
      right: 18px;
      bottom: 86px;
      width: min(${CONFIG.width}px, calc(100vw - 36px));
      height: ${CONFIG.height}px;
      z-index: ${CONFIG.zIndex};
      display: none;
    }
    .pa-card {
      height: 100%;
      width: 100%;
      background: #fff;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 18px 48px rgba(0,0,0,.25);
      display: flex;
      flex-direction: column;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
    }
    .pa-head {
      background: #111827;
      color: #fff;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pa-head-title {
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      font-size: 11px;
    }
    .pa-close {
      border: 0;
      background: transparent;
      color: rgba(255,255,255,.9);
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
    }
    .pa-close:hover { color: #fff; }
    .pa-sub {
      padding: 10px 12px;
      background: #f9fafb;
      border-bottom: 1px solid #eef2f7;
      color: #374151;
      font-size: 12px;
    }
    .pa-msgs {
      flex: 1;
      overflow: auto;
      padding: 12px;
      background: #f3f4f6;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .pa-row { display: flex; }
    .pa-row.user { justify-content: flex-end; }
    .pa-row.bot { justify-content: flex-start; }

    .pa-bubble {
      max-width: 88%;
      padding: 10px 12px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.35;
      box-shadow: 0 1px 0 rgba(0,0,0,.05);
      border: 1px solid rgba(0,0,0,.04);
      background: #fff;
      color: #111827;
    }
    .pa-row.user .pa-bubble {
      background: #5b21b6;
      color: #fff;
      border-color: rgba(255,255,255,.12);
    }

    .pa-foot {
      padding: 10px 12px;
      background: #fff;
      border-top: 1px solid #eef2f7;
    }
    .pa-quickbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
    }
    .pa-chip {
      border: 0;
      background: #ede9fe;
      color: #4c1d95;
      font-weight: 800;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 11px;
      cursor: pointer;
    }
    .pa-chip:hover { background: #ddd6fe; }

    .pa-inputrow { display: flex; gap: 8px; }
    .pa-input {
      flex: 1;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid #d1d5db;
      outline: none;
      font-size: 13px;
    }
    .pa-send {
      border: 0;
      background: #5b21b6;
      color: #fff;
      font-weight: 900;
      border-radius: 12px;
      padding: 10px 12px;
      cursor: pointer;
    }
    .pa-send:hover { background: #4c1d95; }

    .pa-link {
      color: #5b21b6;
      font-weight: 900;
      text-decoration: underline;
    }
    .pa-note {
      margin-top: 8px;
      font-size: 11px;
      color: #6b7280;
    }
  `]);

  document.head.appendChild(style);

  // ====== Build UI ======
  const fab = el("div", { class: "pa-fab" }, [
    el("button", {
      class: "pa-btn",
      type: "button",
      id: "paOpen"
    }, [CONFIG.fabText])
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
        el("div", { class: "pa-note" }, ["Asistente local (gratis): responde con reglas y banco del manual."])
      ])
    ])
  ]);

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const $ = (id) => document.getElementById(id);
  const msgs = $("paMsgs");
  const input = $("paInput");

  function addMsg(role, html) {
    const row = el("div", { class: "pa-row " + role }, [
      el("div", { class: "pa-bubble" }, [])
    ]);
    row.firstChild.innerHTML = html;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function open() { panel.style.display = "block"; }
  function close() { panel.style.display = "none"; }

  $("paOpen").addEventListener("click", open);
  $("paClose").addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.style.display === "block") close();
    if (e.key === "Enter" && document.activeElement === input) reply(input.value);
  });

  $("paSend").addEventListener("click", () => reply(input.value));

   // ====== Motor local (lee tus HTML y busca fragmentos relevantes) ======
const MINISTRIES = [
  "misal", "mec", "monaguillos", "lectores", "coro", "ujieres", "sacristia"
];

// días principales (ya los tienes)
const DAYS = ["ramos","lunes","martes","miercoles","jueves","viernes","sabado","vigilia","pascua"];

// cache en memoria (para no fetch cada vez)
const __DOC_CACHE__ = new Map();

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectDay(q) {
  const t = normalize(q);
  for (const d of DAYS) {
    if (t.includes(d)) return d;
  }
  // alias útiles
  if (t.includes("domingo de ramos") || t.includes("ramos")) return "ramos";
  if (t.includes("miercoles") || t.includes("miércoles")) return "miercoles";
  if (t.includes("sabado") || t.includes("sábado")) return "sabado";
  return null;
}

function detectMinistry(q) {
  const t = normalize(q);
  for (const m of MINISTRIES) {
    if (t.includes(m)) return m;
  }
  // alias
  if (t.includes("ministerio de musica") || t.includes("cantos")) return "coro";
  if (t.includes("acomodadores")) return "ujieres";
  if (t.includes("monaguillo")) return "monaguillos";
  return null;
}

// Decide qué archivo consultar según día + ministerio
function pickFiles(day, ministry) {
  const files = [];
  // si hay ministerio, prioriza ministerio-dia
  if (day && ministry) files.push(`${ministry}-${day}.html`);

  // si es sábado o pascua (tú dijiste que suelen NO tener subpáginas), usa página general
  if (day === "sabado") files.push("sabado.html");
  if (day === "pascua") files.push("pascua.html");

  // si no hay ministerio o no existe, usa página del día
  if (day && day !== "sabado" && day !== "pascua") files.push(`${day}.html`);

  // si no detectó día, por defecto index
  if (!day) files.push("index.html");

  // quitar duplicados
  return [...new Set(files)];
}

async function loadDoc(file) {
  if (__DOC_CACHE__.has(file)) return __DOC_CACHE__.get(file);

  const res = await fetch(file, { cache: "force-cache" });
  if (!res.ok) throw new Error(`No pude abrir ${file}`);
  const html = await res.text();

  const doc = new DOMParser().parseFromString(html, "text/html");

  // Extrae bloques “buscables”: headings + p + li
  const blocks = [];
  const nodes = doc.querySelectorAll("h1,h2,h3,p,li");
  nodes.forEach(n => {
    const text = (n.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;
    // filtra basura típica
    if (text.length < 20) return;
    blocks.push({
      tag: n.tagName.toLowerCase(),
      text,
      norm: normalize(text)
    });
  });

  const data = { file, blocks };
  __DOC_CACHE__.set(file, data);
  return data;
}

function scoreBlock(blockNorm, queryTokens) {
  // score simple: suma de tokens encontrados
  let s = 0;
  for (const tok of queryTokens) {
    if (tok.length < 3) continue;
    if (blockNorm.includes(tok)) s += 2;
  }
  // bonus si viene de heading
  return s;
}

async function searchSite(question, day, ministry, maxHits = 3) {
  const qNorm = normalize(question);
  const tokens = qNorm.split(" ").filter(Boolean);

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
    } catch (e) {
      // si un archivo no existe, simplemente continúa
    }
  }

  allHits.sort((a, b) => b.score - a.score);

  // compacta: toma los top N, evitando repetidos idénticos
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
   
  // ====== Knowledge base (respuestas) ======
  const KB = [
    {
      test: [/^\/?help$/i, /ayuda/i],
      answer: () => `
        Puedo ayudarte con <b>Semana Santa 2026 (Ciclo A)</b>.<br>
        Comandos útiles:<br>
        • <b>abrir ramos</b>, <b>abrir jueves</b>, <b>abrir vigilia</b>...<br>
        • <b>checklist jueves</b>, <b>qué es obligatorio viernes</b>...<br>
        • <b>colores litúrgicos</b><br><br>
        Páginas: ${Object.keys(CONFIG.pages).map(k => linkTo(k)).join(" · ")}
      `
    },
    {
      test: [/hola|buenas|buenos d[ií]as|buenas tardes|buenas noches/i],
      answer: () => `
        Paz y bien. Soy el <b>Padre Alan</b>.<br>
        ${ctx ? `Veo que estás en <b>${esc(ctx.label)}</b>. ¿Rúbricas, estructura o checklist?` : `¿Qué día estás preparando?`}
      `
    },
    {
      test: [/colores?|ornamentos?|morado|rojo|blanco|dorado/i],
      answer: () => `
        <b>Colores litúrgicos (resumen)</b><br>
        • Ramos y Viernes Santo: <b>rojo</b><br>
        • Lunes, Martes, Miércoles Santo: <b>morado</b><br>
        • Jueves Santo, Vigilia y Pascua: <b>blanco</b> (o <b>dorado</b>)<br>
        • Sábado Santo: sobriedad (sin “fiesta” antes de la Vigilia)
      `
    },
    {
      test: [/ramos|domingo de ramos/i],
      answer: () => `
        <b>Domingo de Ramos</b><br>
        • Conmemoración de la Entrada: bendición + Evangelio + entrada solemne/procesión.<br>
        • La Pasión se proclama en todas las Misas (al menos forma breve).<br><br>
        Abrir guía: ${linkTo("ramos")}
      `
    },
    {
      test: [/jueves santo|cena del se[nñ]or|lavatorio|reserva/i],
      answer: () => `
        <b>Jueves Santo</b><br>
        • Misa después del inicio de la tarde.<br>
        • Sagrario vacío; consagrar también para el Viernes Santo.<br>
        • Lavatorio: opcional, sin espectáculo.<br>
        • Traslado del Santísimo: sobrio (no “sepulcro/monumento”).<br><br>
        Abrir guía: ${linkTo("jueves")}
      `
    },
    {
      test: [/viernes santo|pasi[oó]n|adoraci[oó]n de la cruz|no hay misa/i],
      answer: () => `
        <b>Viernes Santo</b><br>
        • No hay Misa; Comunión solo dentro de la acción litúrgica.<br>
        • Altar desnudo; inicio en silencio con postración.<br>
        • Adoración de una sola Cruz, con orden y sobriedad.<br><br>
        Abrir guía: ${linkTo("viernes")}
      `
    },
    {
      test: [/vigilia|noche santa|cirio|luz de cristo|preg[oó]n/i],
      answer: () => `
        <b>Vigilia Pascual</b><br>
        • Debe ser de noche: no iniciar antes de que oscurezca.<br>
        • El Cirio Pascual es el signo del Resucitado.<br>
        • Gloria con campanas; Aleluya solemne; liturgia bautismal bien hecha.<br><br>
        Abrir guía: ${linkTo("vigilia")}
      `
    },
    {
      test: [/pascua|resurrecci[oó]n|secuencia/i],
      answer: () => `
        <b>Domingo de Pascua</b><br>
        • Aspersión recomendada en lugar del acto penitencial.<br>
        • Secuencia obligatoria (cantar o recitar).<br><br>
        Abrir guía: ${linkTo("pascua")}
      `
    }
  ];

  // ====== Comandos “abrir X” ======
  function parseOpenCommand(text) {
    const t = (text || "").toLowerCase().trim();
    // ejemplos: "abrir jueves", "ir a ramos", "abre vigilia"
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

    // mapear a keys
    const aliases = {
      ramos: "ramos",
      "domingo de ramos": "ramos",
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

    // intentar match directo
    if (aliases[normalized]) return aliases[normalized];

    // intentar contains
    for (const [a, k] of Object.entries(aliases)) {
      if (normalized.includes(a)) return k;
    }
    return null;
  }

  function fallback() {
    if (ctx) {
      addMsg("bot", `
        Estoy en <b>${esc(ctx.label)}</b>.<br>
        Pídeme: “estructura”, “qué es obligatorio”, “checklist”, o “errores comunes”.<br>
        Abrir guía: ${linkTo(ctx.key)}
      `);
      return;
    }

    addMsg("bot", `
      Puedo ayudarte con <b>Semana Santa 2026</b>.<br>
      Dime el día o usa: <b>abrir ramos</b>, <b>abrir jueves</b>, <b>abrir viernes</b>, <b>abrir vigilia</b>.<br><br>
      Páginas: ${Object.keys(CONFIG.pages).map(k => linkTo(k)).join(" · ")}
    `);
  }

  function reply(text) {
    const q = (text || "").trim();
    if (!q) return;

    addMsg("user", esc(q));
    input.value = "";

    // comando abrir
    const key = parseOpenCommand(q);
    if (key && CONFIG.pages[key]) {
      addMsg("bot", `De acuerdo. Te llevo a <b>${esc(CONFIG.pages[key].label)}</b>…`);
      setTimeout(() => goTo(key), 250);
      return;
    }

    // KB match
    const hit = KB.find(item => item.test.some(rgx => rgx.test(q)));
    if (hit) addMsg("bot", (typeof hit.answer === "function") ? hit.answer() : hit.answer);
    else fallback();
  }
   
// ====== Intenta responder desde tus HTML (motor local) ======
const day = detectDay(q) || (typeof ctx !== "undefined" && ctx?.key ? ctx.key : null);
const ministry = detectMinistry(q);

// Si pregunta menciona un ministerio o pide algo “técnico”, buscamos
const shouldSearch =
  !!ministry ||
  /obligatorio|rubrica|rúbrica|checklist|pasos|estructura|entrada|procesion|procesión|comunion|comunión|oracion|oración|monicion|monición/i.test(q);

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
      return; // ya respondió
    }

    // si no encontró nada, ofrece links directos
    const files = pickFiles(day, ministry);
    addMsg("bot",
      `No encontré un fragmento exacto, pero puedo llevarte al apartado correcto:<br>` +
      files.map(f => `• <a class="pa-link" href="${f}">${esc(f)}</a>`).join("<br>")
    );
    return;

  } catch (e) {
    addMsg("bot", "No pude consultar el manual en este momento. Intenta de nuevo.");
    return;
  }
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

  // Si hay contexto, agrega “Este día”
  if (ctx) addQuick("Este día", `Dame un resumen litúrgico para ${ctx.label}`);

  // Botones principales
  addQuick("Ramos", "abrir ramos");
  addQuick("Jueves", "abrir jueves");
  addQuick("Viernes", "abrir viernes");
  addQuick("Vigilia", "abrir vigilia");
  addQuick("Pascua", "abrir pascua");
  addQuick("Colores", "colores litúrgicos");
  addQuick("Ayuda", "/help");

  // Mensaje inicial
  addMsg("bot", `
    Soy el <b>Padre Alan</b>.<br>
    ${ctx
      ? `Estás en <b>${esc(ctx.label)}</b>. ¿Quieres rúbricas, estructura, ministerios o checklist?`
      : `Estoy listo para ayudarte con <b>${esc(CONFIG.subtitle)}</b>.<br>
         Puedes decir: <b>abrir jueves</b>, <b>abrir vigilia</b>, etc.`
    }
  `);
})();
