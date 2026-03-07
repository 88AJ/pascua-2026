-- Borradores y alertas para el panel de coordinación
-- Ejecutar en Supabase SQL Editor antes de usar la nueva sección del panel.

create table if not exists public.campaign_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  draft_signature text not null unique,
  title text not null,
  message_body text not null,
  channel text not null check (channel in ('whatsapp', 'facebook', 'general')),
  audience_type text not null check (audience_type in ('general', 'ministerio', 'dia', 'ministerio_dia')),
  audience_key text not null,
  purpose text not null,
  scheduled_for timestamptz,
  status text not null default 'draft' check (status in ('draft', 'approved', 'sent', 'archived')),
  approval_notes text,
  approved_by_email text,
  approved_at timestamptz,
  sent_by_email text,
  sent_at timestamptz,
  delivery_target text,
  source_context jsonb not null default '{}'::jsonb,
  asset_url text,
  asset_alt text,
  is_high_priority boolean not null default false
);

create index if not exists campaign_drafts_status_scheduled_idx
  on public.campaign_drafts (status, scheduled_for desc nulls last);

create index if not exists campaign_drafts_audience_idx
  on public.campaign_drafts (audience_key, channel, purpose);

create or replace function public.set_campaign_drafts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists campaign_drafts_set_updated_at on public.campaign_drafts;
create trigger campaign_drafts_set_updated_at
before update on public.campaign_drafts
for each row
execute function public.set_campaign_drafts_updated_at();
