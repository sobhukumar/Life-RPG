-- ============================================================
-- LIFE RPG — NEON DRIFT — SUPABASE DATABASE SCHEMA
-- Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: characters
-- One row per user. Created automatically on signup.
-- ============================================================
create table if not exists public.characters (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null default 'Runner',
  level         integer not null default 1,
  xp            integer not null default 0,
  coins         integer not null default 100,
  streak_count  integer not null default 0,
  last_active_date date,
  boss_damage_dealt integer not null default 0,
  created_at    timestamptz not null default now(),
  unique(user_id)
);

-- ============================================================
-- TABLE: tasks
-- User's missions/quests.
-- ============================================================
create table if not exists public.tasks (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  category      text not null default 'cyber',
  xp_reward     integer not null default 50,
  coin_reward   integer not null default 20,
  completed     boolean not null default false,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- TABLE: attributes
-- RPG attributes linked to a character.
-- Mapped from task categories:
--   cyber      → Intellect
--   hardware   → Strength
--   glitch     → Agility
--   ramen      → Discipline
-- ============================================================
create table if not exists public.attributes (
  id            uuid primary key default uuid_generate_v4(),
  character_id  uuid not null references public.characters(id) on delete cascade,
  name          text not null,
  value         integer not null default 0,
  unique(character_id, name)
);

-- ============================================================
-- TABLE: inventory
-- Shop items purchased by user.
-- ============================================================
create table if not exists public.inventory (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  item_name     text not null,
  item_category text not null default 'jackets',
  price         integer not null default 0,
  equipped      boolean not null default false,
  image_url     text,
  purchased_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Each user can only read/write their own rows.
-- ============================================================

-- characters
alter table public.characters enable row level security;
create policy "Users can view own character"
  on public.characters for select
  using (auth.uid() = user_id);
create policy "Users can insert own character"
  on public.characters for insert
  with check (auth.uid() = user_id);
create policy "Users can update own character"
  on public.characters for update
  using (auth.uid() = user_id);

-- tasks
alter table public.tasks enable row level security;
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);
create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);
create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);
create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- attributes
alter table public.attributes enable row level security;
create policy "Users can view own attributes"
  on public.attributes for select
  using (
    character_id in (
      select id from public.characters where user_id = auth.uid()
    )
  );
create policy "Users can insert own attributes"
  on public.attributes for insert
  with check (
    character_id in (
      select id from public.characters where user_id = auth.uid()
    )
  );
create policy "Users can update own attributes"
  on public.attributes for update
  using (
    character_id in (
      select id from public.characters where user_id = auth.uid()
    )
  );

-- inventory
alter table public.inventory enable row level security;
create policy "Users can view own inventory"
  on public.inventory for select
  using (auth.uid() = user_id);
create policy "Users can insert own inventory"
  on public.inventory for insert
  with check (auth.uid() = user_id);
create policy "Users can update own inventory"
  on public.inventory for update
  using (auth.uid() = user_id);
create policy "Users can delete own inventory"
  on public.inventory for delete
  using (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: auto-create character + default attributes on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_char_id uuid;
begin
  -- Create the character
  insert into public.characters (user_id, name, level, xp, coins)
  values (new.id, 'Runner', 1, 0, 100)
  returning id into new_char_id;

  -- Seed the 4 attributes
  insert into public.attributes (character_id, name, value) values
    (new_char_id, 'Intellect', 0),
    (new_char_id, 'Strength', 0),
    (new_char_id, 'Agility', 0),
    (new_char_id, 'Discipline', 0);

  return new;
end;
$$;

-- Trigger: fires after a new user signs up via Supabase Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DONE! Go back to the app and add your .env keys.
-- ============================================================
