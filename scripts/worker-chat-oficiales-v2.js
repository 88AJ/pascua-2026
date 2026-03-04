const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
};

const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];
const FALLBACK_WA_NUMBER = "19567401370";
const PARISH_OFFICE_PHONE = "+52 826 268 4887";
const PARISH_OFFICE_LABEL = "Oficina Parroquial de Allende";
const SNAPSHOT_KEY = "official_sources_snapshot_v1";
const SNAPSHOT_TTL_SECONDS = 6 * 60 * 60; // 6 horas
const MAX_CONTEXT_LEN = 14000;

// Jerarquía oficial definida por usted:
// 1) Parroquia local
// 2) Arquidiócesis MTY / Pastoral Litúrgica MTY
// 3) CEM
// 4) Formación oficial complementaria
const OFFICIAL_SOURCES = [
  {
    id: "parroquia_local",
    label: "Parroquia San Pedro Apóstol",
    url: "https://88aj.github.io/pascua-2026/landing-publico-semana-santa-2026.html",
    priority: 1,
  },
  {
    id: "parroquia_facebook",
    label: "Parroquia San Pedro Apóstol (Facebook)",
    url: "https://www.facebook.com/profile.php?id=100080397279166",
    priority: 1,
  },
  {
    id: "arquidiocesis_mty",
    label: "Arquidiócesis de Monterrey",
    url: "https://www.arquidiocesismty.org/",
    priority: 2,
  },
  {
    id: "pastoral_liturgica_mty",
    label: "Pastoral Litúrgica MTY",
    url: "https://www.pastoralliturgicamty.org/",
    priority: 2,
  },
  {
    id: "cem",
    label: "Conferencia del Episcopado Mexicano",
    url: "https://cem.org.mx/",
    priority: 3,
  },
  {
    id: "uniam",
    label: "UNIAM",
    url: "https://www.uniam.edu.mx/",
    priority: 4,
  },
  {
    id: "pastoral_siglo21",
    label: "Pastoral Siglo 21",
    url: "https://pastoralsiglo21.org/",
    priority: 4,
  },
  {
    id: "redcm",
    label: "Red CM",
    url: "https://www.redcm.net/",
    priority: 4,
  },
];

// Fuente oficial fija basada en la imagen compartida por la parroquia.
// Se incluye para asegurar respuestas útiles aunque Facebook no permita extracción automática.
const OFFICIAL_STATIC_SOURCES = [
  {
    id: "parroquia_horario_general_facebook_imagen",
    label: "Parroquia San Pedro Apóstol (Horario general - imagen oficial)",
    url: "https://www.facebook.com/profile.php?id=100080397279166",
    priority: 1,
    title: "Horario general parroquial y oficina",
    text:
      "Misa diaria: 8:00 am y 6:00 pm. " +
      "Misa dominical: 8:00 am, 10:00 am, 12:00 pm y 6:00 pm. " +
      "Confesiones: todos los días. " +
      "Horarios de oficina: lunes a viernes de 9:00 am a 1:00 pm y de 3:00 pm a 7:00 pm; sábados de 9:00 am a 1:00 pm. " +
      "Teléfono parroquial: 8262684887.",
  },
];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, terms) {
  return terms.some((t) => text.includes(t));
}

function escapeHtml(text = "") {
  return String(text).replace(/[&<>"']/g, (c) => {
    const m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return m[c] || c;
  });
}

function tokenizeForSearch(text = "") {
  return normalize(text)
    .split(" ")
    .filter(Boolean)
    .filter((t) => t.length >= 3)
    .slice(0, 20);
}

