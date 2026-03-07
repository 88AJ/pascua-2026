# Campaign Drafts And Alerts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Añadir al proyecto una capa editorial operativa que genere borradores y alertas listas para aprobar desde el panel coordinador, con respaldo en Supabase, reglas de generación y soporte visual desde el material de Semana Santa Ciclo A.

**Architecture:** Extender el panel coordinador actual con una nueva bandeja editorial y una tabla `campaign_drafts` en Supabase. Centralizar la generación de borradores en el worker existente (`scripts/worker-chat-oficiales-v2.js`) o en un módulo asociado, usando reglas basadas en registros, cupos y calendario. La fase 1 no envía automáticamente: abre el canal correcto, facilita el copy, sugiere imagen y registra el envío manual.

**Tech Stack:** HTML, CSS, Tailwind compilado localmente, Supabase (Postgres + RLS), JavaScript en cliente, Cloudflare Worker, assets locales desde `Semana Santa Ciclo A`, Playwright para validación visual.

---

### Task 1: Documentar y preparar la base de datos para borradores

**Files:**
- Create: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/supabase-campaign-drafts.sql`
- Modify: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/docs/panel-admin-rls.sql`
- Reference: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/supabase-panel-coordinador.sql`

**Step 1: Write the failing database expectations**

Definir por escrito que deben existir:
- tabla `public.campaign_drafts`
- políticas RLS de lectura/escritura admin
- índices por `status`, `channel`, `audience_key`, `scheduled_for`

**Step 2: Verify current schema does not contain the feature**

Run:
```bash
rg -n "campaign_drafts" /Users/fr.alansanchez/Documents/Playground/pascua-2026
```
Expected: no production implementation yet.

**Step 3: Write minimal schema SQL**

Incluir:
- `create table if not exists public.campaign_drafts (...)`
- índice por `status`
- índice por `scheduled_for`
- índice compuesto por `channel, audience_key`
- `updated_at`
- RLS
- helper / policies admin

**Step 4: Add admin-only access policy details**

Reusar la lógica admin existente del panel:
- lectura admin
- inserción admin
- actualización admin

**Step 5: Commit**

```bash
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 add supabase-campaign-drafts.sql docs/panel-admin-rls.sql
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 commit -m "Add campaign drafts schema and admin policies"
```

### Task 2: Diseñar soporte visual y técnico del panel coordinador

**Files:**
- Modify: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html`
- Create: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/assets/css/tailwind-panel-coordinador-input.css`
- Create: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/assets/css/tailwind-panel-coordinador.css`

**Step 1: Write the failing UI checklist**

Verificar que el panel actual:
- aún usa `tailwindcdn`
- no tiene sección `Borradores y Alertas`
- no tiene `Historial de envíos`

**Step 2: Verify current panel state**

Run:
```bash
rg -n "tailwindcss\\.com|Borradores y Alertas|Historial de envíos" /Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html
```
Expected: `tailwindcdn` present, new sections absent.

**Step 3: Add local Tailwind CSS setup**

Crear input local:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Compilar más adelante con:
```bash
npx --yes tailwindcss@3.4.17 -i /Users/fr.alansanchez/Documents/Playground/pascua-2026/assets/css/tailwind-panel-coordinador-input.css -o /Users/fr.alansanchez/Documents/Playground/pascua-2026/assets/css/tailwind-panel-coordinador.css --content /Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html
```

**Step 4: Replace CDN and introduce panel structure**

Ajustar el HTML para incluir:
- CSS local compilado
- bloque `Generación`
- bloque `Bandeja de borradores`
- bloque `Historial de envíos`

**Step 5: Commit**

```bash
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 add panel-coordinador.html assets/css/tailwind-panel-coordinador-input.css assets/css/tailwind-panel-coordinador.css
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 commit -m "Add editorial workflow layout to coordinator panel"
```

### Task 3: Conectar el panel a `campaign_drafts`

**Files:**
- Modify: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html`

**Step 1: Write the failing behavior list**

El panel debe ser capaz de:
- cargar drafts
- filtrar drafts
- aprobar drafts
- archivar drafts
- marcar enviados

**Step 2: Verify current JS has no draft support**

Run:
```bash
rg -n "campaign_drafts|approved|sent|archived|delivery_target|source_context" /Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html
```
Expected: no feature yet.

**Step 3: Add minimal client-side data layer**

Implementar funciones:
- `loadDrafts()`
- `renderDrafts()`
- `approveDraft(id)`
- `archiveDraft(id)`
- `markDraftSent(id)`
- `copyDraftMessage(id)`

**Step 4: Add status-safe UI updates**

Cada acción debe:
- mostrar feedback claro
- recargar la lista
- no romper el acceso admin actual

**Step 5: Commit**

```bash
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 add panel-coordinador.html
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 commit -m "Connect coordinator panel to campaign drafts workflow"
```

### Task 4: Crear generador básico de borradores en el worker

**Files:**
- Modify: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/scripts/worker-chat-oficiales-v2.js`

**Step 1: Write the failing API contract**

Definir endpoints o rutas mínimas:
- `POST /campaign-drafts/generate`
- `GET /campaign-drafts/health` opcional

Entradas esperadas:
- `mode`
- `ministry`
- `day`
- `channel`

Salidas esperadas:
- cantidad generada
- resumen
- errores

