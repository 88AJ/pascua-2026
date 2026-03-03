# Campaña Visual Semana Santa 2026 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar una experiencia visual cinematográfica y coherente en 5 piezas web (3 mantas + landing público + portal de oficina), con cover animado global de 2.0s y alta legibilidad para difusión parroquial.

**Architecture:** Centralizar identidad visual en un tema compartido (tokens CSS + motion CSS) y reutilizar un módulo JS único para el cover animado con fallback de accesibilidad (`prefers-reduced-motion`). Mantener contenido específico por página, pero con la misma estructura de jerarquía visual, CTA y componentes de entrada.

**Tech Stack:** HTML5, CSS3 (custom properties, keyframes), JavaScript vanilla, assets locales existentes (`logo.PNG`, imágenes de campaña), Git.

---

### Task 1: Crear base compartida de campaña (tema + motion + cover controller)

**Files:**
- Create: `assets/css/campaign-2026-theme.css`
- Create: `assets/css/campaign-2026-motion.css`
- Create: `assets/js/campaign-cover.js`
- Test: `scripts/verify-campaign-pages.sh`

**Step 1: Write the failing test**

```bash
#!/usr/bin/env bash
set -euo pipefail
for f in \
  landing-publico-semana-santa-2026.html \
  portal-marketing-parroquial-2026.html \
  manta-semana-santa-2026.html \
  manta-cambio-horario-vespertinas-2026.html \
  manta-ejercicios-espirituales-2026.html; do
  rg -q "campaign-2026-theme.css" "$f"
  rg -q "campaign-2026-motion.css" "$f"
  rg -q "campaign-cover.js" "$f"
done
```

**Step 2: Run test to verify it fails**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: FAIL because shared files are not yet referenced.

**Step 3: Write minimal implementation**

```css
/* assets/css/campaign-2026-theme.css */
:root {
  --campaign-bg: #0e0f12;
  --campaign-night: #1e2a44;
  --campaign-gold: #c8a86b;
  --campaign-ivory: #f7f2e8;
  --campaign-wine: #7c2a2a;
}
```

```js
// assets/js/campaign-cover.js
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const overlay = document.querySelector("[data-campaign-cover]");
  if (!overlay || reduced) return;
  const skipBtn = overlay.querySelector("[data-cover-skip]");
  const end = () => overlay.classList.add("is-hidden");
  const t = window.setTimeout(end, 2000);
  skipBtn?.addEventListener("click", () => { clearTimeout(t); end(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") { clearTimeout(t); end(); }});
})();
```

**Step 4: Run test to verify it still fails for page references (expected)**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: FAIL only on missing references inside pages.

**Step 5: Commit**

```bash
git add assets/css/campaign-2026-theme.css assets/css/campaign-2026-motion.css assets/js/campaign-cover.js scripts/verify-campaign-pages.sh
git commit -m "feat: add shared 2026 campaign visual and motion foundations"
```

---

### Task 2: Integrar cover animado global en las 5 páginas

**Files:**
- Modify: `landing-publico-semana-santa-2026.html`
- Modify: `portal-marketing-parroquial-2026.html`
- Modify: `manta-semana-santa-2026.html`
- Modify: `manta-cambio-horario-vespertinas-2026.html`
- Modify: `manta-ejercicios-espirituales-2026.html`
- Test: `scripts/verify-campaign-pages.sh`

**Step 1: Write the failing test**

```bash
for f in landing-publico-semana-santa-2026.html portal-marketing-parroquial-2026.html \
  manta-semana-santa-2026.html manta-cambio-horario-vespertinas-2026.html \
  manta-ejercicios-espirituales-2026.html; do
  rg -q "data-campaign-cover" "$f"
  rg -q "data-cover-skip" "$f"
done
```

**Step 2: Run test to verify it fails**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: FAIL for missing cover markup and/or references.

**Step 3: Write minimal implementation**

```html
<div class="campaign-cover" data-campaign-cover>
  <img src="logo.PNG" alt="Parroquia San Pedro Apóstol">
  <button type="button" data-cover-skip>Saltar animación</button>
</div>
<link rel="stylesheet" href="assets/css/campaign-2026-theme.css">
<link rel="stylesheet" href="assets/css/campaign-2026-motion.css">
<script src="assets/js/campaign-cover.js" defer></script>
```

