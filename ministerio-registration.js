/* Shared registration logic for Coro, Lectores, Sacristia y Ujieres */
(function () {
  const PARISH_WA_NUMBER = "5218262620211";
  const GROUP_LABEL_BY_BASE = {
    mec: "MEC - Semana Santa 2026",
    monaguillos: "Monaguillos - Semana Santa 2026",
    lectores: "Lectores - Semana Santa 2026",
    coro: "Coro - Semana Santa 2026",
    ujieres: "Ujieres - Semana Santa 2026",
    sacristia: "Sacristía - Semana Santa 2026",
    voluntario: "Voluntariado General - Semana Santa 2026",
  };

  function normalizePhone(input) {
    return (input || "").replace(/\D/g, "").slice(0, 15);
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ministryBase(ministryKey) {
    return String(ministryKey || "").split("-")[0] || "voluntario";
  }

  function buildGroupJoinLink(ministryKey) {
    const base = ministryBase(ministryKey);
    const label = GROUP_LABEL_BY_BASE[base] || "Voluntariado - Semana Santa 2026";
    const msg = `Hola, ya me registré y quiero unirme al grupo "${label}". Mi nombre es: `;
    return `https://wa.me/${PARISH_WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  function initMinisterioRegistration(config) {
    const {
      supabaseUrl,
      supabaseKey,
      ministryKey,
      slots,
      tableRegistrations = "mec_registrations",
      allowMultiSlot = true,
    } = config || {};

    const slotSelect = document.getElementById("slot");
    const cuposGrid = document.getElementById("cupos-grid");
    const form = document.getElementById("ministerio-registro-form");
    const submitBtn = document.getElementById("submit-btn");
    const statusBox = document.getElementById("registro-status");

    if (!slotSelect || !cuposGrid || !form || !submitBtn || !statusBox) return;

    function showStatus(message, kind, asHtml) {
      statusBox.classList.remove(
        "hidden",
        "bg-red-100",
        "text-red-900",
        "bg-green-100",
        "text-green-900",
        "bg-yellow-100",
        "text-yellow-900"
      );
      if (kind === "ok") statusBox.classList.add("bg-green-100", "text-green-900");
      else if (kind === "warn") statusBox.classList.add("bg-yellow-100", "text-yellow-900");
      else statusBox.classList.add("bg-red-100", "text-red-900");
      if (asHtml) statusBox.innerHTML = message;
      else statusBox.textContent = message;
    }

    function setupSlotSelectMode() {
      if (!allowMultiSlot) return;
      slotSelect.multiple = true;
      slotSelect.size = Math.min(Math.max((slots || []).length, 4), 9);
      slotSelect.classList.add("min-h-[9rem]");

      const container = slotSelect.parentElement;
      if (!container || document.getElementById("multi-slot-help")) return;
      const help = document.createElement("p");
      help.id = "multi-slot-help";
      help.className = "mt-1 text-xs text-gray-500";
      help.textContent = "Puedes seleccionar más de una celebración.";
      container.appendChild(help);
    }

    function renderSlots(counts) {
      cuposGrid.innerHTML = "";
      slotSelect.innerHTML = allowMultiSlot
        ? ""
        : '<option value="">Selecciona una opción</option>';

      slots.forEach((slot) => {
        const used = counts[slot.id] || 0;
        const remaining = Math.max(slot.capacity - used, 0);
        const full = remaining === 0;

        const card = document.createElement("div");
        card.className = `border rounded-lg p-3 ${
          full ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
        }`;
        card.innerHTML = `
          <p class="font-semibold text-gray-900">${escapeHtml(slot.label)}</p>
          <p class="text-xs mt-1 ${full ? "text-red-700" : "text-gray-600"}">
            ${full ? "Cupo lleno" : `Disponibles: ${remaining} / ${slot.capacity}`}
          </p>
        `;
        cuposGrid.appendChild(card);

        const option = document.createElement("option");
        option.value = slot.id;
        option.textContent = `${slot.label} ${full ? "(Cupo lleno)" : `(${remaining} disponibles)`}`;
        option.disabled = full;
        slotSelect.appendChild(option);
      });
    }

    async function loadCounts(client) {
      const ids = slots.map((s) => s.id);
      const counts = {};
      ids.forEach((id) => {
        counts[id] = 0;
      });

      const { data, error } = await client
        .from(tableRegistrations)
        .select("slot_id")
        .in("slot_id", ids);

      if (error) throw error;
      (data || []).forEach((row) => {
        counts[row.slot_id] = (counts[row.slot_id] || 0) + 1;
      });
      return counts;
    }

    async function bootstrap() {
      setupSlotSelectMode();

      if (!supabaseUrl || !supabaseKey) {
        renderSlots({});
        submitBtn.disabled = true;
        showStatus(
          "Configuración pendiente: define URL y publishable key de Supabase para activar el registro.",
          "warn"
        );
        return;
      }

      const client = window.supabase.createClient(supabaseUrl, supabaseKey);
      let counts = await loadCounts(client);
      renderSlots(counts);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;

        try {
          const nombre = (document.getElementById("nombre").value || "").trim();
          const telefono = normalizePhone(document.getElementById("telefono").value);
          const notas = (document.getElementById("notas").value || "").trim();
          const selectedSlotIds = Array.from(slotSelect.selectedOptions || [])
            .map((opt) => opt.value)
            .filter(Boolean);

          if (!nombre || !telefono || !selectedSlotIds.length) {
            showStatus("Completa nombre, teléfono y al menos una celebración.", "error");
            submitBtn.disabled = false;
            return;
          }

          const slotIds = [...new Set(selectedSlotIds)];
          let inserted = 0;
          let duplicates = 0;
          let full = 0;
          let failed = 0;

          for (const slotId of slotIds) {
            const slot = slots.find((s) => s.id === slotId);
            const used = counts[slotId] || 0;

            if (!slot || used >= slot.capacity) {
              full += 1;
              continue;
            }

            const { error } = await client.from(tableRegistrations).insert([
              {
                ministry_key: ministryKey,
                slot_id: slotId,
                full_name: nombre,
                phone: telefono,
                notes: notas,
              },
            ]);

            if (error) {
              if (String(error.message || "").toLowerCase().includes("duplicate")) duplicates += 1;
              else failed += 1;
              continue;
            }

            counts[slotId] = (counts[slotId] || 0) + 1;
            inserted += 1;
          }

          renderSlots(counts);

          if (!inserted) {
            if (duplicates) showStatus("Tu teléfono ya está registrado en las celebraciones seleccionadas.", "warn");
            else if (full) showStatus("Las celebraciones seleccionadas ya no tienen cupo.", "warn");
            else showStatus("No fue posible registrar. Intenta de nuevo.", "error");
            return;
          }

          const groupLink = buildGroupJoinLink(ministryKey);
          const extras = [];
          if (duplicates) extras.push(`${duplicates} ya estaban registrados`);
          if (full) extras.push(`${full} sin cupo`);
          if (failed) extras.push(`${failed} con error de registro`);
          const extraText = extras.length ? `<br><span class="text-xs">Nota: ${extras.join(" · ")}.</span>` : "";

          showStatus(
            `Gracias por registrarte. Confirmamos <strong>${inserted}</strong> celebración(es).${extraText}<br><a class="underline font-bold" href="${groupLink}" target="_blank" rel="noopener noreferrer">Unirme al grupo de WhatsApp</a>`,
            "ok",
            true
          );

          if (document.getElementById("notas")) document.getElementById("notas").value = "";
          Array.from(slotSelect.options || []).forEach((opt) => { opt.selected = false; });
        } catch (_) {
          showStatus("Error de conexión con el sistema de registro.", "error");
        } finally {
          submitBtn.disabled = false;
        }
      });
    }

    bootstrap().catch(() => {
      showStatus("No se pudo inicializar el registro.", "error");
    });
  }

  window.initMinisterioRegistration = initMinisterioRegistration;
})();
