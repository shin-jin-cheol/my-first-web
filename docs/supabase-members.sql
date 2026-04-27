-- Run this in Supabase SQL Editor

create table if not exists public.members (
  id text primary key,
  name text not null,
  email text unique,
  email_verified boolean not null default false,
  auth_user_id uuid unique,
  password text,
  created_at timestamptz not null default now()
);

alter table public.members
  add constraint members_id_not_empty check (char_length(trim(id)) > 0),
  add constraint members_name_not_empty check (char_length(trim(name)) > 0);
