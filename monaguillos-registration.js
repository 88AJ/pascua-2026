/* Shared Monaguillos registration logic backed by Supabase */
(function () {
  function normalizePhone(input) {
    return (input || "").replace(/\D/g, "").slice(0, 15);
  }

  function initMonaguillosRegistration(config) {
    const {
      supabaseUrl,
      supabaseKey,
      ministryKey,
      slots,
      tableRegistrations = "mec_registrations",
    } = config || {};

    const slotSelect = document.getElementById("slot");
    const cuposGrid = document.getElementById("cupos-grid");
    const form = document.getElementById("monaguillos-registro-form");
    const submitBtn = document.getElementById("submit-btn");
    const statusBox = document.getElementById("registro-status");

    if (!slotSelect || !cuposGrid || !form || !submitBtn || !statusBox) return;

    function showStatus(message, kind) {
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
      statusBox.textContent = message;
    }

    function renderSlots(counts) {
      cuposGrid.innerHTML = "";
      slotSelect.innerHTML = '<option value="">Selecciona una opción</option>';

      slots.forEach((slot) => {
        const used = counts[slot.id] || 0;
        const remaining = Math.max(slot.capacity - used, 0);
        const full = remaining === 0;

        const card = document.createElement("div");
        card.className = `border rounded-lg p-3 ${
          full ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
        }`;
        card.innerHTML = `
          <p class="font-semibold text-gray-900">${slot.label}</p>
          <p class="text-xs mt-1 ${full ? "text-red-700" : "text-gray-600"}">
            ${full ? "Cupo lleno" : `Disponibles: ${remaining} / ${slot.capacity}`}
          </p>
        `;
        cuposGrid.appendChild(card);

        const option = document.createElement("option");
        option.value = slot.id;
        option.textContent = `${slot.label} ${
          full ? "(Cupo lleno)" : `(${remaining} disponibles)`
        }`;
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
          const slotId = slotSelect.value;
          const notas = (document.getElementById("notas").value || "").trim();

          if (!nombre || !telefono || !slotId) {
            showStatus("Completa nombre, teléfono y celebración.", "error");
            submitBtn.disabled = false;
            return;
          }

          const slot = slots.find((s) => s.id === slotId);
          const used = counts[slotId] || 0;
          if (!slot || used >= slot.capacity) {
            showStatus("Ese horario ya no tiene cupo disponible.", "error");
            counts = await loadCounts(client);
            renderSlots(counts);
            submitBtn.disabled = false;
            return;
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
            if (String(error.message || "").toLowerCase().includes("duplicate")) {
              showStatus("Este teléfono ya está registrado en ese horario.", "error");
            } else {
              showStatus("No fue posible registrar. Intenta de nuevo.", "error");
            }
            submitBtn.disabled = false;
            return;
          }

          showStatus("Registro confirmado correctamente.", "ok");
          form.reset();
          counts = await loadCounts(client);
          renderSlots(counts);
        } catch (err) {
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

  window.initMonaguillosRegistration = initMonaguillosRegistration;
})();
