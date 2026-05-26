-- EngineerNest future Supabase/Postgres schema (MVP planning)
-- NOTE: estimation calculations are preliminary and must be verified by a qualified engineer.

create table if not exists company_profile (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  tagline_en text not null,
  tagline_bn text not null,
  phone text not null,
  email text not null,
  whatsapp text not null,
  address_en text not null,
  address_bn text not null,
  about_en text not null,
  about_bn text not null,
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_bn text not null,
  location_en text not null,
  location_bn text not null,
  status_en text not null,
  status_bn text not null,
  budget numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists boq_items (
  id uuid primary key default gen_random_uuid(),
  item_en text not null,
  item_bn text not null,
  quantity numeric(14,3) not null,
  unit text not null,
  unit_rate numeric(14,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null,
  summary_en text not null,
  summary_bn text not null,
  labor_count integer not null,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_bn text not null,
  document_type text not null,
  category text not null default 'company-document',
  url text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  storage_provider text not null default 'local',
  created_at timestamptz not null default now()
);

create table if not exists content_sections (
  id uuid primary key default gen_random_uuid(),
  headline_en text not null,
  headline_bn text not null,
  body_en text not null,
  body_bn text not null,
  cta_en text not null,
  cta_bn text not null,
  created_at timestamptz not null default now()
);

create table if not exists material_rates (
  id text primary key,
  name_en text not null,
  name_bn text not null,
  unit text not null,
  rate numeric(14,2) not null,
  updated_at timestamptz not null default now()
);

create table if not exists estimator_configs (
  id uuid primary key default gen_random_uuid(),
  markup_percent numeric(6,2) not null default 0,
  vat_percent numeric(6,2) not null default 0,
  slab_thickness_inch numeric(6,2) not null default 5,
  steel_kg_per_sft numeric(8,3) not null default 3,
  wall_area_factor numeric(8,3) not null default 1.8,
  plaster_thickness_mm numeric(8,3) not null default 12,
  shotok_to_sft numeric(10,4) not null default 435.6,
  katha_to_sft numeric(10,4) not null default 720,
  bigha_to_sft numeric(10,4) not null default 14400,
  updated_at timestamptz not null default now()
);
