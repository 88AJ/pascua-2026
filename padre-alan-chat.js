/* padre-alan-chat.js - RAG Inteligente (Voz Pastoral y Teológica) 
   Prioridad: Manual Litúrgico (Raíz) > Biblioteca (kb/)
   Enrutamiento Semántico Avanzado
*/
(function () {
  if (window.__PADRE_ALAN_CHAT_LOADED__) return;
  window.__PADRE_ALAN_CHAT_LOADED__ = true;

  const CONFIG = {
    title: "Pregúntele a los Padres",
    subtitle: "Semana Santa 2026 (Ciclo A)",
    fabText: "Pregúntele a los Padres",
    height: 610,
    width: 450,
    zIndex: 9999,
    workerUrl: "https://flat-scene-ca7c.88alansanchez.workers.dev",
    pages: {
      ramos: { file: "ramos.html", label: "Domingo de Ramos" },
      lunes: { file: "lunes.html", label: "Lunes Santo" },
      martes: { file: "martes.html", label: "Martes Santo" },
      miercoles: { file: "miercoles.html", label: "Miércoles Santo" },
      jueves: { file: "jueves.html", label: "Jueves Santo" },
      viernes: { file: "viernes.html", label: "Viernes Santo" },
      sabado: { file: "sabado.html", label: "Sábado Santo" },
      vigilia: { file: "vigilia.html", label: "Vigilia Pascual" },
      pascua: { file: "pascua.html", label: "Domingo de Resurrección" }
    }
  };

  const WHATSAPP_NUMBER = "19567401370";

  // =======================
  // DETECCIÓN INTUITIVA
  // =======================
  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  // Diccionario de Días Santos (Atrapa variaciones comunes)
  const dayKeywords = {
    "ramos": ["ramos", "palmas", "domingo de ramos", "entrada triunfal"],
    "lunes": ["lunes"],
    "martes": ["martes"],
    "miercoles": ["miercoles", "oleos", "misa crismal"],
    "jueves": ["jueves", "lavatorio", "cena del senor", "monumento", "pan ajimo"],
    "viernes": ["viernes", "cruz", "pasion", "viacrucis", "siete palabras", "oficios"],
    "sabado": ["sabado", "pesame", "luto", "sepulcro"],
    "vigilia": ["vigilia", "fuego nuevo", "cirio", "noche santa", "lucernario", "pregon", "exsultet"],
    "pascua": ["pascua", "resurreccion", "domingo de pascua"]
  };

  function detectDay(q) {
    const t = normalize(q);
    for (const [day, keywords] of Object.entries(dayKeywords)) {
      if (keywords.some(kw => t.includes(kw))) return day;
    }
    return null;
  }

  // Diccionario de Ministerios (Atrapa verbos, objetos y sinónimos)
  const ministryKeywords = {
    "ujieres": ["ujier", "acomodador", "bienvenida", "recibir", "orden", "edecan", "colecta", "canasta", "bancas"],
    "lectores": ["lector", "lectura", "leer", "proclamar", "salmista", "ambon", "leccionario", "palabra"],
    "monaguillos": ["monaguillo", "acolito", "monago", "cirial", "incensario", "naveta", "altar", "campan", "monaguilla"],
    "coro": ["coro", "music", "cant", "cancion", "alabar", "guitarra", "ensayo", "voces", "salmo", "entonar"],
    "mec": ["mec", "ministro", "comunion", "eucaristia", "hostia", "copon", "purificador", "cuerpo de cristo", "enfermos"],
    "misal": ["misal", "guion", "guia lit", "rubrica"],
    "sacristia": ["sacristia", "sacristan", "ornamento", "vasos sagrados", "vinajera", "corporal", "preparar altar", "mantel"]
  };

  function detectMinistry(q) {
    const t = normalize(q);
    for (const [ministry, keywords] of Object.entries(ministryKeywords)) {
      if (keywords.some(kw => t.includes(kw))) return ministry;
    }
    return null;
  }

  function getSearchTargets(q, currentCtx) {
    const day = detectDay(q) || (currentCtx?.key || null);
    const min = detectMinistry(q);
    const targets = [];
    
    // Prioridad 1: Cruce de Ministerio y Día (ej: coro-lunes.html)
    if (min && day) targets.push(`${min}-${day}.html`);
    // Prioridad 2: Día general (ej: lunes.html)
    if (day) targets.push(`${day}.html`);
    // Prioridad 3: Ministerio general (ej: coro.html si existe)
    if (min) targets.push(`${min}.html`);
    // Prioridad 4: Base de conocimiento general
    targets.push(`kb/general.html`);
    targets.push(`kb/faq.html`);
    
    return { targets: [...new Set(targets)], day, min };
  }

  // =======================
  // MOTOR DE BÚSQUEDA
  // =======================
  const __CACHE__ = new Map();

  async function searchContent(q, files) {
    const tokens = normalize(q).split(" ").filter(t => t.length > 3);
    const hits = [];
    for (const f of files) {
      try {
        let data = __CACHE__.get(f);
        if (!data) {
          const res = await fetch(f);
          if (!res.ok) continue;
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, "text/html");
          const blocks = Array.from(doc.querySelectorAll("h1,h2,h3,p,li")).map(n => ({
            text: n.textContent.trim(),
            norm: normalize(n.textContent)
          })).filter(b => b.text.length > 20);
          data = { file: f, blocks };
          __CACHE__.set(f, data);
        }
        data.blocks.forEach(b => {
          let score = 0;
          tokens.forEach(t => { if (b.norm.includes(t)) score++; });
          if (score > 0) hits.push({ file: f, text: b.text, score });
        });
      } catch (e) { console.error("Error cargando:", f); }
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  // =======================
  // UI & HELPERS
  // =======================
  const esc = (s) => (s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
  
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
    const msg = `Paz y bien. Necesito orientación sobre este tema:\n"${q}"\n\nMi nombre es: `;
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    return `<br><br><a class="pa-wa" href="${link}" target="_blank" rel="noopener">Enviar mensaje por WhatsApp</a>`;
  }

  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const ctx = Object.entries(CONFIG.pages).find(([k, v]) => v.file.toLowerCase() === currentFile)?.[1] || null;

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
    .pa-wa{display:inline-block;margin-top:5px;background:#16a34a;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:12px;text-transform:uppercase}
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
    row.firstChild.innerHTML = html;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // =======================
  // REPLY PRINCIPAL
  // =======================
  async function reply(text) {
    if (!text.trim()) return;
    const q = text.trim();
    const qNorm = normalize(q);
    addMsg("user", esc(q));
    $("paInput").value = "";

    // Detector de Solicitud de Contacto Directa
    const pideContacto = ["whatsapp", "wassap", "wasap", "contacto", "comunicar", "telefono", "celular", "mensaje"].some(palabra => qNorm.includes(palabra));

    addMsg("bot", "Buscando...");

    try {
      const { targets, day, min } = getSearchTargets(q, ctx);
      const picks = await searchContent(q, targets);

      // Si no encuentra nada en el manual local
      if (picks.length === 0) {
        addMsg("bot", `Ese detalle no se encuentra especificado en nuestro manual actual. Para ofrecerle una respuesta precisa y pastoral, por favor envíenos su consulta por WhatsApp.` + getWaButtonHtml(q));
        return;
      }

      const contextText = picks.map(p => `[Fuente: ${p.file}] ${p.text}`).join("\n\n");
      const response = await fetch(CONFIG.workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, context: contextText })
      });

      const data = await response.json();
      const sources = [...new Set(picks.map(p => p.file))].map(f => `<a href="${f}">${f}</a>`).join(" | ");
      
      let finalResponse = data.reply.replace(/\n/g, "<br>");
      
      // Inyectar botón si pide contacto o si la IA deriva tras su discernimiento
      if (pideContacto || finalResponse.toLowerCase().includes("whatsapp")) {
        finalResponse += getWaButtonHtml(q);
      }

      addMsg("bot", `${finalResponse}<div class="pa-src">Fuentes: ${sources}</div>`);

    } catch (e) {
      addMsg("bot", "Hubo un problema de conexión. Por favor escríbanos directamente." + getWaButtonHtml(q));
    }
  }

  addMsg("bot", `Paz y bien. Somos los <b>Padres</b>. ${ctx ? `Vemos que consulta lo referente al <b>${ctx.label}</b>.` : ""} ¿En qué podemos ayudarle hoy?`);
  
  $("paInput").addEventListener("keypress", (e) => { if(e.key === 'Enter') reply($("paInput").value); });

})();
