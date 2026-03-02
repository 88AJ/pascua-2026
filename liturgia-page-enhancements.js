(function () {
  const dayConfig = {
    inicio: {
      chip: "Camino Hacia la Pascua",
      note: "La línea visual y pastoral del portal orienta cada servicio al mismo fin: celebrar con dignidad y formar servidores con criterio común."
    },
    ramos: {
      chip: "Domingo de Ramos",
      note: "Se integra procesión y Pasión; sostener transición ordenada, evitar improvisaciones y respetar secuencia completa."
    },
    lunes: {
      chip: "Lunes Santo",
      note: "Jornada de austeridad: claridad de roles, sobriedad ritual y disciplina de tiempos."
    },
    martes: {
      chip: "Martes Santo",
      note: "Mantener ritmo sobrio y continuidad entre ministerios, sin movimientos innecesarios."
    },
    miercoles: {
      chip: "Miércoles Santo",
      note: "Día de especial coordinación pastoral por la recepción de óleos y la atención a enfermos."
    },
    jueves: {
      chip: "Jueves Santo",
      note: "Proteger la solemnidad de la Cena del Señor, lavatorio y traslado sin añadidos no previstos."
    },
    viernes: {
      chip: "Viernes Santo",
      note: "No hay Misa: toda acción se subordina al silencio, la adoración de la Cruz y la Comunión con la reserva."
    },
    sabado: {
      chip: "Sábado Santo",
      note: "Día de silencio y espera; preparación discreta para la Vigilia sin tono festivo anticipado."
    },
    vigilia: {
      chip: "Vigilia Pascual",
      note: "Celebración extensa y progresiva: fuego, pregón, Palabra, sacramentos y Eucaristía en secuencia íntegra."
    },
    pascua: {
      chip: "Domingo de Pascua",
      note: "Toda acción ministerial debe reflejar alegría pascual, orden celebrativo y servicio nítido a la asamblea."
    }
  };

  const defaultRoleText = {
    title: "Modo de celebración para el ministerio",
    before: "Llegar con antelación, revisar material y confirmar secuencia con coordinación.",
    during: "Cumplir la función asignada con reverencia, claridad y sin invadir funciones de otros equipos.",
    after: "Cerrar en orden, informar incidencias y preparar continuidad para la siguiente celebración."
  };

  const roleConfig = {
    mec: {
      title: "Modo de celebración para MEC",
      before: "Llegar con antelación, revisar copones, reserva y puntos de distribución con sacristía y coordinación general.",
      during: "Recibir envío del celebrante, distribuir únicamente con la fórmula litúrgica y cuidar reverencia, ritmo y protocolo de partículas.",
      after: "Entregar vasos según rúbrica, purificación correspondiente y reporte breve de incidencias pastorales."
    },
    monaguillos: {
      title: "Modo de celebración para Monaguillos",
      before: "Vestidura completa, credencia preparada y objetos litúrgicos verificados por secuencia real de la celebración.",
      during: "Servir con precisión, silencio y postura orante; asistir al celebrante en el orden propio sin adelantar ni omitir pasos.",
      after: "Retirar y guardar elementos con cuidado, apagar/incensario cuando aplique y dejar sacristía en orden."
    },
    lectores: {
      title: "Modo de celebración para Lectores",
      before: "Repasar pronunciación, pausas y ubicación de perícopas; confirmar micrófonos y orden de proclamaciones.",
      during: "Proclamar con dicción clara, tono orante y fidelidad textual; respetar silencios y aclamaciones propias del rito.",
      after: "Entregar observaciones breves de audición/proclamación y mantener disponibilidad para celebraciones siguientes."
    },
    coro: {
      title: "Modo de celebración para Coro",
      before: "Alinear repertorio al día litúrgico, entradas, tonos y salmista; evitar piezas ajenas al rito.",
      during: "Sostener oración cantada sin protagonismo escénico, cuidando volumen, tempo y respuesta de la asamblea.",
      after: "Cerrar en sobriedad, resguardar material y confirmar ajustes para la siguiente celebración."
    },
    ujieres: {
      title: "Modo de celebración para Ujieres",
      before: "Definir accesos, flujo de asamblea, zonas de apoyo a enfermos y rutas de procesión con cada ministerio.",
      during: "Custodiar orden, hospitalidad y seguridad sin interrumpir los ritos; coordinar filas y desplazamientos con discreción.",
      after: "Apoyar salida ordenada, recoger incidencias y comunicar pendientes operativos al coordinador."
    },
    sacristia: {
      title: "Modo de celebración para Sacristía",
      before: "Preparar vasos, libros, vestiduras y elementos del día según rúbrica y secuencia celebrativa.",
      during: "Sostener logística silenciosa del altar y credencia, anticipando necesidades reales de cada rito.",
      after: "Purificar, guardar y dejar inventario listo para la siguiente celebración, reportando faltantes o incidencias."
    }
  };

  const roleLabel = {
    mec: "MEC",
    monaguillos: "Monaguillos",
    lectores: "Lectores",
    coro: "Coro",
    ujieres: "Ujieres",
    sacristia: "Sacristía",
    dia: "Equipo de celebración",
    home: "Voluntariado parroquial"
  };

  const roleOwner = {
    mec: "Coordinación MEC",
    monaguillos: "Coordinación Monaguillos",
    lectores: "Coordinación Lectores",
    coro: "Coordinación Coro",
    ujieres: "Coordinación Ujieres",
    sacristia: "Coordinación Sacristía",
    dia: "Coordinación General",
    home: "Coordinación General"
  };

  const criticalByRole = {
    mec: "copones, estaciones de comunión, reserva eucarística",
    monaguillos: "credencia, secuencia de procesión, campanillas e incienso",
    lectores: "leccionario, micrófonos, orden de proclamación",
    coro: "repertorio del día, tonos y entradas",
    ujieres: "accesos, filas, misalitos y flujo de asamblea",
    sacristia: "vasos, libros, vestiduras y reposición de apoyo",
    dia: "horarios oficiales, flujo y enlaces entre equipos",
    home: "asignación de roles y puntualidad operativa"
  };

  const dayTokens = ["ramos", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "vigilia", "pascua"];

  function detectFromPath() {
    const file = (window.location.pathname.split("/").pop() || "").toLowerCase();
    const filename = file || "index.html";

    if (filename === "panel-coordinador.html") {
      return { role: "panel", day: "inicio", injectMode: false, injectTraining: false };
    }

    if (filename === "index.html") {
      return { role: "home", day: "inicio", injectMode: false, injectTraining: true };
    }

    if (/^(ramos|lunes|martes|miercoles|jueves|viernes|sabado|vigilia|pascua)\.html$/.test(filename)) {
      return { role: "dia", day: filename.replace(".html", ""), injectMode: false, injectTraining: true };
    }

    const parts = file.replace(".html", "").split("-");
    const role = parts[0] || "dia";
    const day = dayTokens.find((token) => filename.includes(token)) || "ramos";
    return { role, day, injectMode: true, injectTraining: true };
  }

  function createModeBlock(role, day) {
    const roleText = roleConfig[role] || defaultRoleText;
    const dayText = dayConfig[day] || dayConfig.ramos;

    const container = document.createElement("section");
    container.id = "modo-celebracion";
    container.className = "lit-mode";
    container.innerHTML = [
      '<h2 class="lit-mode-title">' + roleText.title + "</h2>",
      '<div class="lit-gradient-strip"></div>',
      '<div class="lit-day-chip">Clave del día: ' + dayText.chip + "</div>",
      '<p class="lit-mode-subtitle">Guía explicativa para que el servicio sea normativo y práctico: qué preparar, cómo actuar durante el rito y cómo cerrar sin conflicto operativo.</p>',
      '<div class="lit-mode-grid">',
      '  <article class="lit-mode-card">',
      "    <h4>Antes de la celebración</h4>",
      "    <p>" + roleText.before + "</p>",
      "  </article>",
      '  <article class="lit-mode-card">',
      "    <h4>Durante la celebración</h4>",
      "    <p>" + roleText.during + "</p>",
      "  </article>",
      '  <article class="lit-mode-card">',
      "    <h4>Después de la celebración</h4>",
      "    <p>" + roleText.after + "</p>",
      "  </article>",
      "</div>",
      '<p class="lit-mode-note"><strong>Nota litúrgica:</strong> ' + dayText.note + "</p>"
    ].join("");

    return container;
  }

  function asList(items) {
    return '<ul class="list-disc pl-5 space-y-2 text-sm text-gray-800">' + items.map((it) => "<li>" + it + "</li>").join("") + "</ul>";
  }

  function buildTrainingBlueprint(role, day) {
    const roleText = roleConfig[role] || defaultRoleText;
    const roleName = roleLabel[role] || "Ministerio";
    const dayText = dayConfig[day] || dayConfig.ramos;
    const owner = roleOwner[role] || "Coordinación del ministerio";
    const critical = criticalByRole[role] || criticalByRole.dia;

    const route = {
      new: [
        "Leer la guía de " + dayText.chip + " y ubicar su servicio en la secuencia litúrgica.",
        "Completar inducción breve con " + owner + " antes de su primera celebración.",
        "Ensayar recorrido básico de su ministerio sin interrumpir otros ritos."
      ],
      active: [
        roleText.before,
        roleText.during,
        "Aplicar checklist completo y reportar incidencias al cierre."
      ],
      lead: [
        roleText.after,
        "Coordinar briefing de 5 minutos previo: roles, riesgos y canales de escalamiento.",
        "Acompañar al menos a un servidor nuevo para asegurar transferencia práctica."
      ]
    };

    const checklist = {
      before: [
        "Llegar con 30 minutos de anticipación y confirmar horario/sede oficial.",
        "Verificar puntos críticos: " + critical + ".",
        "Confirmar con coordinación qué ministerio cubre cada tramo del rito."
      ],
      during: [
        "Respetar secuencia litúrgica sin duplicar funciones de otros equipos.",
        "Si falta material o apoyo, activar canal directo con Sacristía/Coordinación.",
        "Mantener comunicación breve y discreta para no romper el clima celebrativo."
      ],
      after: [
        "Cerrar servicio con inventario mínimo y devolución ordenada de material.",
        "Registrar incidencias reales (no suposiciones) para mejora del siguiente turno.",
        "Escalar pendientes no resueltos antes de retirarse del templo."
      ]
    };

    const escalation = [
      {
        incident: "Falta de material en puertas/puntos de servicio (misalitos, agua bendita, etc.)",
        primary: "Sacristía",
        secondary: "Coordinación General",
        timing: "Inmediato (2-3 min)"
      },
      {
        incident: "Saturación de filas, accesos o circulación de asamblea",
        primary: "Ujieres",
        secondary: "Coordinación General",
        timing: "Inmediato"
      },
      {
        incident: "Ausencia, relevo o conflicto de turno ministerial",
        primary: owner,
        secondary: "Coordinación General",
        timing: "Antes del siguiente rito"
      },
      {
        incident: "Incidente de salud o seguridad",
        primary: "Ujieres + Coordinación General",
        secondary: "Servicios de emergencia",
        timing: "Prioridad absoluta"
      }
    ];

    return { roleName, dayText, route, checklist, escalation };
  }

  function createTrainingBlock(role, day) {
    const bp = buildTrainingBlueprint(role, day);
    const container = document.createElement("section");
    container.id = "ruta-entrenamiento";
    container.className = "lit-training bg-white p-8 md:p-10 rounded-3xl shadow-xl border-t-4 border-gray-700 mt-12";

    container.innerHTML = [
      '<h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-tight text-center">Ruta De Formación Ministerial</h2>',
      '<p class="text-center text-gray-600 mt-3">Bloque de entrenamiento práctico para voluntarios: nivel inicial, servicio activo y coordinación.</p>',
      '<p class="text-center text-gray-600 mb-8">Ministerio: <strong>' + bp.roleName + "</strong> | Día: <strong>" + bp.dayText.chip + "</strong></p>",

      '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">',
      '  <article class="bg-gray-50 rounded-xl p-5 border border-gray-200">',
      '    <h3 class="text-sm font-bold text-gray-900 uppercase mb-3">Nivel 1: Ingreso</h3>',
      asList(bp.route.new),
      "  </article>",
      '  <article class="bg-gray-50 rounded-xl p-5 border border-gray-200">',
      '    <h3 class="text-sm font-bold text-gray-900 uppercase mb-3">Nivel 2: Servicio Activo</h3>',
      asList(bp.route.active),
      "  </article>",
      '  <article class="bg-gray-50 rounded-xl p-5 border border-gray-200">',
      '    <h3 class="text-sm font-bold text-gray-900 uppercase mb-3">Nivel 3: Coordinación</h3>',
      asList(bp.route.lead),
      "  </article>",
      "</div>",

      '<h3 class="text-xl font-bold text-gray-900 uppercase tracking-tight mt-10 mb-4 text-center">Checklist Operativo</h3>',
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">',
      '  <article class="bg-green-50 rounded-xl p-5 border border-green-200">',
      '    <h4 class="text-sm font-bold text-green-900 uppercase mb-3">Antes</h4>',
      asList(bp.checklist.before),
      "  </article>",
      '  <article class="bg-amber-50 rounded-xl p-5 border border-amber-200">',
      '    <h4 class="text-sm font-bold text-amber-900 uppercase mb-3">Durante</h4>',
      asList(bp.checklist.during),
      "  </article>",
      '  <article class="bg-red-50 rounded-xl p-5 border border-red-200">',
      '    <h4 class="text-sm font-bold text-red-900 uppercase mb-3">Después</h4>',
      asList(bp.checklist.after),
      "  </article>",
      "</div>",

      '<h3 class="text-xl font-bold text-gray-900 uppercase tracking-tight mt-10 mb-4 text-center">Matriz De Escalamiento</h3>',
      '<div class="overflow-auto border rounded-lg">',
      '  <table class="min-w-full text-sm">',
      '    <thead class="bg-gray-100 text-gray-700 uppercase text-xs tracking-wide">',
      "      <tr>",
      '        <th class="text-left px-3 py-2">Incidente</th>',
      '        <th class="text-left px-3 py-2">Responsable Primario</th>',
      '        <th class="text-left px-3 py-2">Escalamiento</th>',
      '        <th class="text-left px-3 py-2">Tiempo Objetivo</th>',
      "      </tr>",
      "    </thead>",
      '    <tbody class="divide-y">',
      bp.escalation.map((row) => [
        "<tr>",
        '<td class="px-3 py-2 text-gray-900">' + row.incident + "</td>",
        '<td class="px-3 py-2 text-gray-800 font-semibold">' + row.primary + "</td>",
        '<td class="px-3 py-2 text-gray-800">' + row.secondary + "</td>",
        '<td class="px-3 py-2 text-gray-700">' + row.timing + "</td>",
        "</tr>"
      ].join("")).join(""),
      "    </tbody>",
      "  </table>",
      "</div>",
      '<p class="mt-6 text-sm text-gray-600 text-center"><strong>Clave de formación:</strong> este manual no solo informa; entrena decisiones en tiempo real para evitar improvisación litúrgica.</p>'
    ].join("");

    return container;
  }

  function styleSharedBlocks() {
    const selectors = ["#coordinacion-interministerial", "#matriz-normativa", "#registro", "#ruta-entrenamiento"];
    selectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) el.classList.add("lit-panel");
    });
  }

  function injectMode(role, day) {
    if (document.getElementById("modo-celebracion")) return;

    const coordination = document.getElementById("coordinacion-interministerial");
    if (!coordination || !coordination.parentNode) return;

    const mode = createModeBlock(role, day);
    coordination.parentNode.insertBefore(mode, coordination);
  }

  function findInsertionAnchor() {
    const priority = [
      document.getElementById("coordinacion-interministerial"),
      document.getElementById("matriz-normativa"),
      document.getElementById("registro")
    ].find(Boolean);
    if (priority && priority.parentNode) return { type: "before", node: priority };

    const mode = document.getElementById("modo-celebracion");
    if (mode && mode.parentNode) return { type: "after", node: mode };

    const firstSection = document.querySelector("main section, body > section, section");
    if (firstSection && firstSection.parentNode) return { type: "after", node: firstSection };

    const main = document.querySelector("main");
    if (main) return { type: "append", node: main };

    return null;
  }

  function injectTraining(role, day) {
    if (document.getElementById("ruta-entrenamiento")) return;

    const anchor = findInsertionAnchor();
    if (!anchor) return;

    const training = createTrainingBlock(role, day);
    if (anchor.type === "before") {
      anchor.node.parentNode.insertBefore(training, anchor.node);
    } else if (anchor.type === "after") {
      anchor.node.insertAdjacentElement("afterend", training);
    } else {
      anchor.node.appendChild(training);
    }
  }

  function init() {
    const detected = detectFromPath();

    document.body.classList.add("liturgia-pro");
    document.body.classList.add("dia-" + detected.day);
    document.body.classList.add("rol-" + detected.role);

    if (detected.injectMode !== false) injectMode(detected.role, detected.day);
    if (detected.injectTraining !== false) injectTraining(detected.role, detected.day);
    styleSharedBlocks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
