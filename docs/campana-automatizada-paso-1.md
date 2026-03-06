# Paso 1 - Calendario Maestro de Campana 2026

Archivo maestro generado:
- `assets/campana-2026/calendario-campana-automatizada-2026.csv`

## Objetivo
Centralizar en un solo archivo las publicaciones y mensajes para ejecutar automatizacion de contenido sin perder control pastoral.

## Estructura del CSV
- `campaign_id`: etiqueta unica de campana
- `phase`: fase estrategica (F1-F5)
- `send_at_local`: fecha y hora local (America/Monterrey)
- `channel`: canal de salida (ejemplo: `facebook_page`)
- `audience`: publico objetivo
- `topic`: tema del mensaje
- `headline`: titulo corto
- `message`: copy principal
- `cta_text`: texto del llamado a la accion
- `cta_url`: liga objetivo
- `asset_path`: recurso visual sugerido
- `priority`: critica, alta o media
- `status`: PENDING, SENT, FAILED, HOLD

## Fases incluidas
- F1 (6-15 marzo): convocatoria general y voluntariado
- F2 (16-20 marzo): ejercicios espirituales diarios
- F3 (21-28 marzo): cuenta regresiva y practicas
- F4 (29 marzo-5 abril): Semana Santa y Pascua
- F5 (postpascua): seguimiento y continuidad

## Regla operativa
- Antes de publicar, validar que `cta_url` y `asset_path` existan.
- Al publicar, actualizar `status` y guardar referencia del post.
- Si falla, marcar `FAILED` y reagendar.

## Proximo paso (Paso 2)
Construir script/Worker que lea este CSV y publique automaticamente segun `send_at_local`.
