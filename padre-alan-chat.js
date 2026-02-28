/* padre-alan-chat.js - RAG Inteligente (Voz Pastoral) 
   Prioridad: Manual Litúrgico (Raíz) > Biblioteca (kb/)
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
  // DETECCIÓN Y LÓGICA
  // =======================
  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  function detectDay(q) {
    const t = normalize(q);
    const days = ["ramos", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "vigilia", "pascua"];
    for (const d of days) if (t.includes(d)) return d;
    if (t.includes("resurreccion")) return "pascua";
    if (t.includes("noche santa")) return "vigilia";
    return null;
  }

  function detectMinistry(q) {
    const t = normalize(q);
    if (t.includes("ujier") || t.includes("acomodador")) return "ujieres";
    if (t.includes("lector") || t.includes("lectura")) return "lectores";
    if (t.includes("monaguillo") || t.includes("acolito")) return "monaguillos";
    if (t.includes("musica") || t.includes("coro") || t.includes("canto")) return "coro";
    if (t.includes("comunion") || t.includes("ministro") || t.includes("mec")) return "mec";
    if (t.includes("misal")) return "misal";
    if (t.includes("sacristia") || t.includes("sacristan")) return "sacristia";
    return null;
  }

  function getSearchTargets(q, currentCtx) {
    const day = detectDay(q) || (currentCtx?.key || null);
    const min = detectMinistry(q);
    const targets = [];
    if (min && day) targets.push(`${min}-${day}.html`);
    if (day) targets.push(`${day}.html`);
    if (min) targets.push(`${min}.html`);
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

  function whatsappEscalation(q) {
    const msg = `Hola Padre, necesito atención personal sobre este tema:\n"${q}"\n\nMi nombre es: `;
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    addMsg("bot", `
      <a class="pa-wa" href="${link}" target="_blank" rel="noopener">
        Enviar mensaje por WhatsApp
      </a>
    `);
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
    .pa-wa{display:inline-block;margin-top:10px;background:#16a34a;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:12px;text-transform:uppercase}
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
    addMsg("user", esc(q));
    $("paInput").value = "";

    // --- Detector de Alertas Pastorales ---
    const alertas = ["queja", "problema", "incorrecto", "protestante", "error", "abuso", "discusion", "pelea", "falta"];
    const esAlerta = alertas.some(palabra => normalize(q).includes(palabra));

    if (esAlerta) {
      addMsg("bot", "Entendemos la situación. Los temas que afectan la dignidad de la liturgia o la armonía en nuestra comunidad requieren atención personal. Por favor, contáctenos a través del siguiente enlace; deje su mensaje de texto y no olvide incluir su nombre al final.");
      whatsappEscalation(q);
      return;
    }

    addMsg("bot", "Consultando el manual...");

    try {
      const { targets, day, min } = getSearchTargets(q, ctx);
      const picks = await searchContent(q, targets);

      if (picks.length === 0) {
        addMsg("bot", `No encontramos ese detalle específico en nuestro manual. Por favor, contáctenos a través del enlace; déjenos su mensaje con su nombre al final para atenderle personalmente.`);
        whatsappEscalation(q);
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

      addMsg("bot", `${data.reply.replace(/\n/g, "<br>")}<div class="pa-src">Fuentes: ${sources}</div>`);
    } catch (e) {
      addMsg("bot", "Hubo un problema de conexión. Por favor escríbanos directamente por WhatsApp.");
      whatsappEscalation(q);
    }
  }

  addMsg("bot", `Paz y bien. Somos los <b>Padres</b>. ${ctx ? `Vemos que consulta lo referente al <b>${ctx.label}</b>.` : ""} ¿En qué podemos ayudarle hoy?`);
  
  // Soporte para tecla Enter
  $("paInput").addEventListener("keypress", (e) => { if(e.key === 'Enter') reply($("paInput").value); });

})();
