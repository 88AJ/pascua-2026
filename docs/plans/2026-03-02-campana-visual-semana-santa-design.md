# Campaña Visual Semana Santa 2026 - Diseño Aprobado

**Fecha:** 2026-03-02  
**Proyecto:** `pascua-2026`  
**Páginas objetivo:**
- `manta-semana-santa-2026.html`
- `manta-cambio-horario-vespertinas-2026.html`
- `manta-ejercicios-espirituales-2026.html`
- `landing-publico-semana-santa-2026.html`
- `portal-marketing-parroquial-2026.html`

---

## 1) Objetivo de diseño

Unificar toda la campaña de Semana Santa 2026 bajo una experiencia visual premium, institucional y efectiva para:
- Impresión (mantas/panorámicos/banners).
- Pantalla (landing y portal interno).
- Comunicación pública clara (horarios, llamados, registro, recursos).

La referencia solicitada por el usuario es estética tipo `dark.netflix.io`, adaptada a identidad parroquial (inspiración, no copia literal).

---

## 2) Decisiones aprobadas por el usuario

1. Enfoque visual: **Opción C híbrida premium**.
2. Coherencia: **total de campaña** (misma base visual en las 5 piezas).
3. Nivel de impacto: **balanceado** (premium + legible).
4. Animación: **cinematográfica**.
5. Cover/intro con logo:
- En **todas** las páginas.
- Duración: **2.0 segundos**.
- Con botón **"Saltar animación"**.
- Activable por tecla **Esc**.
6. Motion en experiencia completa:
- Intro por capas.
- Reveal de contenido con transiciones suaves cinematográficas.
7. Accesibilidad:
- Soporte `prefers-reduced-motion` (entrada sin animación o mínima).

---

## 3) Sistema visual global (campaña)

### 3.1 Paleta única
- Carbón profundo: `#0E0F12`
- Azul noche litúrgico: `#1E2A44`
- Dorado parroquial: `#C8A86B`
- Marfil de lectura: `#F7F2E8`
- Vino de acento: `#7C2A2A`

### 3.2 Tipografía única
- Títulos: `Cinzel`
- Texto y horarios: `Montserrat`

### 3.3 Reglas de legibilidad
- Horarios en alto contraste y peso semibold/bold.
- Jerarquía fija: **Día > Hora > Descripción breve**.
- Máximo 1 mensaje pastoral por bloque para no saturar.
- CTA único por sección crítica.

---

## 4) Dirección de contenido (copy + UX)

### 4.1 Consistencia textual
- Formato de hora estándar: `10:00 AM`, `6:00 PM`, `7:00 PM`.
- Lenguaje institucional parroquial, claro y breve.

### 4.2 Diferencia por audiencia
- `landing-publico`: enfoque fiel/comunidad (informativo y accionable).
- `portal-marketing`: enfoque oficina/operación (descargas, control y difusión).

### 4.3 Chatbot en landing público
- Debe responder con base en horarios visibles del landing.
- No debe contestar "horarios no publicados" cuando están en página.

---

## 5) Aplicación por archivo

### 5.1 `manta-semana-santa-2026.html`
- Hero visual dramático (Cristo), panel editorial legible y QR visible.
- Enfoque: anuncio integral de Semana Santa.

### 5.2 `manta-cambio-horario-vespertinas-2026.html`
- Pieza de impacto rápido: titular, fecha de inicio, nueva hora.
- Imagen centrada en cúpulas y arquitectura, no cielo vacío.

### 5.3 `manta-ejercicios-espirituales-2026.html`
- Composición inspirada en flyer de referencia.
- Datos oficiales: `16 al 20 de marzo de 2026`, después de misa de `6:00 PM`.
- Impartido por ambos sacerdotes.

### 5.4 `landing-publico-semana-santa-2026.html`
- Inicia con cover de logo (2.0s), luego reveal al contenido.
- Video de introducción colocado antes de "Vida Parroquial en Imágenes".
- Bloque de Ejercicios con componente visual interactivo.
- Registro directo a `panel-coordinador`.
- Chatbot contextual integrado.

### 5.5 `portal-marketing-parroquial-2026.html`
- Misma identidad visual y motion.
- Centro de operación para oficina parroquial.

---

## 6) Criterios de calidad

1. Coherencia visual entre todas las piezas.
2. Lectura clara en móvil, desktop e impresión.
3. Animaciones fluidas sin degradar rendimiento.
4. Degradación elegante en dispositivos con motion reducido.
5. Mensajes correctos según horarios/parroquia confirmados.

---

## 7) Fuera de alcance por ahora

- Rediseño litúrgico doctrinal de contenidos ministeriales.
- Cambios a flujos de registro en backend.
- Nuevas integraciones externas de datos.

---

## 8) Próximo paso

Crear plan de implementación detallado por tareas y ejecutar por etapas, iniciando por tokens visuales globales y cover reusable.
