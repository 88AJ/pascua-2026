# Campaign Drafts And Alerts Design

**Proyecto:** Pascua 2026 · Parroquia San Pedro Apóstol  
**Ámbito:** Panel coordinador, Supabase, worker y apoyo visual para comunicación pastoral

## Objetivo

Crear una capa editorial operativa para Semana Santa 2026 que permita **generar borradores y alertas listas para aprobar** antes de publicarlas o enviarlas. El sistema no debe publicar automáticamente en esta fase. Debe organizar el trabajo pastoral y operativo, conservar trazabilidad y dejar camino claro para una fase posterior con semiautomatización más agresiva.

## Decisión aprobada

Se adopta la lógica de **borradores con aprobación previa**:

1. El sistema genera propuestas.
2. El coordinador revisa.
3. El coordinador aprueba.
4. El panel abre el canal correcto (`WhatsApp` o `Facebook`) y facilita el copy.
5. El coordinador publica o envía.
6. El panel marca el borrador como enviado.

Esto evita automatización ciega y conserva control pastoral, tono adecuado y criterio humano.

## Estado real del proyecto sobre el que se diseña

### Panel actual
- `/Users/fr.alansanchez/Documents/Playground/pascua-2026/panel-coordinador.html`
- Ya resuelve:
  - acceso administrador,
  - cupos y control,
  - nombres registrados,
  - borrado de registros,
  - actualización de `mec_slots`.

### Base actual
- `public.mec_slots`
- `public.mec_registrations`
- `public.v_panel_coordinador`
- `public.v_mec_registration_roster`

### Worker actual
- `/Users/fr.alansanchez/Documents/Playground/pascua-2026/scripts/worker-chat-oficiales-v2.js`
- Ya resuelve:
  - contexto oficial externo,
  - bot pastoral,
  - Meta CAPI lead,
  - cron / refresh de fuentes oficiales.

### Sistema visual / campaña
- Existe material en `Semana Santa Ciclo A` que debe alimentar la capa visual de borradores.
- El sistema debe poder sugerir imágenes coherentes para Facebook y recordatorios, no solo texto.

## Arquitectura aprobada

### 1. Panel coordinador

`panel-coordinador.html` conserva sus tres bloques existentes y añade dos nuevos:

- **Borradores y Alertas**
- **Historial de envíos**

El panel seguirá siendo el centro operativo único para:
- revisar cupos,
- revisar nombres,
- generar comunicación,
- aprobar comunicación,
- registrar qué ya se envió.

### 2. Supabase

Se agrega una sola tabla nueva para comenzar:

**Tabla:** `public.campaign_drafts`

Propósito:
- guardar borradores,
- registrar su canal,
- registrar su audiencia,
- registrar su contexto de generación,
- registrar aprobación,
- registrar envío,
- permitir historial y filtros.

### 3. Generador

Se añade una capa generadora que puede vivir como endpoint dentro del worker actual o como módulo llamado por el panel.

Su tarea es producir borradores según:
- calendario de Semana Santa,
- registros reales,
- cupos por slot,
- prácticas de miércoles después de misa de 6 PM,
- necesidades por ministerio o día,
- avisos generales,
- assets visuales recomendados.

### 4. Apertura de canal

El panel **no envía solo** en esta fase.

Debe permitir:
- copiar mensaje,
- abrir grupo o WhatsApp correspondiente,
- abrir Facebook,
- marcar manualmente como enviado.

## Tabla aprobada

### `public.campaign_drafts`

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `title text not null`
- `message_body text not null`
- `channel text not null`
  - `whatsapp`
  - `facebook`
  - `general`
- `audience_type text not null`
  - `general`
  - `ministerio`
  - `dia`
  - `ministerio_dia`
- `audience_key text not null`
  - ejemplos:
    - `general`
    - `mec`
    - `ramos`
    - `mec-jueves`
- `purpose text not null`
  - ejemplos:
    - `recordatorio_practica`
    - `recordatorio_24h`
    - `cupo_bajo`
    - `cupo_lleno`
    - `convocatoria`
    - `horario_general`
    - `seguimiento_registro`
- `scheduled_for timestamptz null`
- `status text not null default 'draft'`
  - `draft`
  - `approved`
  - `sent`
  - `archived`
- `approval_notes text null`
- `approved_by_email text null`
- `approved_at timestamptz null`
- `sent_by_email text null`
- `sent_at timestamptz null`
- `delivery_target text null`
  - grupo de WhatsApp o `"Facebook Page"`