**Step 4: Run test to verify it passes**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: PASS for shared references + cover presence.

**Step 5: Commit**

```bash
git add landing-publico-semana-santa-2026.html portal-marketing-parroquial-2026.html manta-semana-santa-2026.html manta-cambio-horario-vespertinas-2026.html manta-ejercicios-espirituales-2026.html
git commit -m "feat: add 2s cinematic cover with skip control across campaign pages"
```

---

### Task 3: Rediseñar `manta-semana-santa-2026.html` con layout editorial y QR

**Files:**
- Modify: `manta-semana-santa-2026.html`
- Test: `scripts/verify-campaign-pages.sh`

**Step 1: Write the failing test**

```bash
rg -q "qrserver.com" manta-semana-santa-2026.html
rg -q "7:00 PM" manta-semana-santa-2026.html
rg -q "Domingo de Resurrección" manta-semana-santa-2026.html
```

**Step 2: Run test to verify it fails (or partial fail)**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: FAIL until final structure and required content are consistent.

**Step 3: Write minimal implementation**

```css
.poster-grid { display:grid; grid-template-columns: 1.2fr 1fr; }
.hero-image { background-position: 92% 45%; }
.schedule-panel { background: rgba(6,6,6,.68); border: 1px solid rgba(200,168,107,.45); }
```

```html
<section class="qr-access">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=https://88aj.github.io/pascua-2026/landing-publico-semana-santa-2026.html" alt="QR landing">
  <p>Escanea para horarios, recursos y registro de voluntariado.</p>
</section>
```

**Step 4: Run test to verify it passes**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: PASS for this page with horarios + QR + framing.

**Step 5: Commit**

```bash
git add manta-semana-santa-2026.html
git commit -m "feat: refresh Semana Santa banner with cinematic editorial layout and QR CTA"
```

---

### Task 4: Rediseñar `manta-cambio-horario-vespertinas-2026.html` con foco de cúpulas y mensaje único

**Files:**
- Modify: `manta-cambio-horario-vespertinas-2026.html`
- Test: `scripts/verify-campaign-pages.sh`

**Step 1: Write the failing test**

```bash
rg -q "A partir del Domingo de Pascua" manta-cambio-horario-vespertinas-2026.html
rg -q "7:00 PM" manta-cambio-horario-vespertinas-2026.html
rg -q "cambiodehorario2026" manta-cambio-horario-vespertinas-2026.html
```

**Step 2: Run test to verify it fails**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: FAIL until exact copy/image focal settings are correct.

**Step 3: Write minimal implementation**

```css
.hero-cupulas { background-position: center 78%; background-size: cover; }
.headline { font-size: clamp(2rem, 4.2vw, 4rem); }
.time-chip { background: var(--campaign-wine); color: var(--campaign-ivory); }
```

**Step 4: Run test to verify it passes**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: PASS with exact hour and messaging.

**Step 5: Commit**

```bash
git add manta-cambio-horario-vespertinas-2026.html
git commit -m "feat: redesign vespertine schedule-change banner with dome-focused composition"
```

---

### Task 5: Rediseñar `manta-ejercicios-espirituales-2026.html` con layout de referencia y sacerdotes

**Files:**
- Modify: `manta-ejercicios-espirituales-2026.html`
- Test: `scripts/verify-campaign-pages.sh`

**Step 1: Write the failing test**

```bash
rg -q "16 al 20 de marzo de 2026" manta-ejercicios-espirituales-2026.html
rg -q "Después de misa de 6:00 PM" manta-ejercicios-espirituales-2026.html
rg -q "Pbro. Arturo Bernardo Flores Aguirre" manta-ejercicios-espirituales-2026.html
rg -q "Pbro. Alan Lorenzo Sánchez Valencia" manta-ejercicios-espirituales-2026.html
```

**Step 2: Run test to verify it fails**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: FAIL until content and hierarchy are exact.

**Step 3: Write minimal implementation**

```css
.ejercicios-layout { display:grid; grid-template-columns: .95fr 1.05fr; }
.cristo-side { filter: grayscale(.9) contrast(1.05); }
.priests-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
```

```html
<p><strong>Fecha:</strong> 16 al 20 de marzo de 2026</p>
<p><strong>Horario:</strong> Después de misa de 6:00 PM</p>
<p><strong>Impartidos por sacerdotes:</strong> Pbro. Arturo Bernardo Flores Aguirre y Pbro. Alan Lorenzo Sánchez Valencia</p>
```

