#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

pages=(
  "landing-publico-semana-santa-2026.html"
  "portal-marketing-parroquial-2026.html"
  "manta-semana-santa-2026.html"
  "manta-cambio-horario-vespertinas-2026.html"
  "manta-ejercicios-espirituales-2026.html"
)

for f in "${pages[@]}"; do
  rg -q "campaign-2026-theme.css" "$f"
  rg -q "campaign-2026-motion.css" "$f"
  rg -q "campaign-cover.js" "$f"
  rg -q "data-campaign-cover" "$f"
  rg -q "data-cover-skip" "$f"
done

rg -q "7:00 PM" manta-semana-santa-2026.html
rg -q "A partir del Domingo de Pascua" manta-cambio-horario-vespertinas-2026.html
rg -q "16 al 20 de marzo de 2026" manta-ejercicios-espirituales-2026.html
rg -q "Después de misa de 6:00 PM" manta-ejercicios-espirituales-2026.html
rg -q "registro-ministerio-select" landing-publico-semana-santa-2026.html
rg -q "mec-ramos.html#registro" landing-publico-semana-santa-2026.html
rg -q "monaguillos-ramos.html#registro" landing-publico-semana-santa-2026.html
rg -q "lectores-ramos.html#registro" landing-publico-semana-santa-2026.html
rg -q "coro-ramos.html#registro" landing-publico-semana-santa-2026.html
rg -q "ujieres-ramos.html#registro" landing-publico-semana-santa-2026.html
rg -q "sacristia-ramos.html#registro" landing-publico-semana-santa-2026.html
rg -q "padre-alan-chat.js" landing-publico-semana-santa-2026.html

printf 'OK: campaign page checks passed\n'