function detectIntent(query) {
  const q = normalize(query);

  if (
    hasAny(q, [
      "confieso",
      "pecado",
      "pecados",
      "adulterio",
      "fornicacion",
      "pornografia",
      "aborto",
      "robo",
      "direccion espiritual",
      "fuero interno",
    ])
  ) return "confesion_privada";

  if (
    hasAny(q, [
      "confesion",
      "confesiones",
      "confesarme",
      "a que hora confiesan",
      "cuando hay confesiones",
      "horario de confesiones",
    ])
  ) return "confesiones";

  if (hasAny(q, ["homilia", "predica", "sermon"])) return "homilia";

  if (
    hasAny(q, [
      "falta",
      "faltan",
      "no hay",
      "donde consigo",
      "donde encuentro",
      "puerta",
      "acceso",
      "fila",
      "turno",
      "cupo",
      "registro",
      "lista",
      "relevo",
      "misalito",
      "agua bendita",
      "microfono",
      "copon",
      "vinajera",
      "inventario",
      "llave",
    ])
  ) return "operativo";

  if (hasAny(q, ["horario", "horarios", "a que hora", "misas", "misa"])) return "horarios";

  if (
    hasAny(q, [
      "oficina",
      "telefono",
      "secretaria",
      "tramite",
      "tramites",
      "acta",
      "bautizo",
      "matrimonio",
      "confirmacion",
      "requisitos",
      "catequesis",
      "platicas",
      "cita",
    ])
  ) return "parroquial";

  if (
    hasAny(q, [
      "doctrina",
      "catecismo",
      "magisterio",
      "teologia",
      "gracia",
      "sacramento",
      "eucaristia",
      "redencion",
      "cruz",
      "resurreccion",
    ])
  ) return "teologico";

  return "teologico";
}

function detectOwner(query) {
  const q = normalize(query);
  if (hasAny(q, ["misalito", "agua bendita", "vinajera", "copon", "hostia", "incienso", "casulla", "estola", "microfono"])) return "Sacristía";
  if (hasAny(q, ["puerta", "fila", "acceso", "bancos", "colecta", "orden de entrada"])) return "Ujieres";
  if (hasAny(q, ["comunion", "enfermos", "viatico", "reserva eucaristica", "copon"])) return "MEC";
  if (hasAny(q, ["lectura", "ambon", "leccionario", "evangelio", "salmo"])) return "Lectores";
  if (hasAny(q, ["canto", "coro", "aleluya", "salmodia", "tono"])) return "Coro";
  if (hasAny(q, ["procesion", "campanilla", "lavabo", "cirial", "cruz procesional"])) return "Monaguillos";
  return "Coordinación General";
}

function extractCandidateText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => (typeof p?.text === "string" ? p.text : ""))
      .join("\n")
      .trim() || ""
  );
}

function parseModelJson(raw) {
  if (!raw) return null;
  const direct = raw.trim();
  try {
    return JSON.parse(direct);
  } catch (_) {}

  const unfenced = direct.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(unfenced);
  } catch (_) {}

  const i = unfenced.indexOf("{");
  const j = unfenced.lastIndexOf("}");
  if (i >= 0 && j > i) {
    const slice = unfenced.slice(i, j + 1);
    try {
      return JSON.parse(slice);
    } catch (_) {}
  }
  return null;
}

function buildWhatsAppCta(query, waNumber) {
  const msg = `Paz y bien. Sobre mi consulta: "${query}"\n¿Podrían orientarme?\nMi nombre es: `;
  const link = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  return `<br><br>Aquí le dejamos el enlace directo para que nos envíe un mensaje personal. Por favor, incluya su nombre al final:<br><a class="pa-wa" href="${link}" target="_blank" rel="noopener noreferrer">Enviar mensaje por WhatsApp</a>`;
}

function looksGeneric(text) {
  const t = normalize(String(text).replace(/<[^>]*>/g, " "));
  return hasAny(t, [
    "logistica interna",
    "consulte directamente",
    "escribanos por whatsapp",
    "no esta especificado",
    "no estan especificados",
    "no esta detallado",
    "no estan detallados",
    "no tengo informacion",
    "te recomendamos consultar directamente",
    "visita el sitio web",
    "busca la seccion",
    "calendario completo",
    "ver horarios",
    "ver imagen",
  ]);
}

