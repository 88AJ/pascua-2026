/* padre-alan-chat.js - RAG Litúrgico Maestro 
   Actualizado: Ciclo A (2025-2026) según el Manual de Semana Santa
*/
(function () {
  if (window.__PADRE_ALAN_CHAT_READY__ || window.__PADRE_ALAN_CHAT_LOADING__) return;
  window.__PADRE_ALAN_CHAT_LOADING__ = true;
  try {

  const CONFIG = {
    title: "Pregúntele a los Padres",
    subtitle: "Semana Santa 2026 (Ciclo A)",
    fabText: "Pregúntele a los Padres",
    height: 610,
    width: 450,
    zIndex: 9999,
    workerTimeoutMs: 12000,
    workerUrl: "https://flat-scene-ca7c.88alansanchez.workers.dev",
    pages: {
      ramos: { file: "ramos.html", label: "Domingo de Ramos" },
      lunes: { file: "lunes.html", label: "Lunes Santo" },
      martes: { file: "martes.html", label: "Martes Santo" },
      miercoles: { file: "miercoles.html", label: "Miércoles Santo" },
      jueves: { file: "jueves.html", label: "Jueves Santo / Misa Crismal" },
      viernes: { file: "viernes.html", label: "Viernes Santo de la Pasión" },
      sabado: { file: "sabado.html", label: "Sábado Santo (Sepultura)" },
      vigilia: { file: "vigilia.html", label: "Vigilia Pascual" },
      pascua: { file: "pascua.html", label: "Domingo de Resurrección" }
    }
  };

  const WHATSAPP_NUMBER = "5218262620211";

  // =======================
  // MOTOR SEMÁNTICO (Basado en el Manual 2026)
  // =======================
  const DAY_KEYS = ["ramos", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "vigilia", "pascua"];
  const MINISTRY_KEYS = ["monaguillos", "lectores", "coro", "sacristia", "ujieres", "mec", "misal"];
  const SEARCH_MINISTRY_KEYS = ["monaguillos", "lectores", "coro", "sacristia", "ujieres", "mec"];
  const MINISTRY_DAY_KEYS = ["ramos", "lunes", "martes", "miercoles", "jueves", "viernes", "vigilia"];
  const MISAL_DAY_KEYS = ["ramos", "jueves", "viernes", "vigilia", "pascua"];
  const CELEBRANT_TERMS = [
    "padre", "sacerdote", "preside", "celebra", "celebrante", "parroco", "vicario", "arturo", "alan"
  ];
  const TEAM_LABELS = {
    monaguillos: "Monaguillos",
    lectores: "Lectores",
    coro: "Coro",
    sacristia: "Sacristía",
    ujieres: "Ujieres",
    mec: "MEC",
    coordinacion: "Coordinación General"
  };
  const TEAM_WA_HINT = {
    monaguillos: "coordinador de Monaguillos",
    lectores: "coordinador de Lectores",
    coro: "coordinador de Coro",
    sacristia: "sacristán o coordinación de Sacristía",
    ujieres: "coordinador de Ujieres",
    mec: "coordinador de MEC",
    coordinacion: "coordinación general"
  };
  const OP_TERMS = {
    emergency: ["urgente", "emergencia", "desmayo", "accidente", "caida", "sangrado", "incendio", "ambulancia", "seguridad", "riesgo"],
    roster: ["registro", "registrar", "cupo", "cupos", "lista", "asignado", "asignacion", "turno", "relevo", "ya no puedo", "no aparezco", "me cambian", "me cambiaron"],
    material: [
      "misalito", "misalitos", "hojita", "hojitas", "subsidio", "subsidios", "librito", "libritos", "folleto", "folletos",
      "copon", "copones", "vinajera", "vinajeras", "hostia", "hostias", "incienso", "naveta", "cirial", "ciriales",
      "manutergio", "purificador", "microfono", "microfonos", "casulla", "estola", "alba", "libro", "leccionario",
      "agua bendita", "agua bendito", "dispensador", "dispensadores", "pila", "pila de agua bendita", "aspersorio"
    ],
    missing: ["falta", "faltan", "no hay", "agotado", "se acabo", "se acabaron", "donde consigo", "donde encuentro", "donde hay", "reponer", "sin "],
    location: ["puerta", "lateral", "entrada", "acceso", "atrio", "pasillo", "mesa", "credencia", "sacristia", "bodega"],
    flow: ["fila", "filas", "pasillo", "acceso", "entrada", "salida", "bancos", "asientos", "aglomeracion", "congestion", "orden"],
    responsibility: ["quien", "responsable", "encargado", "a quien", "con quien", "me toca", "nos toca", "debo", "debe", "puedo", "puede"]
  };

  const chatHistory = [];

  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  function parseSimpleMarkdown(text) {
    if (!text) return "";
    let html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>")
      .replace(/\n/g, "<br>");
      
    // Basic bullet points
    html = html.replace(/(?:<br>|^)[\-\*]\s+((?:(?!<br>).)*)/g, "<li>$1</li>");
    html = html.replace(/(<li>.*?<\/li>)(?!<li>)/g, "$1</ul>").replace(/(?<!<\/li>)<li>/g, "<ul><li>");
    return html;
  }

  function inferDayFromFile(file) {
    const f = (file || "").toLowerCase();
    if (!f.endsWith(".html")) return null;
    if (f === "misal-domingo.html" || f.includes("pascua")) return "pascua";
    for (const day of DAY_KEYS) {
      if (day === "pascua") continue;
      if (f.includes(day)) return day;
    }
    return null;
  }

  function inferMinistryFromFile(file) {
    const f = (file || "").toLowerCase();
    if (!f.endsWith(".html")) return null;
    const m = f.match(/^([a-z]+)-[a-z]+\.html$/);
    if (m && MINISTRY_KEYS.includes(m[1])) return m[1];
    return null;
  }

  const dayKeywords = {
    "ramos": ["ramos", "palmas", "mt 21", "mt 26", "rojo", "entrada triunfal", "procesion ramos"],
    "lunes": ["lunes santo", "betania", "perfume", "is 42", "jn 12"],
    "martes": ["martes santo", "negaciones", "gallo", "is 49", "jn 13"],
    "miercoles": ["miercoles santo", "traicion", "judas", "is 50", "mt 26", "anacleto gonzalez"],
    "jueves": ["jueves santo", "cena del senor", "lavatorio", "mandamiento nuevo", "misa crismal", "oleos", "crisma", "monumento", "pange lingua", "traslado", "humeral"],
    "viernes": ["viernes santo", "no hay misa", "adoracion cruz", "improperios", "muerte", "septima palabra", "viacrucis", "procesion silencio", "is 52", "jn 18", "jn 19"],
    "sabado": ["sabado santo", "sepultura", "espera", "soledad", "descanso", "no hay sacramentos"],
    "vigilia": ["vigilia pascual", "fuego nuevo", "cirio", "exsultet", "pregon", "lucernario", "bautismos", "letanias", "agua pura", "gloria", "campanas", "noche santa"],
    "pascua": ["domingo de pascua", "resurreccion", "vacio", "secuencia", "in albis", "neofitos", "hech 10", "jn 20"]
  };

  const ministryKeywords = {
    "monaguillos": ["monaguillo", "acolito", "turiferario", "incensario", "naveta", "cirial", "cruciferario", "cruz procesional", "acetre", "hisopo", "palia", "corporal", "lavabo", "manutergio", "velas"],
    "lectores": ["lector", "lectura", "proclamar", "pasion", "salmista", "ambon", "leccionario", "epistola", "monicion", "libro"],
    "coro": ["cant", "himno", "salmo", "gloria", "aleluya", "pange lingua", "tantum ergo", "improperios", "secuencia", "organo", "instrumentos"],
    "sacristia": ["sacristan", "pixide", "copon", "sagrario", "custodia", "vasos sagrados", "vinajeras", "purificador", "mantel", "alba", "casulla", "estola", "dalmatica", "morado", "blanco", "rojo"],
    "ujieres": ["ujier", "ujieres", "ujiere", "ujuier", "ujer", "acomodador", "orden", "colecta", "santos lugares", "canasta", "puerta", "bienvenida"],
    "mec": ["mec", "ministro", "comunion", "enfermos", "viatico", "distribuir", "copon", "hostias", "ministro extraordinario", "ministros de comunion"]
  };

  function hasAny(text, terms) {
    return terms.some(t => text.includes(t));
  }

  function teamLabel(key) {
    return TEAM_LABELS[key] || "Coordinación";
  }

  function getDayLabel(day) {
    return day && CONFIG.pages[day] ? CONFIG.pages[day].label : "celebración actual";
  }

  function resolvePrimaryTeam(qNorm) {
    if (hasAny(qNorm, ["comunion", "copon", "sagrario", "reserva", "enfermos", "viatico"])) return "mec";
    if (hasAny(qNorm, ["lectura", "evangelio", "ambon", "salmo", "leccionario"])) return "lectores";
    if (hasAny(qNorm, ["canto", "coro", "aleluya", "salmodia", "microfono del coro"])) return "coro";
    if (hasAny(qNorm, ["procesion", "incienso", "campanilla", "lavabo", "cirial", "cruz"])) return "monaguillos";
    if (hasAny(qNorm, ["puerta", "banco", "asiento", "fila", "colecta", "acceso"])) return "ujieres";
    if (hasAny(qNorm, OP_TERMS.material)) return "sacristia";
    return "coordinacion";
  }

  function detectResourceLabel(qNorm) {
    if (hasAny(qNorm, ["agua bendita", "agua bendito", "dispensador", "pila de agua bendita", "aspersorio"])) return "agua bendita";
    if (hasAny(qNorm, ["misalito", "misalitos", "hojita", "hojitas", "subsidio", "subsidios", "librito", "libritos"])) return "misalitos";
    if (hasAny(qNorm, ["microfono", "microfonos"])) return "micrófonos";
    if (hasAny(qNorm, ["copon", "copones", "hostia", "hostias"])) return "elementos de comunión";
    if (hasAny(qNorm, ["vinajera", "vinajeras"])) return "vinajeras";
    return "material litúrgico";
  }

  function buildOperationalResponse(qNorm, day, ministry, rawQuestion) {
    const dayLabel = getDayLabel(day);
    const whoAsked = ministry ? teamLabel(ministry) : "su ministerio";
    const primaryByContent = resolvePrimaryTeam(qNorm);

    if (hasAny(qNorm, OP_TERMS.emergency)) {
      return {
        html: `<strong>Protocolo inmediato de seguridad (${dayLabel})</strong><ul><li>Detenga la acción no esencial y proteja a la persona o zona de riesgo.</li><li>Avise de inmediato a <strong>${teamLabel("coordinacion")}</strong> y a <strong>${teamLabel("ujieres")}</strong> para despejar el área.</li><li>Si hay riesgo médico, contacte servicios de emergencia locales y luego reporte al párroco/coordinación.</li><li>Una vez controlado, reanude la celebración solo con indicación del celebrante.</li></ul>`
      };
    }

    const isHolyWaterIssue = hasAny(qNorm, ["agua bendita", "agua bendito", "dispensador", "pila de agua bendita", "aspersorio"]) && (hasAny(qNorm, OP_TERMS.missing) || hasAny(qNorm, OP_TERMS.location));
    if (isHolyWaterIssue) {
      return {
        html: `<strong>Protocolo operativo: agua bendita (${dayLabel})</strong><ul><li>Responsable primario: <strong>${teamLabel("sacristia")}</strong>.</li><li>Acción inmediata: avise a sacristía para rellenar/trasladar el recipiente y habilitar el punto de acceso faltante.</li><li>Mientras se repone, indique con claridad a los fieles el punto alterno disponible para evitar desorden.</li><li>Si no se resuelve en minutos, escale a <strong>${teamLabel("coordinacion")}</strong>.</li></ul>`
      };
    }

    const isMaterialIssue = hasAny(qNorm, OP_TERMS.material) && (hasAny(qNorm, OP_TERMS.missing) || hasAny(qNorm, OP_TERMS.location));
    if (isMaterialIssue) {
      const isUjierCase = ministry === "ujieres" || hasAny(qNorm, ["ujier", "ujieres", "ujuier", "puerta", "acceso"]);
      const resource = detectResourceLabel(qNorm);
      const headline = isUjierCase
        ? `Respuesta operativa para Ujieres (${dayLabel})`
        : `Respuesta operativa de abastecimiento (${dayLabel})`;
      return {
        html: `<strong>${headline}</strong><ul><li>Responsable primario: <strong>${teamLabel("sacristia")}</strong>.</li><li>Acción inmediata: redistribuya ${resource} desde el punto con mayor existencia al punto faltante.</li><li>Solicite reposición al <strong>${TEAM_WA_HINT.sacristia}</strong> para mantener los accesos equilibrados.</li><li>Si en 2-3 minutos no se resuelve, escale a <strong>${teamLabel("coordinacion")}</strong>.</li></ul><p>En su caso concreto, si falta ${resource}, pídalo primero a <strong>Sacristía</strong>.</p>`
      };
    }

    if (hasAny(qNorm, OP_TERMS.roster)) {
      const team = ministry || primaryByContent;
      return {
        html: `<strong>Gestión de turnos y cupos (${dayLabel})</strong><ul><li>Valide primero el cupo/lista en el registro oficial del ministerio.</li><li>Si hay conflicto de turno o reemplazo, avise al <strong>${TEAM_WA_HINT[team] || TEAM_WA_HINT.coordinacion}</strong>.</li><li>No cambie funciones por cuenta propia durante la celebración sin confirmación del coordinador.</li><li>Si el caso urge y no hay respuesta, escale a <strong>${teamLabel("coordinacion")}</strong>.</li></ul>`
      };
    }

    const isFlowIssue = hasAny(qNorm, OP_TERMS.flow) && hasAny(qNorm, OP_TERMS.location);
    if (isFlowIssue) {
      return {
        html: `<strong>Protocolo de flujo y accesos (${dayLabel})</strong><ul><li>Responsable primario: <strong>${teamLabel("ujieres")}</strong>.</li><li>Abra o cierre accesos según saturación y señalización del equipo.</li><li>Redistribuya filas por pasillos laterales para evitar embudos en puerta principal.</li><li>Coordine con <strong>${teamLabel("sacristia")}</strong> si el ajuste afecta distribución de materiales.</li></ul>`
      };
    }

    const asksResponsibility = hasAny(qNorm, OP_TERMS.responsibility) && (hasAny(qNorm, OP_TERMS.location) || hasAny(qNorm, OP_TERMS.material) || hasAny(qNorm, OP_TERMS.flow));
    if (asksResponsibility) {
      const owner = primaryByContent;
      return {
        html: `<strong>Canal correcto para este caso (${dayLabel})</strong><ul><li>Responsable primario: <strong>${teamLabel(owner)}</strong>.</li><li>Su rol actual: <strong>${whoAsked}</strong> apoya sin duplicar funciones del ministerio responsable.</li><li>Si requiere decisión inmediata, confirme con el <strong>${TEAM_WA_HINT[owner] || TEAM_WA_HINT.coordinacion}</strong>.</li></ul>`
      };
    }

    if (
      hasAny(qNorm, ["donde", "donde consigo", "donde encuentro", "a quien pregunto", "con quien"]) &&
      (hasAny(qNorm, OP_TERMS.material) || hasAny(qNorm, OP_TERMS.location) || hasAny(qNorm, OP_TERMS.flow) || hasAny(qNorm, OP_TERMS.roster))
    ) {
      const owner = primaryByContent;
      return {
        html: `<strong>Orientación operativa rápida (${dayLabel})</strong><ul><li>Para esta consulta, comience con <strong>${teamLabel(owner)}</strong>.</li><li>Si no obtiene respuesta en breve, escale a <strong>${teamLabel("coordinacion")}</strong>.</li><li>Mantenga su ministerio en función y evite improvisar cambios litúrgicos sin indicación.</li></ul>`
      };
    }

    return null;
  }

  function detectDay(q) {
    const t = normalize(q);
    for (const [day, keywords] of Object.entries(dayKeywords)) {
      if (keywords.some(kw => t.includes(kw))) return day;
    }
    return null;
  }

  function detectMinistry(q) {
    const t = normalize(q);
    for (const [ministry, keywords] of Object.entries(ministryKeywords)) {
      if (keywords.some(kw => t.includes(kw))) return ministry;
    }
    if (t.includes("misal")) return "misal";
    return null;
  }

  function isCelebrantQuery(normalizedQuery) {
    return CELEBRANT_TERMS.some(t => normalizedQuery.includes(t));
  }

  function buildMinistryDayFile(ministry, day) {
    if (!ministry || !day) return null;
    if (ministry === "misal" && day === "pascua") return "misal-domingo.html";
    return `${ministry}-${day}.html`;
  }

  function getSearchTargets(q, currentCtx, currentFile) {
    const qNorm = normalize(q);
    const day = detectDay(q) || (currentCtx?.key || null);
    const min = detectMinistry(q) || (currentCtx?.ministry || null);
    const targets = [];
    const ministryPage = buildMinistryDayFile(min, day);
    const dayPage = day && CONFIG.pages[day] ? CONFIG.pages[day].file : null;
    if (ministryPage) targets.push(ministryPage);
    if (dayPage) targets.push(dayPage);
    if (currentCtx && currentFile && currentFile.endsWith(".html")) targets.push(currentFile);
    if (isCelebrantQuery(qNorm) || !day) targets.push("index.html");
    if (day && MISAL_DAY_KEYS.includes(day)) {
      const misalFile = buildMinistryDayFile("misal", day);
      if (misalFile) targets.push(misalFile);
    }
    targets.push(`kb/general.html`);
    const deduped = [...new Set(targets)];
    return {
      targets: deduped,
      day,
      min,
      primaryTarget: ministryPage || dayPage || (currentFile?.endsWith(".html") ? currentFile : "kb/general.html")
    };
  }

  function buildExpandedTargets(day, currentFile) {
    const files = [];
    if (currentFile && currentFile.endsWith(".html")) files.push(currentFile);
    files.push("index.html");
    if (day && CONFIG.pages[day]) files.push(CONFIG.pages[day].file);

    if (day && MINISTRY_DAY_KEYS.includes(day)) {
      SEARCH_MINISTRY_KEYS.forEach((ministry) => {
        const f = buildMinistryDayFile(ministry, day);
        if (f) files.push(f);
      });
      if (MISAL_DAY_KEYS.includes(day)) {
        const misalFile = buildMinistryDayFile("misal", day);
        if (misalFile) files.push(misalFile);
      }
    } else {
      Object.values(CONFIG.pages).forEach(p => files.push(p.file));
      MINISTRY_DAY_KEYS.forEach((d) => {
        SEARCH_MINISTRY_KEYS.forEach((m) => {
          const f = buildMinistryDayFile(m, d);
          if (f) files.push(f);
        });
      });
      MISAL_DAY_KEYS.forEach((d) => {
        const f = buildMinistryDayFile("misal", d);
        if (f) files.push(f);
      });
    }

    files.push("kb/general.html");
    return [...new Set(files)];
  }

  const PAGE_LABEL_OVERRIDES = {
    "landing-publico-semana-santa-2026.html": "Landing Público Semana Santa 2026",
    "portal-marketing-parroquial-2026.html": "Portal Marketing Parroquial 2026",
    "panel-coordinador.html": "Panel Coordinador"
  };

  function prettyLabelFromFile(file) {
    if (!file) return "página actual";
    if (PAGE_LABEL_OVERRIDES[file]) return PAGE_LABEL_OVERRIDES[file];
    return file
      .replace(/\.html$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  // =======================
  // LÓGICA DE BÚSQUEDA Y CACHE
  // =======================
  const __CACHE__ = new Map();
  const SHORT_TOKENS = new Set(["am", "pm", "jn", "mt", "mc", "lc", "is", "sal", "hech", "mec"]);
  const STOPWORDS = new Set([
    "que", "como", "cuando", "donde", "cual", "cuales", "quien", "quienes",
    "tengo", "hacer", "hago", "hacen", "debo", "deben", "puedo", "podemos",
    "el", "la", "los", "las", "un", "una", "unos", "unas",
    "de", "del", "en", "por", "para", "con", "sin", "sobre",
    "y", "o", "u", "se", "me", "te", "mi", "tu", "su", "sus",
    "al", "lo", "es", "son", "hay", "hoy"
  ]);

  function tokenizeQuery(q) {
    const base = normalize(q);
    const pieces = base.split(" ").filter(Boolean).filter(t => !STOPWORDS.has(t));
    const tokens = pieces.filter(t => (
      t.length >= 4 ||
      SHORT_TOKENS.has(t) ||
      /^\d{1,2}$/.test(t) ||
      /^\d{1,2}:\d{2}$/.test(t)
    ));
    if (tokens.length > 0) return [...new Set(tokens)];
    return base ? [base] : [];
  }

  async function searchContent(q, files, primaryTarget) {
    const tokens = tokenizeQuery(q);
    const normalizedQuery = normalize(q);
    const asksSchedule = hasAny(normalizedQuery, [
      "horario", "horarios", "hora", "misa", "misas", "celebracion", "celebraciones"
    ]);
    const fileOrder = new Map(files.map((f, i) => [f, i]));
    const hits = [];
    for (const f of files) {
      try {
        let data = __CACHE__.get(f);
        if (!data) {
          const res = await fetch(f);
          if (!res.ok) continue;
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, "text/html");
          
          const blocks = [];
          let currentHeading = "";
          
          const nodes = Array.from(doc.body.querySelectorAll("h1, h2, h3, h4, p, li"));
          for (const node of nodes) {
            const tag = node.tagName.toLowerCase();
            const textContent = node.textContent.trim();
            if (!textContent) continue;

            if (["h1", "h2", "h3", "h4"].includes(tag)) {
              currentHeading = textContent;
              if (textContent.length > 5) {
                blocks.push({
                  text: `[${currentHeading}]`,
                  norm: normalize(textContent)
                });
              }
            } else if (textContent.length > 20) {
              const enrichedText = currentHeading ? `[Sección: ${currentHeading}] ${textContent}` : textContent;
              blocks.push({
                text: enrichedText,
                norm: normalize(textContent)
              });
            }
          }
          data = { file: f, blocks };
          __CACHE__.set(f, data);
        }
        data.blocks.forEach(b => {
          let score = 0;
          const order = fileOrder.get(f) ?? files.length;
          score += Math.max(0, 4 - order);
          if (f === primaryTarget) score += 3;
          if (f === "kb/general.html") score -= 1;
          if (normalizedQuery && b.norm.includes(normalizedQuery)) score += 2;
          if (asksSchedule && /\b\d{1,2}\s+\d{2}\s*(am|pm)\b/.test(b.norm)) score += 2;
          tokens.forEach(t => { if (b.norm.includes(t)) score++; });
          if (score > 0) hits.push({ file: f, text: b.text, score });
        });
      } catch (e) { console.error("Error cargando:", f); }
    }
    const sorted = hits.sort((a, b) => b.score - a.score);
    const selected = [];
    const counts = new Map();

    if (primaryTarget) {
      const first = sorted.find(h => h.file === primaryTarget);
      if (first) {
        selected.push(first);
        counts.set(primaryTarget, 1);
      }
    }

    for (const h of sorted) {
      if (selected.length >= 8) break;
      if (selected.includes(h)) continue;
      const c = counts.get(h.file) || 0;
      if (c >= 3) continue;
      selected.push(h);
      counts.set(h.file, c + 1);
    }
    return selected;
  }

  // =======================
  // INTERFAZ DE USUARIO (UI)
  // =======================
  const esc = (s) => (s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
  const CLASS_ALLOWLIST = new Set(["pa-wa", "pa-src", "pa-official"]);

  function isSafeHref(href) {
    const value = (href || "").trim();
    if (!value) return false;
    if (/^\s*(javascript|data|vbscript):/i.test(value)) return false;
    try {
      const parsed = new URL(value, window.location.origin);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch (e) {
      return false;
    }
  }

  function sanitizeClasses(raw) {
    if (!raw) return "";
    return raw
      .split(/\s+/)
      .filter(Boolean)
      .filter(c => CLASS_ALLOWLIST.has(c))
      .join(" ");
  }

  function sanitizeChatHtml(unsafeHtml) {
    const tpl = document.createElement("template");
    tpl.innerHTML = unsafeHtml || "";
    const allowedTags = new Set(["A", "B", "BR", "DIV", "EM", "I", "LI", "OL", "P", "SPAN", "STRONG", "UL"]);
    const blockedTags = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "FORM", "INPUT", "BUTTON", "TEXTAREA", "SELECT"]);

    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType !== Node.ELEMENT_NODE) return;
        const tag = child.tagName;
        if (blockedTags.has(tag)) {
          child.remove();
          return;
        }
        if (!allowedTags.has(tag)) {
          const fragment = document.createDocumentFragment();
          while (child.firstChild) fragment.appendChild(child.firstChild);
          child.replaceWith(fragment);
          walk(fragment);
          return;
        }

        const href = child.getAttribute("href");
        const cls = child.getAttribute("class");
        Array.from(child.attributes).forEach((attr) => child.removeAttribute(attr.name));

        const safeClass = sanitizeClasses(cls);
        if (safeClass) child.setAttribute("class", safeClass);

        if (tag === "A") {
          if (!isSafeHref(href)) {
            child.replaceWith(document.createTextNode(child.textContent || ""));
            return;
          }
          child.setAttribute("href", href);
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer");
        }
        walk(child);
      });
    };

    walk(tpl.content);
    return tpl.innerHTML;
  }

  function stripHtml(text) {
    return (text || "").replace(/<[^>]*>/g, " ");
  }

  function formatSnapshotDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    try {
      return d.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
    } catch (e) {
      return d.toISOString().replace("T", " ").slice(0, 16);
    }
  }

  function isDeflectiveReply(text) {
    const t = normalize(stripHtml(text));
    return hasAny(t, [
      "no esta especificado",
      "no esta detallado",
      "logistica interna",
      "consulte directamente",
      "escribanos por whatsapp",
      "escribanos por wasap",
      "enlace a whatsapp"
    ]);
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = CONFIG.workerTimeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
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

  function getWaButtonHtml(q) {
    const msg = `Paz y bien. Sobre mi consulta: "${q}"\n¿Podrían orientarme?\nMi nombre es: `;
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    return `<br><br><a class="pa-wa" href="${link}" target="_blank" rel="noopener">Enviar mensaje por WhatsApp</a>`;
  }

  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  function buildPageContext(file) {
    const direct = Object.entries(CONFIG.pages).find(([, v]) => v.file.toLowerCase() === file);
    if (direct) return { key: direct[0], ...direct[1], ministry: inferMinistryFromFile(file) };
    const day = inferDayFromFile(file);
    if (day && CONFIG.pages[day]) {
      return { key: day, label: CONFIG.pages[day].label, file, ministry: inferMinistryFromFile(file) };
    }
    if (file && file.endsWith(".html")) {
      return { key: null, label: prettyLabelFromFile(file), file, ministry: inferMinistryFromFile(file) };
    }
    return null;
  }
  const ctx = buildPageContext(currentFile);

  document.head.appendChild(el("style", {}, [`
    .pa-fab{position:fixed;right:18px;bottom:18px;z-index:${CONFIG.zIndex}}
    .pa-btn{border:0;background:#5b21b6;color:#fff;padding:12px 16px;border-radius:999px;font-weight:900;text-transform:uppercase;font-size:12px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,0.2)}
    .pa-panel{position:fixed;right:18px;bottom:80px;width:min(${CONFIG.width}px,calc(100vw - 36px));height:${CONFIG.height}px;z-index:${CONFIG.zIndex};display:none}
    .pa-card{height:100%;background:#fff;border-radius:18px;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.2);overflow:hidden;font-family:sans-serif}
    .pa-head{background:#111827;color:#fff;padding:12px;display:flex;justify-content:space-between;align-items:center}
    .pa-msgs{flex:1;overflow:auto;padding:15px;background:#f3f4f6;display:flex;flex-direction:column;gap:12px}
    .pa-bubble{padding:12px;border-radius:14px;font-size:14px;line-height:1.5;background:#fff;color:#111827;max-width:90%}
    .pa-row.user{justify-content:flex-end; display:flex;}
    .pa-row.bot{justify-content:flex-start; display:flex;}
    .user .pa-bubble{background:#5b21b6;color:#fff}
    .pa-foot{padding:12px;background:#fff;border-top:1px solid #eee}
    .pa-input-row{display:flex;gap:8px}
    .pa-input{flex:1;padding:10px;border-radius:8px;border:1px solid #ddd;outline:none}
    .pa-send{background:#5b21b6;color:#fff;border:0;padding:10px 15px;border-radius:8px;cursor:pointer;font-weight:bold}
    .pa-src{font-size:11px;color:#6b7280;margin-top:10px;border-top:1px solid #eee;padding-top:5px}
    .pa-official{display:inline-block;background:#dcfce7;border:1px solid #86efac;color:#14532d;font-weight:700;font-size:10px;letter-spacing:.02em;padding:4px 8px;border-radius:999px}
    .pa-wa{display:inline-block;margin-top:5px;background:#16a34a;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:12px;text-transform:uppercase}
    .pa-card .pa-head, .pa-card .pa-head *{color:#fff !important}
    .pa-card .pa-row.bot .pa-bubble, .pa-card .pa-row.bot .pa-bubble *{color:#111827 !important}
    .pa-card .pa-row.user .pa-bubble, .pa-card .pa-row.user .pa-bubble *{color:#fff !important}
    .pa-card .pa-row.bot .pa-bubble a{color:#1d4ed8 !important;text-decoration:underline}
    .pa-card .pa-row.bot .pa-bubble .pa-wa{color:#fff !important;text-decoration:none}
    .pa-card .pa-src{color:#6b7280 !important}
    .pa-card .pa-official{color:#14532d !important}
    .pa-card .pa-input, .pa-card .pa-input::placeholder{color:#111827 !important}
    .pa-card .pa-send{color:#fff !important}
    .pa-typing { display: inline-flex; gap: 4px; align-items: center; padding: 4px 8px; }
    .pa-typing span { width: 6px; height: 6px; background: #6b7280; border-radius: 50%; animation: pa-bounce 1.4s infinite ease-in-out both; }
    .pa-typing span:nth-child(1) { animation-delay: -0.32s; }
    .pa-typing span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes pa-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  `]));

  const panel = el("div", { class: "pa-panel", id: "paPanel" }, [
    el("div", { class: "pa-card" }, [
      el("div", { class: "pa-head" }, [
        el("span", { style: "font-weight:bold" }, [CONFIG.title]),
        el("button", { style: "background:none;border:0;color:#fff;font-size:24px;cursor:pointer", onclick: () => $("paPanel").style.display="none" }, ["×"])
      ]),
      el("div", { class: "pa-msgs", id: "paMsgs" }),
      el("div", { class: "pa-foot" }, [
        el("div", { class: "pa-input-row" }, [
          el("input", { class: "pa-input", id: "paInput", placeholder: "Escriba su pregunta..." }),
          el("button", { class: "pa-send", onclick: () => reply($("paInput").value) }, ["Enviar"])
        ])
      ])
    ])
  ]);

  document.body.appendChild(el("div", { class: "pa-fab" }, [
    el("button", { class: "pa-btn", onclick: () => $("paPanel").style.display="block" }, [CONFIG.fabText])
  ]));
  document.body.appendChild(panel);

  const $ = (id) => document.getElementById(id);
  const msgs = $("paMsgs");

  function addMsg(role, html) {
    const row = el("div", { class: "pa-row " + role }, [el("div", { class: "pa-bubble" }, [])]);
    row.firstChild.innerHTML = role === "bot" ? sanitizeChatHtml(html) : html;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return row;
  }

  function showTyping() {
    return addMsg("bot", `<div class="pa-typing"><span></span><span></span><span></span></div>`);
  }

  // =======================
  // RESPUESTA Y LÓGICA DE WORKER
  // =======================
  async function reply(text) {
    if (!text.trim()) return;
    const q = text.trim();
    const qNorm = normalize(q);
    addMsg("user", esc(q));
    $("paInput").value = "";
    
    chatHistory.push({ role: "user", content: q });
    if (chatHistory.length > 6) chatHistory.splice(0, chatHistory.length - 6);

    const pideContacto = ["whatsapp", "wassap", "wasap", "contacto", "telefono", "mensaje"].some(p => qNorm.includes(p));
    const quickDay = detectDay(q) || (ctx?.key || null);
    const quickMin = detectMinistry(q) || (ctx?.ministry || null);
    const quickOperational = buildOperationalResponse(qNorm, quickDay, quickMin, q);

    if (quickOperational) {
      let opResponse = quickOperational.html;
      if (pideContacto) opResponse += getWaButtonHtml(q);
      addMsg("bot", `${opResponse}<div class="pa-src">Ruta operativa sugerida por protocolo interno.</div>`);
      return;
    }

    const typingEl = showTyping();

    try {
      const { targets, day, min, primaryTarget } = getSearchTargets(q, ctx, currentFile);
      
      // Incorporar preguntas anteriores en la búsqueda si es útil (RAG dinámico simple)
      const lastQ = chatHistory.length > 2 ? chatHistory[chatHistory.length - 3].content : "";
      const searchTerms = lastQ ? `${lastQ} ${q}` : q;
      
      let picks = await searchContent(searchTerms, targets, primaryTarget);
      const hasNonGeneral = picks.some(p => p.file !== "kb/general.html");
      if (!hasNonGeneral || picks.length < 4) {
        const expandedTargets = buildExpandedTargets(day, currentFile);
        const expandedPicks = await searchContent(searchTerms, expandedTargets, primaryTarget);
        if (expandedPicks.length > picks.length) picks = expandedPicks;
      }

      // Si no hay información en los archivos, remitir a WhatsApp
      if (picks.length === 0) {
        typingEl.remove();
        addMsg("bot", "Ese detalle no está especificado en el manual de este año. Por favor, consulte directamente con los coordinadores por WhatsApp." + getWaButtonHtml(q));
        return;
      }

      const scope = [];
      if (day) scope.push(`día=${day}`);
      if (min) scope.push(`ministerio=${min}`);
      
      const historyText = chatHistory.slice(0, -1).map(m => `${m.role === 'user' ? 'Usuario' : 'Bot'}: ${m.content}`).join("\n");
      
      const contextText = [
        "INSTRUCCION: Responde en español de México, con pasos concretos y horarios si aparecen en las fuentes. Evita respuestas genéricas.",
        "INSTRUCCION CRITICA: Eres conversacional. Usa el historial proporcionado para entender preguntas de seguimiento (ej. 'y a qué hora es' se debe entender con el contexto de la Misa y Ministerio anterior).",
        "INSTRUCCION CRITICA: Si las fuentes contienen horarios concretos, repórtelos explícitamente y no diga que no están publicados.",
        "INSTRUCCION: Si la consulta es operativa/logística, indique: acción inmediata, responsable primario y escalamiento.",
        "---",
        "HISTORIAL DE CONVERSACIÓN RECIENTE:",
        historyText || "Ninguno",
        "---",
        `CONTEXTO_DETECTADO: ${scope.length ? scope.join(", ") : "no definido"}`,
        `ARCHIVO_PRIORITARIO: ${primaryTarget || "ninguno"}`,
        "FUENTES DISPONIBLES:",
        picks.map(p => `[Fuente: ${p.file}] ${p.text}`).join("\n\n")
      ].join("\n\n");
      
      const requestMeta = {
        day: day || (ctx?.key || null),
        ministry: min || (ctx?.ministry || null),
        primaryTarget: primaryTarget || null,
        page: currentFile,
        targets,
        locale: "es-MX"
      };
      const response = await fetchWithTimeout(CONFIG.workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, context: contextText, meta: requestMeta })
      });
      if (!response.ok) throw new Error(`Worker HTTP ${response.status}`);

      const data = await response.json();
      
      // Paracaídas: Si el Worker falla o devuelve vacío
      if (!data || !data.reply) throw new Error("API Offline");

      const sources = [...new Set(picks.map(p => p.file))].map(f => `<a href="${f}">${f}</a>`).join(" | ");
      
      chatHistory.push({ role: "bot", content: data.reply });
      
      let finalResponse = parseSimpleMarkdown(data.reply);
      const usesExternalSources = data?.meta?.externalSourcesUsed === true;
      const snapshotLabel = formatSnapshotDate(data?.meta?.sourceSnapshotAt);
      const operationalFallback = buildOperationalResponse(qNorm, day, min, q);
      if (operationalFallback && isDeflectiveReply(finalResponse)) {
        finalResponse = operationalFallback.html;
      }
      
      if (pideContacto) {
        finalResponse += getWaButtonHtml(q);
      }

      const officialBadge = usesExternalSources
        ? `<div class="pa-src"><span class="pa-official">Fuente oficial actualizada${snapshotLabel ? ` · ${esc(snapshotLabel)}` : ""}</span></div>`
        : "";

      typingEl.remove();
      addMsg("bot", `${finalResponse}${officialBadge}<div class="pa-src">Fuentes: ${sources}</div>`);

    } catch (e) {
      typingEl.remove();
      addMsg("bot", "Paz y bien. Tuvimos un inconveniente técnico al consultar el manual. Por favor escríbanos por WhatsApp:" + getWaButtonHtml(q));
    }
  }

  addMsg("bot", `Paz y bien. Somos los <b>Padres</b>. ${ctx ? `Vemos que consulta sobre el <b>${ctx.label}</b>.` : ""} ¿Qué duda litúrgica tiene hoy?`);
  
  $("paInput").addEventListener("keypress", (e) => { if(e.key === 'Enter') reply($("paInput").value); });
  window.__PADRE_ALAN_CHAT_READY__ = true;
  window.__PADRE_ALAN_CHAT_LOADED__ = true;
  } catch (err) {
    console.error("Padre Alan chat init error:", err);
    window.__PADRE_ALAN_CHAT_READY__ = false;
  } finally {
    window.__PADRE_ALAN_CHAT_LOADING__ = false;
  }

})();
