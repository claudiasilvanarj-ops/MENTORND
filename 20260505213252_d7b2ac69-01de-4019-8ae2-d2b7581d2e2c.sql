
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age int,
  gender text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.patients enable row level security;
create policy "own patients all" on public.patients for all
  using (auth.uid() = therapist_id) with check (auth.uid() = therapist_id);

create table public.pleitos (
  id uuid primary key default gen_random_uuid(),
  numero int not null unique,
  nome text not null,
  descricao text,
  frequencia_hz numeric,
  chakra_alvo text,
  created_at timestamptz not null default now()
);
alter table public.pleitos enable row level security;
create policy "pleitos read auth" on public.pleitos for select to authenticated using (true);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users(id) on delete cascade,
  paciente_id uuid not null references public.patients(id) on delete cascade,
  pleito_id uuid references public.pleitos(id),
  aura_before int,
  aura_after int,
  stress_before int,
  stress_after int,
  delta_m numeric,
  frequencia_hz numeric,
  chakra_alvo text,
  observacoes text,
  baseline_image_url text,
  after_image_url text,
  created_at timestamptz not null default now()
);
alter table public.sessions enable row level security;
create policy "own sessions all" on public.sessions for all
  using (auth.uid() = therapist_id) with check (auth.uid() = therapist_id);

create index on public.sessions (paciente_id, created_at desc);
create index on public.patients (therapist_id);

do $$
declare
  nomes text[] := array['Reparo Celular','Integridade Noosférica','Harmonia Cardíaca','Limpeza Áurica','Equilíbrio Hormonal','Reconexão Espiritual','Liberação Emocional','Foco Mental','Vitalidade Física','Proteção Energética'];
  freqs numeric[] := array[174,285,396,417,432,528,639,741,852,963,2693];
  chakras text[] := array['Raiz','Sacral','Plexo Solar','Cardíaco','Laríngeo','Frontal','Coronário'];
  n int;
begin
  for n in 1..43 loop
    insert into public.pleitos (numero, nome, descricao, frequencia_hz, chakra_alvo)
    values (
      n,
      'Pleito ' || n || ' — ' || nomes[1 + (n % array_length(nomes,1))],
      'Aplicação vibracional voltada à reorganização bioenergética e alinhamento sutil. Substitua esta descrição pelo texto oficial do pleito ' || n || '.',
      freqs[1 + (n % array_length(freqs,1))],
      chakras[1 + (n % array_length(chakras,1))]
    );
  end loop;
end $$;