function hasConcreteScheduleInfo(text) {
  const t = String(text || "");
  return (
    /\b\d{1,2}(:\d{2})?\s*(am|pm)\b/i.test(t) ||
    /lunes|martes|miercoles|jueves|viernes|sabado|domingo/i.test(t) ||
    /todos\s+los\s+dias|diariamente|cada\s+dia/i.test(t)
  );
}

function isWeakConfessionReply(text) {
  const plain = normalize(String(text || "").replace(/<[^>]*>/g, " "));
  if (looksGeneric(plain)) return true;
  // Si no hay hora concreta de confesiones, preferimos no inventar.
  if (!hasConcreteScheduleInfo(plain)) return true;
  return false;
}

function extractConfessionScheduleFromContext(text) {
  const plain = normalize(String(text || ""));
  if (/confesiones?\s+todos\s+los\s+dias|todos\s+los\s+dias\s+confesiones?/.test(plain)) {
    return "Confesiones: todos los días.";
  }
  return "";
}

function operationalFallback(owner) {
  return `<strong>Orientación operativa inmediata</strong><ul><li>Acción inmediata: reporte la incidencia y estabilice la operación del punto (acceso/material/flujo) sin detener la celebración.</li><li>Responsable primario: <strong>${escapeHtml(owner)}</strong>.</li><li>Escalamiento: si no se resuelve en minutos, avise a <strong>Coordinación General</strong>.</li></ul>`;
}

function officeFallback(query) {
  return `No tengo un dato oficial confirmado para: "<strong>${escapeHtml(query)}</strong>".<br><br>Por favor comuníquese a <strong>${PARISH_OFFICE_LABEL}</strong>: <strong>${PARISH_OFFICE_PHONE}</strong>.`;
}

function composeReply(envelope, { intent, ownerHint, query, waNumber }) {
  const mode = normalize(envelope?.mode || intent || "teologico");
  const owner = String(envelope?.owner || ownerHint || "").trim();
  const escalation = String(envelope?.escalation || "").trim();
  const needsWhatsapp = envelope?.needs_whatsapp === true;
  const steps = Array.isArray(envelope?.steps) ? envelope.steps.filter(Boolean).slice(0, 5) : [];

  let answer = String(envelope?.answer_short || "").trim();

  if (!answer) {
    if (mode === "operativo") {
      answer = "Para esta situación, procedamos con orden pastoral y operativo.";
    } else if (mode === "confesion_privada") {
      answer = "Este espacio es para orientación litúrgica y pastoral. Para el sacramento de la confesión o dirección espiritual, por favor acérquese presencialmente a la parroquia.";
    } else if (mode === "confesiones" || mode === "parroquial") {
      answer = officeFallback(query);
    } else {
      answer = "Con gusto le orientamos con base en el manual y la enseñanza de la Iglesia.";
    }
  }

  if (mode === "confesion_privada") {
    answer = "Este espacio es para orientación litúrgica y pastoral. Para el sacramento de la confesión o dirección espiritual, por favor acérquese presencialmente a la parroquia.";
  }

  if (mode === "operativo") {
    if (steps.length > 0) {
      answer += `<br><br><strong>Acción inmediata:</strong><ul>${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`;
    }
    if (owner) answer += `<br><strong>Responsable primario:</strong> ${escapeHtml(owner)}.`;
    if (escalation) answer += `<br><strong>Escalamiento:</strong> ${escapeHtml(escalation)}.`;
  }

  if (needsWhatsapp && !answer.includes("wa.me/")) {
    answer += buildWhatsAppCta(query, waNumber);
  }

  return answer;
}

