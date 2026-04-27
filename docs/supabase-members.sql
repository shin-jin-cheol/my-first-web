-- Run this in Supabase SQL Editor
create table if not exists public.members (
  id text primary key,
  name text not null,
  password text not null,
  created_at timestamptz not null default now()
);

-- Optional: enforce non-empty values
alter table public.members
  add constraint members_id_not_empty check (char_length(trim(id)) > 0),
  add constraint members_name_not_empty check (char_length(trim(name)) > 0),
  add constraint members_password_not_empty check (char_length(trim(password)) > 0);
