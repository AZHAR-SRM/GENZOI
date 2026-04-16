
-- Episodes backup
create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  paper_title text not null,
  episode_title text not null,
  summary text not null default '',
  key_takeaways jsonb not null default '[]'::jsonb,
  chapters jsonb not null default '[]'::jsonb,
  script jsonb not null default '[]'::jsonb,
  audio_url text,
  created_at timestamptz not null default now()
);
create index episodes_client_id_idx on public.episodes(client_id, created_at desc);

alter table public.episodes enable row level security;

create policy "Anyone can read episodes"
  on public.episodes for select
  using (true);

create policy "Anyone can insert episodes"
  on public.episodes for insert
  with check (true);

create policy "Anyone can delete episodes"
  on public.episodes for delete
  using (true);

-- ZOI chat history
create table public.zoi_messages (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index zoi_messages_client_id_idx on public.zoi_messages(client_id, created_at asc);

alter table public.zoi_messages enable row level security;

create policy "Anyone can read zoi messages"
  on public.zoi_messages for select
  using (true);

create policy "Anyone can insert zoi messages"
  on public.zoi_messages for insert
  with check (true);

create policy "Anyone can delete zoi messages"
  on public.zoi_messages for delete
  using (true);