function stripHtmlToText(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html = "", fallback = "") {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (m?.[1]) return stripHtmlToText(m[1]).slice(0, 180);
  return fallback;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function collectSourceSnapshot(source) {
  const response = await fetchWithTimeout(source.url, {
    headers: {
      "User-Agent": "PadreAlanBot/1.0 (+https://88aj.github.io/pascua-2026/)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) return null;
  const html = await response.text();
  const title = extractTitle(html, source.label);
  const text = stripHtmlToText(html).slice(0, 7000);
  if (!text) return null;

  return {
    id: source.id,
    label: source.label,
    url: source.url,
    priority: source.priority,
    title,
    text,
    fetchedAt: new Date().toISOString(),
  };
}

async function refreshOfficialContext(env) {
  if (!env.OFFICIAL_CONTEXT_KV || typeof env.OFFICIAL_CONTEXT_KV.put !== "function") {
    return { ok: false, reason: "OFFICIAL_CONTEXT_KV no configurado" };
  }

  const docs = OFFICIAL_STATIC_SOURCES.map((s) => ({
    ...s,
    fetchedAt: new Date().toISOString(),
  }));
  const errors = [];

  for (const source of OFFICIAL_SOURCES) {
    try {
      const snapshot = await collectSourceSnapshot(source);
      if (snapshot) docs.push(snapshot);
      else errors.push(`${source.id}: sin contenido`);
    } catch (err) {
      errors.push(`${source.id}: ${err.message}`);
    }
  }

  docs.sort((a, b) => a.priority - b.priority);

  const payload = {
    updatedAt: new Date().toISOString(),
    docs,
    errors,
  };

  await env.OFFICIAL_CONTEXT_KV.put(SNAPSHOT_KEY, JSON.stringify(payload), {
    expirationTtl: SNAPSHOT_TTL_SECONDS,
  });

  return { ok: true, count: docs.length, errors };
}

async function loadOfficialContext(env) {
  if (!env.OFFICIAL_CONTEXT_KV || typeof env.OFFICIAL_CONTEXT_KV.get !== "function") return null;
  const raw = await env.OFFICIAL_CONTEXT_KV.get(SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function scoreDocForQuery(doc, queryTokens, intent) {
  const norm = normalize(`${doc.title} ${doc.text}`);
  let score = 0;

  // Prioridad oficial: menor número = mayor autoridad
  score += Math.max(0, 8 - Number(doc.priority || 8));

  for (const t of queryTokens) {
    if (norm.includes(t)) score += 2;
  }

  if (intent === "horarios" && /horario|misa|misas|confesion|confesiones/.test(norm)) score += 3;
  if (intent === "confesiones" && /confesion|confesiones|sacramento|penitencia/.test(norm)) score += 4;
  if (intent === "parroquial" && /oficina|telefono|secretaria|tramite|requisitos/.test(norm)) score += 3;

  return score;
}

function buildExternalContextBlock(query, intent, snapshot) {
  if (!snapshot?.docs?.length) return "";
  const tokens = tokenizeForSearch(query);

  const ranked = snapshot.docs
    .map((d) => ({ d, score: scoreDocForQuery(d, tokens, intent) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.d);

  if (!ranked.length) return "";

  return ranked
    .map((d) => {
      const snippet = d.text.slice(0, 1200);
      return `[Fuente oficial externa: ${d.label} | prioridad=${d.priority} | fecha=${d.fetchedAt} | url=${d.url}] ${snippet}`;
    })
    .join("\n\n");
}

function buildSystemInstruction() {
  return `
Usted opera en el portal "Pregúntele a los Padres". Actúa como voz del equipo sacerdotal: ortodoxa, pastoral, clara y aplicable.

JERARQUÍA DE FUENTES (OBLIGATORIA):
1) Parroquia local (avisos y horarios parroquiales vigentes).
2) Arquidiócesis de Monterrey y Pastoral Litúrgica MTY.
3) CEM.
4) Fuentes formativas oficiales complementarias.
Si hay conflicto, use la más reciente dentro de la jerarquía.

REGLAS:
1) Priorice "CONTEXTO DEL MANUAL". Si falta detalle y la pregunta es teológica/espiritual, responda con doctrina católica segura.
2) Si la consulta es OPERATIVA (faltantes, ubicación, flujo, turnos, responsables), NO responda genérico:
   - Dé acción inmediata.
   - Responsable primario.
   - Escalamiento.
3) Horarios/confesiones/eventos: si están en contexto, entréguelos completos con fecha/fuente.
4) Derive a WhatsApp SOLO para información interna privada.
5) Si hay fuero interno/confesión personal: use exactamente:
   "Este espacio es para orientación litúrgica y pastoral. Para el sacramento de la confesión o dirección espiritual, por favor acérquese presencialmente a la parroquia."
6) Si NO hay dato oficial confirmado, indique claramente que no está confirmado y remita a oficina parroquial.
7) Para preguntas de "confesiones", si no hay horario concreto en fuentes, NO improvise ni remita a páginas genéricas: indique contactar a Oficina Parroquial.
8) Estilo: español de México, cercano, sobrio, no robótico, sin plantillas repetitivas.

SALIDA OBLIGATORIA:
Responda SOLO JSON válido:
{
  "mode": "operativo|horarios|teologico|homilia|confesion_privada|confesiones|parroquial|derivar",
  "answer_short": "texto breve y útil",
  "steps": ["paso 1", "paso 2", "paso 3"],
  "owner": "Sacristía|Ujieres|MEC|Monaguillos|Lectores|Coro|Coordinación General|Oficina Parroquial",
  "escalation": "a quién escalar si no se resuelve",
  "needs_whatsapp": false,
  "whatsapp_reason": ""
}
No agregue texto fuera del JSON.
`.trim();
}

function buildUserPrompt({ query, manualContext, externalContext, intent, ownerHint, meta }) {
  const safeManual = String(manualContext || "").slice(0, MAX_CONTEXT_LEN);
  const safeExternal = String(externalContext || "").slice(0, MAX_CONTEXT_LEN);
  const day = meta?.day || "";
  const ministry = meta?.ministry || "";
  const primaryTarget = meta?.primaryTarget || "";

  return `
INTENCION_DETECTADA: ${intent}
RESPONSABLE_SUGERIDO: ${ownerHint}
META: day=${day || "NA"}, ministry=${ministry || "NA"}, primaryTarget=${primaryTarget || "NA"}

PREGUNTA_DEL_FIEL:
${query}

CONTEXTO_DEL_MANUAL:
${safeManual || "SIN DATOS"}

CONTEXTO_OFICIAL_EXTERNO:
${safeExternal || "SIN DATOS EXTERNOS"}
`.trim();
}

async function callModel(model, apiKey, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    errorMessage: data?.error?.message || `HTTP ${response.status}`,
  };
}

export default {
  async fetch(request, env, ctx) {
    try {
      if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname === "/health") {
        const snapshot = await loadOfficialContext(env);
        return jsonResponse({
          ok: true,
          snapshotUpdatedAt: snapshot?.updatedAt || null,
          indexedSources: snapshot?.docs?.length || 0,
          kvBound: Boolean(env.OFFICIAL_CONTEXT_KV && typeof env.OFFICIAL_CONTEXT_KV.get === "function"),
        });
      }

      if (request.method === "POST" && url.pathname === "/refresh-official-context") {
        const adminToken = String(env.ADMIN_TOKEN || "").trim();
        const reqToken = String(request.headers.get("X-Admin-Token") || "").trim();
        if (!adminToken || reqToken !== adminToken) {
          return jsonResponse({ reply: "No autorizado." }, 401);
        }
        const result = await refreshOfficialContext(env);
        return jsonResponse({ ok: true, result });
      }

      if (request.method !== "POST") {
        return jsonResponse({ reply: "Método no permitido." }, 405);
      }

      const rawBody = await request.text();
      if (!rawBody || !rawBody.trim()) return jsonResponse({ reply: "Sistema listo." });

      let input;
      try {
        input = JSON.parse(rawBody);
      } catch (_) {
        return jsonResponse({ reply: "Formato inválido de solicitud." }, 400);
      }

      const query = String(input?.query || "").trim();
      const manualContext = String(input?.context || "");
      const meta = typeof input?.meta === "object" && input.meta ? input.meta : {};
      if (!query) return jsonResponse({ reply: "Por favor escriba su consulta." }, 400);

      const apiKey = String(env.GEMINI_API_KEY || "").trim();
      if (!apiKey) return jsonResponse({ reply: "Falta configurar GEMINI_API_KEY en el Worker." }, 500);

      const waNumber = String(env.WHATSAPP_NUMBER || FALLBACK_WA_NUMBER).trim();
      const intent = detectIntent(query);
      const ownerHint = detectOwner(query);

      // Carga de contexto oficial externo. Si no hay snapshot, intenta refrescar en background.
      let snapshot = await loadOfficialContext(env);
      if (!snapshot?.docs?.length && env.OFFICIAL_CONTEXT_KV && ctx?.waitUntil) {
        ctx.waitUntil(refreshOfficialContext(env));
      }
      const externalContext = buildExternalContextBlock(query, intent, snapshot);
      const mergedContextForDetectors = `${manualContext}\n\n${externalContext}`;
      const confessionScheduleHint = extractConfessionScheduleFromContext(mergedContextForDetectors);

      // Guardarraíl fuerte: si el contexto oficial ya trae "Confesiones: todos los días",
      // respondemos eso directamente y evitamos ambigüedad del modelo.
      if (intent === "confesiones" && confessionScheduleHint) {
        const directReply =
          `${confessionScheduleHint}<br><br>` +
          `Para confirmar detalles específicos (lugar o ajustes extraordinarios), comuníquese a <strong>${PARISH_OFFICE_LABEL}</strong>: <strong>${PARISH_OFFICE_PHONE}</strong>.`;
        return jsonResponse({
          reply: directReply,
          meta: {
            model: "deterministic-confession-override",
            intent,
            ownerHint: "Oficina Parroquial",
            sourceSnapshotAt: snapshot?.updatedAt || null,
            externalSourcesUsed: Boolean(externalContext),
          },
        });
      }

      const systemInstruction = buildSystemInstruction();
      const userPrompt = buildUserPrompt({
        query,
        manualContext,
        externalContext,
        intent,
        ownerHint,
        meta,
      });

      const geminiPayload = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.25,
          topP: 0.9,
          responseMimeType: "application/json",
        },
      };

      const errors = [];

      for (const model of MODELS) {
        const result = await callModel(model, apiKey, geminiPayload);
        if (!result.ok) {
          errors.push(`[${model}: ${result.errorMessage}]`);
          continue;
        }

        const raw = extractCandidateText(result.data);
        const envelope = parseModelJson(raw);
        if (!envelope) {
          errors.push(`[${model}: salida no-JSON]`);
          continue;
        }

        let reply = composeReply(envelope, { intent, ownerHint, query, waNumber });

        // Guardarraíles de calidad:
        if (intent === "operativo" && looksGeneric(reply)) {
          reply = operationalFallback(ownerHint);
        }
        if (intent === "confesiones" && isWeakConfessionReply(reply)) {
          reply = `${officeFallback(query)}<br><br>Para confirmar horarios de confesiones, comuníquese directamente con ${PARISH_OFFICE_LABEL}.`;
        } else if (intent === "parroquial" && looksGeneric(reply)) {
          reply = officeFallback(query);
        }
        if (intent === "horarios" && (!hasConcreteScheduleInfo(reply) || looksGeneric(reply))) {
          reply = officeFallback(query);
        }

        return jsonResponse({
          reply,
          meta: {
            model,
            intent,
            ownerHint,
            sourceSnapshotAt: snapshot?.updatedAt || null,
            externalSourcesUsed: externalContext ? true : false,
          },
        });
      }

      const fallback =
        intent === "operativo"
          ? operationalFallback(ownerHint)
          : officeFallback(query);

      return jsonResponse({
        reply: fallback + buildWhatsAppCta(query, waNumber),
        meta: { intent, errors },
      });
    } catch (error) {
      return jsonResponse(
        {
          reply: `Error de ejecución: ${error.message}`,
          debug: {
            name: error?.name || "Error",
            message: error?.message || "unknown",
            stack: String(error?.stack || "").slice(0, 1200),
          },
        },
        500
      );
    }
  },

  async scheduled(controller, env, ctx) {
    if (!ctx?.waitUntil) return;
    ctx.waitUntil(refreshOfficialContext(env));
  },
};
