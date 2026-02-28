/* padre-alan-chat.js
   Chat local (GRATIS) “Pregúntele al Padre”
   - Inyecta UI automáticamente (botón + panel)
   - GitHub Pages compatible
   - SIN backend / SIN API
   - Modo smart: primero busca en /kb/ (artefactos), luego en páginas del manual
   - Si no encuentra, pide precisión o ofrece WhatsApp con mensaje prellenado
*/
(function () {
  if (window.__PADRE_ALAN_CHAT_LOADED__) return;
  window.__PADRE_ALAN_CHAT_LOADED__ = true;

  // =======================
  // CONFIG
  // =======================
  const CONFIG = {
    title: "Pregúntele al Padre",
    subtitle: "Semana Santa y Triduo Pascual 2026 (Ciclo A)",
    fabText: "Pregúntele al Padre",
    height: 610,
    width: 450,
    zIndex: 9999,

    pages: {
      ramos: { file: "ramos.html", label: "Domingo de Ramos de la Pasión del Señor" },
      lunes: { file: "lunes.html", label: "Lunes Santo" },
      martes: { file: "martes.html", label: "Martes Santo" },
      miercoles: { file: "miercoles.html", label: "Miércoles Santo" },
      jueves: { file: "jueves.html", label: "Jueves Santo de la Cena del Señor" },
      viernes: { file: "viernes.html", label: "Viernes Santo de la Pasión del Señor" },
      sabado: { file: "sabado.html", label: "Sábado Santo de la Sepultura del Señor" },
      vigilia: { file: "vigilia.html", label: "Vigilia Pascual en la Noche Santa" },
      pascua: { file: "pascua.html", label: "Domingo de Pascua de la Resurrección del Señor" }
    },

    kbDir: "kb"
  };

  // WhatsApp (formato internacional sin "+")
  const WHATSAPP_NUMBER = "19567401370";

  const MINISTRIES = ["misal", "mec", "monaguillos", "lectores", "coro", "ujieres", "sacristia"];
  const DAYS = ["ramos", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "vigilia", "pascua"];

  const MINISTRY_LABELS = {
    misal: "Misal",
    mec: "MEC",
    monaguillos: "Monaguillos",
    lectores: "Lectores",
    coro: "Coro",
    ujieres: "Ujieres",
    sacristia: "Sacristía"
  };

  // =======================
  // HELPERS
  // =======================
  const esc = (s) =>
    (s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[c]));

  function waLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // “sinónimos” para que el motor encuentre mejor
  function expandQuery(q) {
    const t = normalize(q);

    const expansions = [];
    if (/\bpalmas?\b/.test(t)) expansions.push("ramos palmas bendicion procesion hosanna");
    if (/\bramos?\b/.test(t)) expansions.push("palmas bendicion procesion entrada jerusalen");
    if (/\bpor que\b|\bque significa\b|\bsignificado\b|\bsimboliza\b|\bsentido\b/.test(t)) expansions.push("significado sentido simbolo");

    if (/\bpas(i|í)on\b/.test(t)) expansions.push("pasión lectura pasion sin incienso sin ciriales");

    return (t + " " + expansions.join(" ")).trim();
  }

  function detectDay(q) {
    const t = normalize(q);
    for (const d of DAYS) if (t.includes(d)) return d;
    if (t.includes("domingo de ramos")) return "ramos";
    if (t.includes("sabado santo")) return "sabado";
    if (t.includes("domingo de pascua") || t.includes("resurreccion")) return "pascua";
    if (t.includes("noche santa")) return "vigilia";
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
      "resurrección": "pascua",
      "noche santa": "vigilia"
    };

    if (aliases[normalized]) return aliases[normalized];
    for (const [a, k] of Object.entries(aliases)) if (normalized.includes(a)) return k;
    return null;
  }

  function dayNice(dayKey) {
    return (CONFIG.pages[dayKey]?.label) || (dayKey || "");
  }

  // =======================
  // UI (styles + elements)
  // =======================
  const style = el("style", {}, [`
    .pa-fab{position:fixed;right:18px;bottom:18px;z-index:${CONFIG.zIndex};display:flex;gap:10px;align-items:center}
    .pa-btn{border:0;background:#5b21b6;color:#fff;padding:12px 14px;border-radius:999px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;font-size:12px;box-shadow:0 12px 28px rgba(0,0,0,.18);cursor:pointer}
    .pa-btn:hover{background:#4c1d95}
    .pa-panel{position:fixed;right:18px;bottom:86px;width:min(${CONFIG.width}px,calc(100vw - 36px));height:${CONFIG.height}px;z-index:${CONFIG.zIndex};display:none}
    .pa-card{height:100%;width:100%;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 18px 48px rgba(0,0,0,.25);display:flex;flex-direction:column;font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif}
    .pa-head{background:#111827;color:#fff;padding:10px 12px;display:flex;align-items:center;justify-content:space-between}
    .pa-head-title{font-weight:900;letter-spacing:.12em;text-transform:uppercase;font-size:11px}
    .pa-close{border:0;background:transparent;color:rgba(255,255,255,.9);font-size:20px;cursor:pointer;line-height:1}
    .pa-close:hover{color:#fff}
    .pa-sub{padding:10px 12px;background:#f9fafb;border-bottom:1px solid #eef2f7;color:#374151;font-size:12px}
    .pa-msgs{flex:1;overflow:auto;padding:12px;background:#f3f4f6;display:flex;flex-direction:column;gap:10px}
    .pa-row{display:flex}
    .pa-row.user{justify-content:flex-end}
    .pa-row.bot{justify-content:flex-start}
    .pa-bubble{max-width:92%;padding:10px 12px;border-radius:16px;font-size:13px;line-height:1.42;box-shadow:0 1px 0 rgba(0,0,0,.05);border:1px solid rgba(0,0,0,.04);background:#fff;color:#111827}
    .pa-row.user .pa-bubble{background:#5b21b6;color:#fff;border-color:rgba(255,255,255,.12)}
    .pa-foot{padding:10px 12px;background:#fff;border-top:1px solid #eef2f7}
    .pa-quickbar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
    .pa-chip{border:0;background:#ede9fe;color:#4c1d95;font-weight:900;border-radius:999px;padding:6px 10px;font-size:11px;cursor:pointer}
    .pa-chip:hover{background:#ddd6fe}
    .pa-inputrow{display:flex;gap:8px}
    .pa-input{flex:1;padding:10px 12px;border-radius:12px;border:1px solid #d1d5db;outline:none;font-size:13px}
    .pa-send{border:0;background:#5b21b6;color:#fff;font-weight:900;border-radius:12px;padding:10px 12px;cursor:pointer}
    .pa-send:hover{background:#4c1d95}
    .pa-note{margin-top:8px;font-size:11px;color:#6b7280}
    .pa-wa{display:inline-flex;align-items:center;gap:8px;background:#16a34a;color:#fff;text-decoration:none;padding:10px 12px;border-radius:12px;font-weight:900;box-shadow:0 10px 22px rgba(0,0,0,.15);text-transform:uppercase;letter-spacing:.06em;font-size:11px}
    .pa-wa:hover{background:#15803d}
    .pa-wa-dot{width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.85)}
    .pa-src{margin-top:8px;font-size:11px;color:#6b7280}
    .pa-src a{color:#5b21b6;font-weight:900;text-decoration:underline}
  `]);
  document.head.appendChild(style);

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
        ctx ? `Está usted en: ${ctx.label}. ` : "",
        CONFIG.subtitle
      ]),
      el("div", { class: "pa-msgs", id: "paMsgs" }, []),
      el("div", { class: "pa-foot" }, [
        el("div", { class: "pa-quickbar", id: "paQuick" }, []),
        el("div", { class: "pa-inputrow" }, [
          el("input", { class: "pa-input", id: "paInput", type: "text", placeholder: "Escriba su pregunta..." }),
          el("button", { class: "pa-send", id: "paSend", type: "button" }, ["Enviar"])
        ]),
        el("div", { class: "pa-note" }, ["Asistente local (gratis): responde con criterios y checklists de su manual."])
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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.style.display === "block") close();
    if (e.key === "Enter" && document.activeElement === input) reply(input.value);
  });
  $("paSend").addEventListener("click", () => reply(input.value));

  // =======================
  // SEARCH ENGINE
  // =======================
  const __DOC_CACHE__ = new Map();

  function classifyLine(s) {
    const t = normalize(s);
    if (
      t.includes("no se permite") || t.includes("no esta permitido") || t.includes("prohib") ||
      t.includes("debe") || t.includes("obligator") || t.includes("necesari") || t.includes("ha de")
    ) return "obligatorio";
    if (t.includes("conviene") || t.includes("recom") || t.includes("es muy conveniente") || t.includes("es recomendable"))
      return "recomendable";
    if (t.includes("error") || t.includes("errores comunes") || t.includes("advert") || t.includes("cuid") || t.includes("evit") || t.includes("importante"))
      return "advertencia";
    return "nota";
  }

  function trimText(t, max = 320) {
    const s = (t || "").replace(/\s+/g, " ").trim();
    return s.length > max ? (s.slice(0, max) + "…") : s;
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
      if (text.length < 18) return;
      blocks.push({ tag: n.tagName.toLowerCase(), text, norm: normalize(text) });
    });

    const data = { file, blocks };
    __DOC_CACHE__.set(file, data);
    return data;
  }

  function scoreBlock(blockNorm, tokens) {
    let s = 0;
    for (const tok of tokens) {
      if (tok.length < 3) continue;
      if (blockNorm.includes(tok)) s += 2;
    }
    if (tokens.includes("significado") || tokens.includes("simbolo") || tokens.includes("simboliza") || tokens.includes("sentido")) {
      if (blockNorm.includes("signific") || blockNorm.includes("simbol")) s += 2;
    }
    return s;
  }

  function kbCandidates(day, ministry) {
    const dir = CONFIG.kbDir;
    const files = [];
    if (day && ministry) files.push(`${dir}/${ministry}-${day}.html`);
    if (day) files.push(`${dir}/${day}.html`);
    files.push(`${dir}/general.html`);
    return [...new Set(files)];
  }

  function manualCandidates(day, ministry) {
    const files = [];
    if (day && ministry) files.push(`${ministry}-${day}.html`);
    if (day && day !== "sabado" && day !== "pascua") files.push(`${day}.html`);
    if (day === "sabado") files.push("sabado.html");
    if (day === "pascua") files.push("pascua.html");
    if (!day) files.push("index.html");
    return [...new Set(files)];
  }

  async function searchFiles(question, files, maxHits = 4) {
    const expanded = expandQuery(question);
    const tokens = normalize(expanded).split(" ").filter(Boolean);

    const hits = [];

    for (const f of files) {
      try {
        const doc = await loadDoc(f);
        for (const b of doc.blocks) {
          const base = scoreBlock(b.norm, tokens);
          if (base <= 0) continue;
          const bonus = (b.tag === "h1" || b.tag === "h2" || b.tag === "h3") ? 1 : 0;
          hits.push({ file: doc.file, text: b.text, score: base + bonus });
        }
      } catch (_) { /* ignore missing */ }
    }

    hits.sort((a, b) => b.score - a.score);

    const seen = new Set();
    const picks = [];
    for (const h of hits) {
      const key = h.file + "::" + h.text.slice(0, 120);
      if (seen.has(key)) continue;
      seen.add(key);
      picks.push(h);
      if (picks.length >= maxHits) break;
    }
    return picks;
  }

  function liturgicalAnswer({ day, ministry, picks }) {
    const d = day ? dayNice(day) : null;
    const m = ministry ? (MINISTRY_LABELS[ministry] || ministry) : null;

    const groups = { obligatorio: [], recomendable: [], advertencia: [], nota: [] };
    picks.forEach(p => groups[classifyLine(p.text)].push(p));

    const primary =
      groups.obligatorio[0] ||
      groups.recomendable[0] ||
      groups.nota[0] ||
      groups.advertencia[0] ||
      picks[0];

    const secondary =
      groups.nota[1] || groups.recomendable[1] || groups.obligatorio[1] || groups.advertencia[1] || picks[1];

    const head = `
<b>Padre:</b> Con gusto. Espero que usted esté bien.<br>
${d ? `Sobre <b>${esc(d)}</b>${m ? `, para <b>${esc(m)}</b>` : ""}:<br><br>` : ""}
`.trim();

    const body = `
• ${esc(trimText(primary.text, 420))}${secondary ? `<br><br>• ${esc(trimText(secondary.text, 420))}` : ""}
`.trim();

    const src = `
<div class="pa-src">
Fuente: <a href="${esc(primary.file)}">${esc(primary.file)}</a>${secondary ? ` · <a href="${esc(secondary.file)}">${esc(secondary.file)}</a>` : ""}
</div>
`.trim();

    const close = `
<br><br>
Si usted quiere, se lo dejo en <b>dos líneas claras</b> o en <b>checklist</b>.
`.trim();

    return head + body + src + close;
  }

  function makeChecklistFromPicks(day, ministry, picks) {
    const d = day ? dayNice(day) : "el día correspondiente";
    const m = ministry ? (MINISTRY_LABELS[ministry] || ministry) : "General";

    const lines = [];
    for (const p of picks) {
      const txt = (p.text || "").replace(/\s+/g, " ").trim();
      const parts = txt.split(/(?<=[\.\;\:])\s+/).filter(Boolean);
      for (const part of parts) {
        const s = part.trim();
        if (s.length < 35) continue;
        lines.push(s);
        if (lines.length >= 10) break;
      }
      if (lines.length >= 10) break;
    }
    if (!lines.length) return null;

    const steps = lines.map((s, i) => `${i + 1}. ${esc(trimText(s, 240))}`).join("<br>");

    return `
<b>Checklist — ${esc(m)} (${esc(d)})</b><br>
${steps}
`.trim();
  }

  function askForPrecision(day) {
    return `
<b>Padre:</b> Para responderle con exactitud y sin improvisar, permítame ubicarlo.<br>
${day ? `¿Su pregunta es sobre <b>${esc(dayNice(day))}</b>, correcto?<br>` : `¿Sobre qué día: <b>Ramos, Lunes, Martes, Miércoles, Jueves, Viernes, Vigilia</b>?<br>`}
Si aplica, dígame también el ministerio: <b>misal, lectores, coro, monaguillos, ujieres, sacristía</b>.
`.trim();
  }

  function whatsappEscalation(q) {
    const page = currentFile();
    const url = window.location.href;
    const message =
`Pregunta desde el Manual (Pascua 2026):
"${q}"

Página: ${page}
URL: ${url}

(Enviado desde el chatbot del manual)`;

    addMsg("bot", `
Si a usted le parece, envíeme esta duda por WhatsApp y la reviso personalmente:<br><br>
<a class="pa-wa" href="${waLink(message)}" target="_blank" rel="noopener">
  <span class="pa-wa-dot"></span> Enviar por WhatsApp
</a>
`.trim());
  }

  // =======================
  // QUICK
  // =======================
  const QUICK = [
    {
      test: [/^\/?help$/i, /ayuda/i],
      answer: () => `
Con gusto. Puedo ayudarle con <b>Semana Santa 2026 (Ciclo A)</b>.<br><br>
<b>Ejemplos:</b><br>
• <b>¿por qué las palmas en ramos?</b><br>
• <b>checklist lectores ramos</b><br>
• <b>qué es obligatorio viernes</b><br>
• <b>coro jueves cantos</b><br>
• <b>monaguillos vigilia pasos</b><br><br>
<b>Navegación:</b> “<b>abrir ramos</b>”, “<b>abrir jueves</b>”, “<b>abrir vigilia</b>”.
      `.trim()
    },
    {
      test: [/hola|buenas|buenos d[ií]as|buenas tardes|buenas noches/i],
      answer: () => `
Paz y bien. Espero que usted esté bien.<br>
Soy el <b>Padre</b>. ${ctx ? `Veo que usted está en <b>${esc(ctx.label)}</b>.` : ""}<br>
Pregúnteme con libertad: “¿por qué…?”, “¿qué significa…?”, “¿qué es obligatorio…?”.
      `.trim()
    }
  ];

  // =======================
  // Reply
  // =======================
  async function reply(text) {
    const q = (text || "").trim();
    if (!q) return;

    addMsg("user", esc(q));
    input.value = "";

    const openKey = parseOpenCommand(q);
    if (openKey && CONFIG.pages[openKey]) {
      addMsg("bot", `Con gusto. Le llevo a: <b>${esc(CONFIG.pages[openKey].label)}</b>…`);
      setTimeout(() => goTo(openKey), 250);
      return;
    }

    const hit = QUICK.find(item => item.test.some(rgx => rgx.test(q)));
    if (hit) {
      addMsg("bot", (typeof hit.answer === "function") ? hit.answer() : hit.answer);
      return;
    }

    const day = detectDay(q) || (ctx?.key || null);
    const ministry = detectMinistry(q);

    addMsg("bot", "Un momento, por favor…");

    try {
      const kbFiles = kbCandidates(day, ministry);
      const kbPicks = await searchFiles(q, kbFiles, 4);

      if (kbPicks.length) {
        if (/checklist/i.test(q)) {
          const cl = makeChecklistFromPicks(day, ministry, kbPicks);
          if (cl) { addMsg("bot", cl); return; }
        }
        addMsg("bot", liturgicalAnswer({ day, ministry, picks: kbPicks }));
        return;
      }

      const manFiles = manualCandidates(day, ministry);
      const manPicks = await searchFiles(q, manFiles, 4);

      if (manPicks.length) {
        if (/checklist/i.test(q)) {
          const cl = makeChecklistFromPicks(day, ministry, manPicks);
          if (cl) { addMsg("bot", cl); return; }
        }
        addMsg("bot", liturgicalAnswer({ day, ministry, picks: manPicks }));
        return;
      }

      addMsg("bot", askForPrecision(day));
      whatsappEscalation(q);
      return;

    } catch (_) {
      addMsg("bot", `
<b>Padre:</b> En este momento no pude consultar los textos. Para no improvisar, prefiero confirmarlo con usted.<br>
Si a usted le parece, envíeme la pregunta por WhatsApp.
      `.trim());
      whatsappEscalation(q);
      return;
    }
  }

  // =======================
  // Quick buttons
  // =======================
  function addQuick(label, question, action) {
    const btn = el("button", { class: "pa-chip", type: "button" }, [label]);
    btn.addEventListener("click", () => {
      if (action) action();
      else reply(question);
    });
    $("paQuick").appendChild(btn);
  }

  if (ctx) addQuick("Checklist de este día", `checklist ${ctx.key}`);

  addQuick("Ramos", "abrir ramos");
  addQuick("Jueves", "abrir jueves");
  addQuick("Viernes", "abrir viernes");
  addQuick("Vigilia", "abrir vigilia");
  addQuick("Pascua", "abrir pascua");
  addQuick("Ayuda", "/help");
  addQuick("WhatsApp", null, () => {
    const msg = "Necesito ayuda con el manual litúrgico de Semana Santa 2026.";
    addMsg("bot", `
<a class="pa-wa" href="${waLink(msg)}" target="_blank" rel="noopener">
  <span class="pa-wa-dot"></span> Enviar por WhatsApp
</a>
    `.trim());
  });

  addMsg("bot", `
Paz y bien. Espero que usted esté bien.<br>
Soy el <b>Padre</b>. ${ctx ? `Veo que usted está en <b>${esc(ctx.label)}</b>.` : ""}<br><br>
Usted puede preguntar, por ejemplo:<br>
• <b>¿por qué las palmas en ramos?</b><br>
• <b>¿qué significa conservar el ramo?</b><br>
• <b>checklist lectores ramos</b><br>
• <b>qué es obligatorio viernes</b><br><br>
<i>Nota:</i> Primero consulto la Biblioteca (kb/), luego su manual.
  `.trim());

  window.__padreReply__ = reply;
})();
