from pathlib import Path


ROOT = Path("/Users/fr.alansanchez/Documents/Playground/pascua-2026")


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_sql_contract():
    sql = read("docs/panel-admin-rls.sql")
    feature_sql = read("supabase-campaign-drafts.sql")

    assert "create table if not exists public.campaign_drafts" in feature_sql
    assert "alter table if exists public.campaign_drafts enable row level security;" in sql
    assert "campaign_drafts_select_admin" in sql
    assert "campaign_drafts_insert_admin" in sql
    assert "campaign_drafts_update_admin" in sql
    assert "campaign_drafts_delete_admin" in sql


def test_panel_contract():
    html = read("panel-coordinador.html")
    library = read("assets/data/editorial-library-2026.js")

    assert "tailwindcss.com" not in html
    assert "tailwind-panel-coordinador.css" in html
    assert "assets/data/editorial-library-2026.js" in html
    assert 'id="drafts-panel"' in html
    assert 'id="history-panel"' in html
    assert 'id="drafts-body"' in html
    assert 'id="history-body"' in html
    assert 'id="draft-priority-summary"' in html
    assert 'id="priority-summary-high"' in html
    assert 'id="priority-summary-today"' in html
    assert 'id="priority-summary-tomorrow"' in html
    assert 'id="draft-status-filter"' in html
    assert 'id="draft-channel-filter"' in html
    assert 'id="generate-week-btn"' in html
    assert 'id="generate-practice-btn"' in html
    assert 'id="generate-shortage-btn"' in html
    assert 'id="generate-general-btn"' in html
    assert "from('campaign_drafts')" in html
    assert "function humanizeDraftError" in html
    assert "function relativeScheduleLabel" in html
    assert "function draftPriorityRank" in html
    assert "function sortDraftRowsByPriority" in html
    assert "function socialPreviewHtml" in html
    assert "function copyDraftSocial" in html
    assert "function ministryServicePhrase" in html
    assert "function buildSocialPreview" in html
    assert "function buildPastoralClosing" in html
    assert "function editorialLibrary" in html
    assert "function editorialTemplate" in html
    assert "social_preview" in html
    assert "asset_reason" in html
    assert "Copiar copy Facebook" in html
    assert "async function loadDrafts" in html
    assert "async function generateDrafts" in html
    assert "async function updateDraftStatus" in html
    assert "async function copyDraftMessage" in html
    assert "window.EDITORIAL_LIBRARY_2026" in library
    assert "convocatoria_semana_santa_2026" in library
    assert "practicas_miercoles" in library
    assert "cupos_criticos" in library


if __name__ == "__main__":
    test_sql_contract()
    test_panel_contract()
    print("TEST_OK")
