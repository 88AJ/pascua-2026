(function () {
  const dayConfig = {
    inicio: {
      css: "inicio",
      chip: "Camino Hacia la Pascua",
      note: "La línea visual de todo el sitio parte de la sobriedad litúrgica y orienta cada página al mismo lenguaje pastoral."
    },
    ramos: {
      css: "ramos",
      chip: "Domingo de Ramos",
      note: "Se integra la procesión inicial con el tono penitencial de la Pasión; mantener transición ordenada entre ambos momentos."
    },
    lunes: {
      css: "lunes",
      chip: "Lunes Santo",
      note: "Jornada de austeridad: priorizar claridad de roles, tiempos sobrios y lenguaje breve en cada intervención."
    },
    martes: {
      css: "martes",
      chip: "Martes Santo",
      note: "Mantener ritmo sobrio y coordinación estable; evitar transiciones improvisadas en los ritos."
    },
    miercoles: {
      css: "miercoles",
      chip: "Miércoles Santo",
      note: "Conservar sentido penitencial y asistencia pastoral en los ritos propios del día."
    },
    jueves: {
      css: "jueves",
      chip: "Jueves Santo",
      note: "Resguardar la solemnidad de la Cena del Señor, el lavatorio y el traslado al Altar de Reposo sin prisas ni añadidos."
    },
    viernes: {
      css: "viernes",
      chip: "Viernes Santo",
      note: "No hay Misa: toda intervención se subordina al silencio, la veneración de la Cruz y la Comunión con la reserva eucarística."
    },
    sabado: {
      css: "sabado",
      chip: "Sábado Santo",
      note: "Día de silencio y espera confiada junto al sepulcro; la Iglesia permanece en oración sobria antes de la Noche Santa."
    },
    vigilia: {
      css: "vigilia",
      chip: "Vigilia Pascual",
      note: "Celebración extensa y progresiva: fuego nuevo, pregón, Palabra, sacramentos y Eucaristía con secuencia íntegra."
    },
    pascua: {
      css: "pascua",
      chip: "Domingo de Pascua",
      note: "Toda acción ministerial debe reflejar alegría pascual, claridad ritual y servicio ordenado para la asamblea."
    }
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

  const dayTokens = ["ramos", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "vigilia", "pascua"];

  function detectFromPath() {
    const file = (window.location.pathname.split("/").pop() || "").toLowerCase();
    const filename = file || "index.html";

    if (filename === "panel-coordinador.html") {
      return { role: "panel", day: "inicio", injectMode: false };
    }

    if (filename === "index.html") {
      return { role: "home", day: "inicio", injectMode: false };
    }

    if (/^(ramos|lunes|martes|miercoles|jueves|viernes|sabado|vigilia|pascua)\.html$/.test(filename)) {
      return { role: "dia", day: filename.replace(".html", ""), injectMode: false };
    }

    const parts = file.replace(".html", "").split("-");
    const role = parts[0] || "ministerio";
    const day = dayTokens.find((token) => filename.includes(token)) || "ramos";
    return { role, day, injectMode: true };
  }

  function createModeBlock(role, day) {
    const roleText = roleConfig[role] || {
      title: "Modo de celebración para el ministerio",
      before: "Llegar con antelación, revisar su material y confirmar secuencia con coordinación general.",
      during: "Cumplir la función asignada con reverencia, claridad y sin invadir funciones de otros equipos.",
      after: "Cerrar en orden, informar incidencias y preparar continuidad para la siguiente celebración."
    };

    const dayText = dayConfig[day] || dayConfig.ramos;

    const container = document.createElement("section");
    container.id = "modo-celebracion";
    container.className = "lit-mode";

    container.innerHTML = [
      '<h2 class="lit-mode-title">' + roleText.title + '</h2>',
      '<div class="lit-gradient-strip"></div>',
      '<div class="lit-day-chip">Clave del día: ' + dayText.chip + '</div>',
      '<p class="lit-mode-subtitle">Guía explicativa para que el servicio sea normativo y práctico: qué preparar, cómo actuar durante el rito y cómo cerrar sin conflicto operativo.</p>',
      '<div class="lit-mode-grid">',
      '  <article class="lit-mode-card">',
      '    <h4>Antes de la celebración</h4>',
      '    <p>' + roleText.before + '</p>',
      '  </article>',
      '  <article class="lit-mode-card">',
      '    <h4>Durante la celebración</h4>',
      '    <p>' + roleText.during + '</p>',
      '  </article>',
      '  <article class="lit-mode-card">',
      '    <h4>Después de la celebración</h4>',
      '    <p>' + roleText.after + '</p>',
      '  </article>',
      '</div>',
      '<p class="lit-mode-note"><strong>Nota litúrgica:</strong> ' + dayText.note + '</p>'
    ].join("");

    return container;
  }

  function styleSharedBlocks() {
    const selectors = ["#coordinacion-interministerial", "#matriz-normativa", "#registro"];
    selectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) {
        el.classList.add("lit-panel");
      }
    });
  }

  function injectMode(role, day) {
    if (document.getElementById("modo-celebracion")) {
      return;
    }

    const coordination = document.getElementById("coordinacion-interministerial");
    if (!coordination || !coordination.parentNode) {
      return;
    }

    const mode = createModeBlock(role, day);
    coordination.parentNode.insertBefore(mode, coordination);
  }

  function init() {
    const detected = detectFromPath();

    document.body.classList.add("liturgia-pro");
    document.body.classList.add("dia-" + detected.day);
    document.body.classList.add("rol-" + detected.role);

    styleSharedBlocks();
    if (detected.injectMode !== false) {
      injectMode(detected.role, detected.day);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