**Step 2: Verify current worker lacks draft generation**

Run:
```bash
rg -n "campaign-drafts|generate.*draft|recordatorio_practica|recordatorio_24h|cupo_bajo" /Users/fr.alansanchez/Documents/Playground/pascua-2026/scripts/worker-chat-oficiales-v2.js
```
Expected: absent.

**Step 3: Add minimal generation module**

Implementar:
- lectura de registros/cupos si el worker tiene acceso o recibe contexto desde panel
- plantillas por:
  - práctica de miércoles
  - recordatorio 24 h
  - convocatoria
  - cupo bajo
  - horario general
- inserción en `campaign_drafts`

**Step 4: Protect generation with admin token**

Reusar patrón actual:
- `ADMIN_TOKEN`
- header admin

**Step 5: Commit**

```bash
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 add scripts/worker-chat-oficiales-v2.js
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 commit -m "Add campaign draft generation endpoints to worker"
```

### Task 5: Codificar reglas iniciales de generación

**Files:**
- Modify: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/scripts/worker-chat-oficiales-v2.js`
- Reference: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/supabase-seed-all-ministerios.sql`
- Reference: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/landing-publico-semana-santa-2026.html`

**Step 1: Write the failing rule checklist**

La fase 1 debe generar al menos:
- prácticas de miércoles
- recordatorio 24 h por ministerio/día
- cupo bajo
- convocatoria general
- horario general

**Step 2: Add deterministic templates**

Evitar depender de IA para esta primera fase.
Usar plantillas deterministas con variables:
- `{{ministerio}}`
- `{{dia}}`
- `{{hora}}`
- `{{lugar}}`
- `{{grupo_link}}`

**Step 3: Add prioritization**

Reglas:
- alta
- media
- baja

Setear:
- `is_high_priority`
- `purpose`
- `scheduled_for`

**Step 4: Insert `source_context`**

Guardar JSON con:
- ministerio
- día
- slot
- capacidad
- registrados
- motivo de generación

**Step 5: Commit**

```bash
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 add scripts/worker-chat-oficiales-v2.js
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 commit -m "Add deterministic rules for campaign draft generation"
```

### Task 6: Añadir soporte visual desde “Semana Santa Ciclo A”

**Files:**
- Modify: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/scripts/worker-chat-oficiales-v2.js`
- Optionally create: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/assets/campaign-drafts/asset-map.json`

**Step 1: Write the failing asset selection checklist**

Cada borrador relevante debe poder sugerir:
- `asset_path`
- `asset_caption`

**Step 2: Map campaign image categories**

Crear un mapa simple:
- `templo`
- `custodia`
- `cristo_crucificado`
- `cristo_resucitado`
- `velas`
- `corona_espinas`
- `parroquia_real`

Usar archivos válidos desde el material de `Semana Santa Ciclo A` o assets ya copiados al repo.

**Step 3: Attach assets to draft generation**

Reglas ejemplo:
- horario general → `templo`
- ejercicios → `custodia`
- viernes → `cristo_crucificado`
- vigilia / resurrección → `cristo_resucitado` o `velas`

**Step 4: Surface asset preview in panel**

Mostrar miniatura e identificación del asset en la bandeja.

**Step 5: Commit**

```bash
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 add scripts/worker-chat-oficiales-v2.js assets/campaign-drafts/asset-map.json panel-coordinador.html
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 commit -m "Add visual asset suggestions for campaign drafts"
```

### Task 7: Añadir acciones editoriales finales en el panel

**Files:**
- Modify: `/Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html`

**Step 1: Add action buttons per draft**

Cada draft aprobado debe poder:
- copiar mensaje
- abrir grupo de WhatsApp correcto
- abrir Facebook
- marcar enviado

**Step 2: Add sent/archive history**

Crear lista separada o filtro por estado:
- `approved`
- `sent`
- `archived`

**Step 3: Add optimistic but safe UX**

Después de cada acción:
- refrescar lista
- mostrar feedback
- preservar filtros

**Step 4: Verify admin-only behavior**

El usuario no admin no debe ver ni usar esta capa.

**Step 5: Commit**

```bash
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 add panel-coordinador.html
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 commit -m "Add approval and delivery actions for campaign drafts"
```

### Task 8: Verificación técnica y visual final

**Files:**
- Verify only:
  - `/Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html`
  - `/Users/fr.alansanchez/Documents/Playground/pascua-2026/scripts/worker-chat-oficiales-v2.js`
  - `/Users/fr.alansanchez/Documents/Playground/pascua-2026/supabase-campaign-drafts.sql`

**Step 1: Verify panel without Tailwind CDN**

Run:
```bash
rg -n "tailwindcss\\.com" /Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html
```
Expected: no matches.

**Step 2: Verify UI in browser**

Open:
- local panel
- login
- drafts section
- filters
- approval flow

**Step 3: Verify worker routes**

Probar con `curl` o fetch:
- generación
- health

Expected:
- respuesta JSON válida
- sin romper endpoints existentes del bot

**Step 4: Verify Supabase flow**

Comprobar:
- insert draft
- approve
- sent
- archive

**Step 5: Final commit**

```bash
git -C /Users/fr.alansanchez/Documents/Playground/pascua-2026 commit -m "Complete coordinator drafts and alerts workflow"
```