- `source_context jsonb not null default '{}'::jsonb`
- `asset_path text null`
- `asset_caption text null`
- `is_high_priority boolean not null default false`

## Flujo editorial aprobado

### Paso 1. Generación

El coordinador genera borradores desde el panel:
- recordatorios de la semana,
- prácticas de miércoles,
- seguimiento de cupos,
- convocatoria general,
- borradores manuales apoyados por plantilla.

### Paso 2. Revisión

Cada borrador se ve en una bandeja con:
- título,
- canal,
- audiencia,
- fecha sugerida,
- prioridad,
- asset recomendado,
- mensaje.

### Paso 3. Aprobación

El coordinador puede:
- aprobar,
- agregar notas,
- archivar,
- dejar en draft.

### Paso 4. Apertura de canal

Con el borrador aprobado, el panel debe permitir:
- copiar el texto,
- abrir el grupo de WhatsApp correcto,
- abrir la página de Facebook,
- ver la imagen sugerida.

### Paso 5. Registro de envío

Una vez publicado o enviado, el coordinador marca:
- enviado,
- fecha/hora,
- usuario admin que lo marcó.

## Reglas de generación aprobadas

### A. Prácticas de miércoles
- Generar recordatorio semanal.
- Canal sugerido: `whatsapp`.
- Audiencia:
  - general,
  - o por ministerio según necesidad.
- Debe mencionar:
  - después de misa de 6 PM,
  - puntualidad,
  - llevar lo necesario,
  - revisión previa de funciones si aplica.

### B. Recordatorio previo a celebración
- Generar 24 horas antes si existe registro en ese ministerio/día.
- Ejemplo:
  - `mec-jueves`
  - `monaguillos-viernes`
- Canal sugerido: `whatsapp`.
- Debe mencionar:
  - celebración,
  - hora,
  - templo/capilla,
  - detalle breve útil.

### C. Cupos bajos
- Generar borrador cuando falten pocos servidores en una celebración relevante.
- Puede sugerir:
  - `whatsapp general`
  - `facebook`
- Tono:
  - concreto,
  - pastoral,
  - sin dramatismo artificial.

### D. Cupos llenos
- Generar aviso interno.
- No se usa como publicación pública por defecto.

### E. Convocatoria general
- Generar borradores para reclutamiento cuando un ministerio vaya bajo.
- Canal sugerido:
  - `facebook`
  - `whatsapp general`

### F. Avisos generales
- Cambios de horario,
- notas extraordinarias,
- recordatorios amplios de Semana Santa.

## Prioridad

- **Alta**
  - cambios de horario,
  - celebraciones del día siguiente,
  - cupos críticos,
  - prácticas inmediatas.

- **Media**
  - recordatorios periódicos,
  - seguimiento de grupos,
  - convocatoria semanal.

- **Baja**
  - publicaciones generales no urgentes.

## Uso de imágenes desde “Semana Santa Ciclo A”

El sistema debe poder sugerir una imagen por borrador.

No se busca una biblioteca compleja en esta fase. Se busca una selección útil y operativa:
- templo / fachada,
- custodia / adoración,
- Cristo crucificado,
- Cristo resucitado,
- velas,
- corona de espinas,
- fotos parroquiales reales si sirven para convocatoria.

### Regla visual

El borrador debe guardar:
- `asset_path`
- `asset_caption`

Esto permite que el panel muestre una miniatura sugerida junto al mensaje, especialmente para Facebook.

## Canales y límites de la fase 1

### WhatsApp
Sí entra en flujo semiautomático de aprobación:
- abrir grupo correcto,
- copiar mensaje,
- marcar enviado.

### Facebook
Sí entra como canal de aprobación manual:
- abrir la página,
- copiar el texto aprobado,
- usar imagen sugerida,
- marcar enviado.

### Lo que no se hará todavía
- publicación automática real en Facebook,
- envío automático a grupos de WhatsApp,
- automatización sin aprobación.

## Criterio de éxito

La fase se considera bien diseñada si:

1. El panel puede generar borradores útiles sin improvisación manual completa.
2. Cada borrador tiene canal, audiencia, prioridad y contexto claros.
3. El coordinador puede aprobar y registrar envíos sin perder trazabilidad.
4. El sistema sugiere imágenes coherentes desde el material de Semana Santa Ciclo A.
5. El proyecto queda preparado para una fase posterior de mayor automatización sin rediseñar toda la arquitectura.
