/* padre-alan-chat.js
   Chat local (GRATIS) “Pregúntele al Padre Alan”
   - Inyecta UI (botón + panel) automáticamente
   - GitHub Pages compatible
   - SIN backend / SIN API
   - Se alimenta de sus páginas HTML (día + ministerio)
   - Si no encuentra, ofrece enviar por WhatsApp (usted sólo da “Enviar”)
*/
(function () {
  if (window.__PADRE_ALAN_CHAT_LOADED__) return;
  window.__PADRE_ALAN_CHAT_LOADED__ = true;

  // ====== Config ======
  const CONFIG = {
    title: "Pregúntele al Padre Alan",
    subtitle: "Semana Santa y Triduo Pascual 2026 (Ciclo A)",
    fabText: "Pregúntele al Padre Alan",
    height: 580,
    width: 430,
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
    }
  };

  // WhatsApp (formato internacional sin "+")
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

  // ====== Nombres litúrgicos (no mostrar “nombres feos” de archivos) ======
  const MINISTRY_LABELS = {
    misal: "Misal",
    mec: "MEC",
    monaguillos: "Monaguillos",
    lectores: "Lectores",
    coro: "Coro",
    ujieres: "Ujieres",
    sacristia: "Sacristía"
  };

  function dayLabel(dayKey) {
    return (CONFIG.pages[dayKey]?.label) || dayKey || "";
  }

  function prettyFile(file) {
    const f = (file || "").toLowerCase();

    // páginas principales
    for (const [k, v] of Object.entries(CONFIG.pages)) {
      if (v.file.toLowerCase() === f) return dayLabel(k);
    }
    if (f === "index.html") return "Índice del Manual";

    // ministerio-día => “Misal — Jueves Santo...”
    const m = f.match(/^([a-zñ]+)-([a-zñ]+)\.html$/i);
    if (m) {
      const min = MINISTRY_LABELS[m[1]] || (m[1].charAt(0).toUpperCase() + m[1].slice(1));
      const dKey = m[2];
      const d = dayLabel(dKey) || (dKey.charAt(0).toUpperCase() + dKey.slice(1));
      return `${min} — ${d}`;
    }

    // fallback
    return file;
  }

  function linkFile(file) {
    const title = prettyFile(file);
    return `<a class="pa-link" href="${file}">${esc(title)}</a>`;
  }

  // ====== Inject styles ======
  const style = el("style", {}, [`
    .pa-fab{position:fixed;right:18px;bottom:18px;z-index:${CONFIG.zIndex};display:flex;gap:10px;align-items:center}
    .pa-btn{
      border:0;background:#5b21b6;color:#fff;padding:12px 14px;border-radius:999px;
      font-weight:900;letter-spacing:.06em;text-transform:uppercase;font-size:12px;
      box-shadow:0 12px 28px rgba(0,0,0,.18);cursor:pointer
    }
    .pa-btn:hover{background:#4c1d95}
    .pa-panel{
      position:fixed;right:18px;bottom:86px;width:min(${CONFIG.width}px,calc(100vw - 36px));
      height:${CONFIG.height}px;z-index:${CONFIG.zIndex};display:none
    }
    .pa-card{
      height:100%;width:100%;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;
      box-shadow:0 18px 48px rgba(0,0,0,.25);display:flex;flex-direction:column;
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif
    }
    .pa-head{background:#111827;color:#fff;padding:10px 12px;display:flex;align-items:center;justify-content:space-between}
    .pa-head-title{font-weight:900;letter-spacing:.12em;text-transform:uppercase;font-size:11px}
    .pa-close{border:0;background:transparent;color:rgba(255,255,255,.9);font-size:20px;cursor:pointer;line-height:1}
    .pa-close:hover{color:#fff}
    .pa-sub{padding:10px 12px;background:#f9fafb;border-bottom:1px solid #eef2f7;color:#374151;font-size:12px}
    .pa-msgs{flex:1;overflow:auto;padding:12px;background:#f3f4f6;display:flex;flex-direction:column;gap:10px}
    .pa-row{display:flex}
    .pa-row.user{justify-content:flex-end}
    .pa-row.bot{justify-content:flex-start}
    .pa-bubble{
      max-width:90%;padding:10px 12px;border-radius:16px;font-size:13px;line-height:1.38;
      box-shadow:0 1px 0 rgba(0,0,0,.05);border:1px solid rgba(0,0,0,.04);background:#fff;color:#111827
    }
    .pa-row.user .pa-bubble{background:#5b21b6;color:#fff;border-color:rgba(255,255,255,.12)}
    .pa-foot{padding:10px 12px;background:#fff;border-top:1px solid #eef2f7}
    .pa-quickbar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
    .pa-chip{border:0;background:#ede9fe;color:#4c1d95;font-weight:900;border-radius:999px;padding:6px 10px;font-size:11px;cursor:pointer}
    .pa-chip:hover{background:#ddd6fe}
    .pa-inputrow{display:flex;gap:8px}
    .pa-input{flex:1;padding:10px 12px;border-radius:12px;border:1px solid #d1d5db;outline:none;font-size:13px}
    .pa-send{border:0;background:#5b21b6;color:#fff;font-weight:900;border-radius:12px;padding:10px 12px;cursor:pointer}
    .pa-send:hover{background:#4c1d95}
    .pa-link{color:#5b21b6;font-weight:900;text-decoration:underline}
    .pa-note{margin-top:8px;font-size:11px;color:#6b7280}

    .pa-wa{
      display:inline-flex;align-items:center;gap:8px;background:#16a34a;color:#fff;text-decoration:none;
      padding:10px 12px;border-radius:12px;font-weight:900;box-shadow:0 10px 22px rgba(0,0,0,.15);
      text-transform:uppercase;letter-spacing:.06em;font-size:11px
    }
    .pa-wa:hover{background:#15803d}
    .pa-wa-dot{width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.85)}
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
        el("div", { class: "pa-note" }, [
          "Asistente local (gratis): responde desde su manual. Si hace falta, usted puede enviarme la duda por WhatsApp."
        ])
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

  // ====== Motor local (lee HTML y busca fragmentos) ======
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

  async function searchSite(question, day, ministry, maxHits = 4) {
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
      const key = h.file + "::" + h.text.slice(0, 90);
      if (seen.has(key)) continue;
      seen.add(key);
      picks.push(h);
      if (picks.length >= maxHits) break;
    }

    return { files, picks };
  }

  // ====== Voz “Padre Alan” (usted, clásica, clara) ======
  function classifyLine(s) {
    const t = normalize(s);
    if (
      t.includes("no se permite") || t.includes("no esta permitido") || t.includes("prohib") ||
      t.includes("debe") || t.includes("obligator") || t.includes("necesari") || t.includes("ha de")
    ) return "obligatorio";
    if (t.includes("conviene") || t.includes("recom") || t.includes("es muy conveniente") || t.includes("es recomendable"))
      return "recomendable";
    if (t.includes("advert") || t.includes("cuid") || t.includes("evit") || t.includes("importante"))
      return "advertencia";
    return "nota";
  }

  function trimText(t, max = 260) {
    const s = (t || "").replace(/\s+/g, " ").trim();
    return s.length > max ? (s.slice(0, max) + "…") : s;
  }

  function liturgicalWrap({ q, day, ministry, picks }) {
    const dayNice = day ? (CONFIG.pages[day]?.label || day) : "el día correspondiente";
    const minNice = ministry ? (MINISTRY_LABELS[ministry] || ministry) : null;

    const groups = { obligatorio: [], recomendable: [], advertencia: [], nota: [] };
    for (const p of picks) {
      groups[classifyLine(p.text)].push(p);
    }

    function renderGroup(title, arr, limit) {
      const items = arr.slice(0, limit).map(h => {
        const line = trimText(h.text, 280);
        return `• ${esc(line)}<br><span style="font-size:11px;color:#6b7280;">Referencia en el manual: ${linkFile(h.file)}</span>`;
      }).join("<br><br>");
      if (!items) return "";
      return `<b>${title}</b><br>${items}<br><br>`;
    }

    const intro = `
<b>Padre Alan:</b> Con gusto. Espero que usted esté bien.<br>
Sobre <b>${esc(dayNice)}</b>${minNice ? `, para <b>${esc(minNice)}</b>` : ""}, esto es lo esencial según su manual:
<br><br>
`;

    const body =
      renderGroup("Lo obligatorio (rúbrica)", groups.obligatorio, 2) +
      renderGroup("Lo recomendable (mejor práctica)", groups.recomendable, 2) +
      renderGroup("Advertencias (para no equivocarse)", groups.advertencia, 1) +
      renderGroup("Nota útil", groups.nota, 1);

    const close = `
<b>Si usted quiere</b>, dígame: <i>“checklist”</i> y le ordeno esto en pasos, de principio a fin (sin perder las rúbricas).
`;

    return intro + (body || ("No encontré un párrafo exacto, pero puedo llevarle al apartado correcto.<br><br>")) + close;
  }

  function makeChecklistFromPicks(day, ministry, picks) {
    const dayNice = day ? (CONFIG.pages[day]?.label || day) : "el día correspondiente";
    const minNice = ministry ? (MINISTRY_LABELS[ministry] || ministry) : "general";

    const lines = [];
    for (const p of picks) {
      const txt = (p.text || "").replace(/\s+/g, " ").trim();
      // separamos “frases” para checklist, sin inventar contenido
      const parts = txt.split(/(?<=[\.\;\:])\s+/).filter(Boolean);
      for (const part of parts) {
        const s = part.trim();
        if (s.length < 35) continue;
        if (lines.length >= 10) break;
        lines.push(s);
      }
      if (lines.length >= 10) break;
    }

    if (!lines.length) return null;

    const steps = lines.map((s, i) => `${i + 1}. ${esc(trimText(s, 240))}`).join("<br>");
    const refs = [...new Set(picks.map(p => p.file))].slice(0, 3).map(f => `• ${linkFile(f)}`).join("<br>");

    return `
<b>Checklist — ${esc(minNice)} (${esc(dayNice)})</b><br>
${steps}
<br><br>
<span style="font-size:11px;color:#6b7280;">
<b>Referencias:</b><br>${refs}
</span>
`;
  }

  // ====== KB (respuestas rápidas) ======
  const KB = [
    {
      test: [/^\/?help$/i, /ayuda/i],
      answer: () => `
        Con gusto. Puedo ayudarle con <b>Semana Santa 2026 (Ciclo A)</b>.<br><br>
        <b>Ejemplos:</b><br>
        • <b>checklist monaguillos ramos</b><br>
        • <b>qué es obligatorio viernes</b><br>
        • <b>mec vigilia lecturas</b><br>
        • <b>coro jueves cantos</b><br><br>
        <b>Navegación:</b> “<b>abrir ramos</b>”, “<b>abrir jueves</b>”, “<b>abrir vigilia</b>”.<br>
      `
    },
    {
      test: [/hola|buenas|buenos d[ií]as|buenas tardes|buenas noches/i],
      answer: () => `
        Paz y bien. Espero que usted esté bien.<br>
        Soy el <b>Padre Alan</b>. ${ctx ? `Veo que usted está en <b>${esc(ctx.label)}</b>.` : ""}<br>
        Dígame: día y, si aplica, ministerio (<b>misal</b>, <b>mec</b>, <b>lectores</b>, <b>coro</b>, <b>ujieres</b>…).
      `
    },
    {
      test: [/colores?|ornamentos?|morado|rojo|blanco|dorado/i],
      answer: () => `
        <b>Colores litúrgicos (resumen)</b><br>
        • Ramos y Viernes Santo: <b>rojo</b><br>
        • Lunes, Martes, Miércoles Santo: <b>morado</b><br>
        • Jueves Santo, Vigilia y Pascua: <b>blanco</b> (o <b>dorado</b>)<br>
        • Sábado Santo: sobriedad (antes de la Vigilia)
      `
    }
  ];

  // ====== Comando “abrir X” ======
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

  // ====== WhatsApp escalation ======
  function whatsappEscalation(q) {
    const page = currentFile();
    const url = window.location.href;

    const message =
`Pregunta desde Pascua 2026 (chatbot):
"${q}"

Página: ${page}
URL: ${url}

(Enviado desde el manual litúrgico)`;

    addMsg("bot", `
      Si le parece, envíeme su duda por WhatsApp y la reviso personalmente:<br><br>
      <a class="pa-wa" href="${waLink(message)}" target="_blank" rel="noopener">
        <span class="pa-wa-dot"></span> Enviar al Padre Alan por WhatsApp
      </a>
    `);
  }

  function fallback(q = "") {
    if (q) {
      addMsg("bot", `
        No encontré un apartado suficientemente claro para responder con precisión.<br>
        Para no improvisar: con gusto lo reviso con usted.
      `);
      whatsappEscalation(q);
      return;
    }

    addMsg("bot", `
      Con gusto. Dígame el día y el ministerio (si aplica).<br>
      Ejemplos: “<b>lectores jueves</b>”, “<b>coro ramos</b>”, “<b>misal vigilia</b>”, “<b>checklist ujieres viernes</b>”.
    `);
  }

  // ====== Reply (async) ======
  async function reply(text) {
    const q = (text || "").trim();
    if (!q) return;

    addMsg("user", esc(q));
    input.value = "";

    // 1) Abrir página
    const key = parseOpenCommand(q);
    if (key && CONFIG.pages[key]) {
      addMsg("bot", `Con gusto. Le llevo a: <b>${esc(CONFIG.pages[key].label)}</b>…`);
      setTimeout(() => goTo(key), 250);
      return;
    }

    // 2) Buscar en manual
    const day = detectDay(q) || (ctx?.key || null);
    const ministry = detectMinistry(q);

    const shouldSearch =
      !!ministry ||
      /obligatorio|rubrica|rúbrica|checklist|pasos|estructura|entrada|procesion|procesión|comunion|comunión|oracion|oración|monicion|monición|lecturas|cantos|ministros|inciens|incens|cirio|lavatorio|adoracion|adoración|secuencia|aspersión/i
        .test(q.toLowerCase());

    if (shouldSearch) {
      addMsg("bot", "Un momento, por favor… estoy consultando el manual.");

      try {
        const result = await searchSite(q, day, ministry, 4);

        if (result.picks.length) {
          // checklist si lo pidió
          if (/checklist/i.test(q)) {
            const cl = makeChecklistFromPicks(day, ministry, result.picks);
            if (cl) {
              addMsg("bot", cl);
              return;
            }
          }

          // respuesta elocuente “Padre Alan”
          addMsg("bot", liturgicalWrap({ q, day, ministry, picks: result.picks }));
          return;
        }

        // no encontró: muestre enlaces litúrgicos (no nombres de archivo) + WhatsApp
        const files = pickFiles(day, ministry);
        const links = files.map(f => `• ${linkFile(f)}`).join("<br>");

        addMsg("bot", `
          No encontré una coincidencia exacta con esas palabras, pero sí puedo dirigirle al lugar correcto:<br><br>
          ${links}
        `);
        whatsappEscalation(q);
        return;

      } catch (_) {
        addMsg("bot", "En este momento no pude consultar el manual (posible archivo no disponible).");
        whatsappEscalation(q);
        return;
      }
    }

    // 3) KB
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

  if (ctx) addQuick("Checklist de este día", `checklist ${ctx.key}`);

  addQuick("Ramos", "abrir ramos");
  addQuick("Jueves Santo", "abrir jueves");
  addQuick("Viernes Santo", "abrir viernes");
  addQuick("Vigilia Pascual", "abrir vigilia");
  addQuick("Pascua", "abrir pascua");
  addQuick("Colores", "colores litúrgicos");
  addQuick("Ayuda", "/help");
  addQuick("WhatsApp", null, () => whatsappEscalation("Necesito ayuda con el manual litúrgico."));

  // Mensaje inicial
  addMsg("bot", `
    Paz y bien. Espero que usted esté bien.<br>
    Soy el <b>Padre Alan</b>. ${ctx ? `Veo que usted está en <b>${esc(ctx.label)}</b>.` : ""}<br><br>
    Usted puede preguntar, por ejemplo:<br>
    • <b>checklist monaguillos jueves</b><br>
    • <b>qué es obligatorio viernes</b><br>
    • <b>lectores vigilia lecturas</b><br>
    • <b>coro ramos cantos</b><br>
  `);
})();