**Step 4: Run test to verify it passes**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: PASS with exact schedule and presenters.

**Step 5: Commit**

```bash
git add manta-ejercicios-espirituales-2026.html
git commit -m "feat: redesign spiritual exercises banner with reference-based editorial composition"
```

---

### Task 6: Actualizar `landing-publico-semana-santa-2026.html` (orden, interacción y chatbot contextual)

**Files:**
- Modify: `landing-publico-semana-santa-2026.html`
- Modify: `padre-alan-chat.js`
- Test: `scripts/verify-campaign-pages.sh`

**Step 1: Write the failing test**

```bash
rg -q "Video de introducción" landing-publico-semana-santa-2026.html
rg -q "Vida Parroquial en Imágenes" landing-publico-semana-santa-2026.html
rg -q "panel-coordinador.html" landing-publico-semana-santa-2026.html
rg -q "padre-alan-chat.js" landing-publico-semana-santa-2026.html
```

**Step 2: Run test to verify it fails**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: FAIL until ordering and context hooks are fixed.

**Step 3: Write minimal implementation**

```html
<!-- Mover video arriba de galería -->
<section id="video-intro">...</section>
<section id="vida-parroquial">...</section>

<!-- CTA de registro -->
<a href="https://88aj.github.io/pascua-2026/panel-coordinador.html">Registrarme como voluntario</a>
```

```js
// En padre-alan-chat.js asegurar contexto para landing
if (filename === "landing-publico-semana-santa-2026.html") {
  pageContext = "Horarios oficiales de Semana Santa 2026 y capillas disponibles en esta página.";
}
```

**Step 4: Run test to verify it passes**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: PASS and chatbot uses visible schedule context.

**Step 5: Commit**

```bash
git add landing-publico-semana-santa-2026.html padre-alan-chat.js
git commit -m "feat: polish public landing flow and strengthen chatbot context for schedule queries"
```

---

### Task 7: Actualizar `portal-marketing-parroquial-2026.html` y cerrar QA transversal

**Files:**
- Modify: `portal-marketing-parroquial-2026.html`
- Modify: `assets/css/campaign-2026-theme.css` (if needed for final token tuning)
- Test: `scripts/verify-campaign-pages.sh`

**Step 1: Write the failing test**

```bash
rg -q "campaign-2026-theme.css" portal-marketing-parroquial-2026.html
rg -q "campaign-cover.js" portal-marketing-parroquial-2026.html
rg -q "landing-publico-semana-santa-2026.html" portal-marketing-parroquial-2026.html
```

**Step 2: Run test to verify it fails (if any missing references)**

Run: `bash scripts/verify-campaign-pages.sh`  
Expected: FAIL on any missing integration.

**Step 3: Write minimal implementation**

```html
<section class="ops-links">
  <a href="landing-publico-semana-santa-2026.html">Landing público</a>
  <a href="manta-semana-santa-2026.html">Manta Semana Santa</a>
  <a href="manta-cambio-horario-vespertinas-2026.html">Manta cambio horario</a>
  <a href="manta-ejercicios-espirituales-2026.html">Manta ejercicios</a>
</section>
```

**Step 4: Run full verification**

Run: `bash scripts/verify-campaign-pages.sh && git diff --check`  
Expected: PASS and no whitespace/conflict markers.

**Step 5: Commit**

```bash
git add portal-marketing-parroquial-2026.html assets/css/campaign-2026-theme.css scripts/verify-campaign-pages.sh
git commit -m "feat: complete campaign-wide visual system and office portal integration"
```

---

## Final Validation Checklist

1. Cover de 2.0s aparece en las 5 páginas.
2. Botón "Saltar animación" funcional en todas.
3. `Esc` cierra cover en todas.
4. `prefers-reduced-motion` evita animación intrusiva.
5. Horarios oficiales visibles y consistentes.
6. Landing mantiene video intro antes de galería.
7. Chatbot responde horarios desde contexto visible.
8. QR de campaña apunta al landing público.

---

## Rollback Plan

Si una página queda inestable:
1. `git restore <archivo-afectado>`
2. Reaplicar solo el bloque de tema/cover compartido.
3. Re-ejecutar `bash scripts/verify-campaign-pages.sh`.
4. Hacer commit pequeño y aislado por página.
