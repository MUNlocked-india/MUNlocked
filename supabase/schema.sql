-- MUNlocked — Auth & Profiles schema
-- Run this in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query)

-- 1. Role enum -------------------------------------------------------------
create type public.user_role as enum ('delegate', 'eb', 'organizer', 'admin');

-- 2. Profiles table ---------------------------------------------------------
-- One row per auth.users row. Created automatically by the trigger below,
-- never inserted directly by the client.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'delegate',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can read any profile (needed for EB directory, org listings, etc.)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only update their own profile, and can never change their own role
-- (role changes should go through an admin-only path, added later).
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Auto-create a profile row whenever a new user signs up -----------------
-- Reads full_name and role out of the signUp() call's `options.data` payload.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New Delegate'),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'delegate')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Helpful index for role-based dashboard queries --------------------------
create index profiles_role_idx on public.profiles (role);

-- 5. Conferences table -------------------------------------------------------
create type public.conference_status as enum ('pending', 'approved', 'rejected');

create table public.conferences (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  secretariat text not null,
  contact_email text not null,
  format text not null,               -- 'online' | 'in_person' | 'hybrid'
  city text,
  event_date date not null,
  delegate_fee numeric,
  committees text[] not null default '{}',
  brochure_url text,
  registration_url text,
  status public.conference_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  review_note text,
  created_at timestamptz not null default now()
);

alter table public.conferences enable row level security;

-- Anyone signed in can see approved conferences (the public directory).
create policy "Approved conferences are viewable by everyone signed in"
  on public.conferences for select
  to authenticated
  using (status = 'approved');

-- Submitters can always see their own listing, whatever its status.
create policy "Submitters can view their own conferences"
  on public.conferences for select
  to authenticated
  using (auth.uid() = submitted_by);

-- Admins can see everything, including the pending queue.
create policy "Admins can view all conferences"
  on public.conferences for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Any signed-in user can submit a conference — it always starts 'pending',
-- regardless of what the client sends, so nobody can self-approve.
create policy "Signed-in users can submit conferences as pending"
  on public.conferences for insert
  to authenticated
  with check (auth.uid() = submitted_by and status = 'pending');

-- Only admins can change status (approve/reject).
create policy "Only admins can update conference status"
  on public.conferences for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create index conferences_status_idx on public.conferences (status);

-- 6. Digital Marksheet System -------------------------------------------------
create type public.eb_role as enum ('chair', 'co_chair');

create table public.committees (
  id uuid primary key default gen_random_uuid(),
  name text not null,            -- e.g. "Human Rights Council"
  code text not null,            -- e.g. "HRC"
  conference_name text,          -- free-text link to a conference, optional
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.committee_members (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  role public.eb_role not null default 'co_chair',
  created_at timestamptz not null default now(),
  unique (committee_id, email)
);

create table public.delegates (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  country text not null,
  delegate_name text,
  created_at timestamptz not null default now(),
  unique (committee_id, country)
);

create table public.marks (
  delegate_id uuid primary key references public.delegates(id) on delete cascade,
  poi int not null default 0,
  chits int not null default 0,
  verbal_reply int not null default 0,
  gsl int not null default 0,
  mod int not null default 0,
  decorum int not null default 0,
  research int not null default 0,
  documentation int not null default 0,
  notes text not null default '',
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- Helper: is the current user a chair/co-chair of this committee (or its
-- creator), OR an admin (Secretariat visibility)? Security definer so it can
-- read committee_members without RLS recursion issues.
create function public.can_access_committee(target_committee_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  requester_email text;
begin
  select email into requester_email from auth.users where id = auth.uid();

  return exists (
    select 1 from public.committees
    where id = target_committee_id and created_by = auth.uid()
  ) or exists (
    select 1 from public.committee_members
    where committee_id = target_committee_id
      and (user_id = auth.uid() or email = requester_email)
  ) or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

alter table public.committees enable row level security;
alter table public.committee_members enable row level security;
alter table public.delegates enable row level security;
alter table public.marks enable row level security;

create policy "Members and admins can view committees"
  on public.committees for select to authenticated
  using (public.can_access_committee(id));

create policy "Authenticated users can create their committees"
  on public.committees for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "Members can view committee_members"
  on public.committee_members for select to authenticated
  using (public.can_access_committee(committee_id));

create policy "Chairs can invite co-chairs"
  on public.committee_members for insert to authenticated
  with check (
    exists (select 1 from public.committees where id = committee_id and created_by = auth.uid())
    or exists (
      select 1 from public.committee_members m
      where m.committee_id = committee_members.committee_id
        and m.user_id = auth.uid() and m.role = 'chair'
    )
  );

create policy "Members can view delegates"
  on public.delegates for select to authenticated
  using (public.can_access_committee(committee_id));

create policy "Members can add delegates"
  on public.delegates for insert to authenticated
  with check (public.can_access_committee(committee_id));

create policy "Members can remove delegates"
  on public.delegates for delete to authenticated
  using (public.can_access_committee(committee_id));

create policy "Members can view marks"
  on public.marks for select to authenticated
  using (public.can_access_committee((select committee_id from public.delegates where id = delegate_id)));

create policy "Members can insert marks"
  on public.marks for insert to authenticated
  with check (public.can_access_committee((select committee_id from public.delegates where id = delegate_id)));

create policy "Members can update marks"
  on public.marks for update to authenticated
  using (public.can_access_committee((select committee_id from public.delegates where id = delegate_id)))
  with check (public.can_access_committee((select committee_id from public.delegates where id = delegate_id)));

-- 7. Executive Board applications ---------------------------------------------
create type public.eb_application_status as enum ('pending', 'approved', 'rejected');

create table public.eb_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  applicant_email text not null,
  bio text not null,
  experience text not null,
  eb_experience text not null default '',
  delegate_experience text not null default '',
  areas_of_expertise text[] not null default '{}',
  remuneration_expectations jsonb not null default '{}'::jsonb,
  previous_conferences text,
  display_name text,
  photo_path text,
  cv_path text,
  status public.eb_application_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  review_note text,
  created_at timestamptz not null default now(),
  removed_at timestamptz,
  removed_by uuid references public.profiles(id),
  removal_note text
);

alter table public.eb_applications enable row level security;

-- Guests can browse the EB marketplace. Public access is limited to the
-- explicit safe columns granted below; private applicant email and moderation
-- fields remain inaccessible outside signed-in workflows.
create policy "Approved EB applications are publicly viewable"
  on public.eb_applications for select to anon
  using (status = 'approved' and removed_at is null);

revoke all privileges on table public.eb_applications from anon;
grant select (
  id, applicant_id, display_name, bio, experience, eb_experience,
  delegate_experience, remuneration_expectations, areas_of_expertise,
  previous_conferences, photo_path, cv_path, created_at
) on public.eb_applications to anon;

create policy "Applicants can view their own application"
  on public.eb_applications for select to authenticated
  using (auth.uid() = applicant_id);

create policy "Admins can view all EB applications"
  on public.eb_applications for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- A member's profile becomes visible immediately; administrators retain removal powers.
create policy "Users can publish their own EB profile"
  on public.eb_applications for insert to authenticated
  with check (applicant_id = (select auth.uid()) and status = 'approved' and removed_at is null);

create policy "Users can update their own EB profile"
  on public.eb_applications for update to authenticated
  using (applicant_id = (select auth.uid()) and status = 'approved' and removed_at is null)
  with check (applicant_id = (select auth.uid()) and status = 'approved' and removed_at is null);

create policy "Only admins can update EB application status"
  on public.eb_applications for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create index eb_applications_status_idx on public.eb_applications (status);
create unique index eb_applications_one_live_profile_per_member_idx
  on public.eb_applications (applicant_id) where removed_at is null and status = 'approved';

-- 8. Research Library ----------------------------------------------------------
create type public.research_status as enum ('pending', 'approved', 'rejected');

create table public.research_papers (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  submitted_by_email text not null,
  author_name text not null,
  title text not null,
  committee text not null,
  document_type text not null default 'Background Guide',
  agenda text not null,
  summary text not null,
  full_text text not null,
  status public.research_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.research_papers enable row level security;

create policy "Approved research is viewable by everyone signed in"
  on public.research_papers for select to authenticated
  using (status = 'approved');

create policy "Submitters can view their own research"
  on public.research_papers for select to authenticated
  using (auth.uid() = submitted_by);

create policy "Admins can view all research"
  on public.research_papers for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Signed-in users can submit research as pending"
  on public.research_papers for insert to authenticated
  with check (auth.uid() = submitted_by and status = 'pending');

create policy "Only admins can update research status"
  on public.research_papers for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create index research_papers_status_idx on public.research_papers (status);

-- Upvotes as a separate table (one row per user per paper) rather than a
-- counter column, so RLS can enforce "one vote per person" and toggling is
-- just insert/delete rather than a racy increment.
create table public.research_upvotes (
  paper_id uuid not null references public.research_papers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (paper_id, user_id)
);

alter table public.research_upvotes enable row level security;

create policy "Upvotes are viewable by everyone signed in"
  on public.research_upvotes for select to authenticated
  using (true);

create policy "Users can upvote approved research once"
  on public.research_upvotes for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.research_papers where id = paper_id and status = 'approved')
  );

create policy "Users can remove their own upvote"
  on public.research_upvotes for delete to authenticated
  using (auth.uid() = user_id);

-- 9. Custom marksheet columns --------------------------------------------------
-- Lets chairs add/rename/remove scoring columns per committee instead of being
-- locked to a fixed set. Scores for these columns are stored as a JSONB map
-- on marks.custom_scores, keyed by this table's `key`.
create table public.marksheet_columns (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  key text not null,
  label text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (committee_id, key)
);

alter table public.marksheet_columns enable row level security;

create policy "Members can view marksheet columns"
  on public.marksheet_columns for select to authenticated
  using (public.can_access_committee(committee_id));

create policy "Members can add marksheet columns"
  on public.marksheet_columns for insert to authenticated
  with check (public.can_access_committee(committee_id));

create policy "Members can rename marksheet columns"
  on public.marksheet_columns for update to authenticated
  using (public.can_access_committee(committee_id))
  with check (public.can_access_committee(committee_id));

create policy "Members can remove marksheet columns"
  on public.marksheet_columns for delete to authenticated
  using (public.can_access_committee(committee_id));

alter table public.marks add column if not exists custom_scores jsonb not null default '{}'::jsonb;

-- Creates a complete committee in one transaction. SECURITY INVOKER preserves
-- every table's RLS policy while avoiding INSERT ... RETURNING visibility races.
create or replace function public.create_committee_with_defaults(
  p_name text,
  p_code text,
  p_conference_name text default null,
  p_use_default boolean default true
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  requester_id uuid := (select auth.uid());
  requester_email text := (select auth.jwt() ->> 'email');
  new_committee_id uuid := gen_random_uuid();
begin
  if requester_id is null or requester_email is null then
    raise exception 'Authentication required';
  end if;
  if nullif(btrim(p_name), '') is null or nullif(btrim(p_code), '') is null then
    raise exception 'Committee name and code are required';
  end if;

  insert into public.committees (id, name, code, conference_name, created_by)
  values (new_committee_id, btrim(p_name), upper(btrim(p_code)), nullif(btrim(p_conference_name), ''), requester_id);
  insert into public.committee_members (committee_id, user_id, email, role)
  values (new_committee_id, requester_id, requester_email, 'chair');

  if p_use_default then
    insert into public.marksheet_columns (committee_id, key, label, position) values
      (new_committee_id, 'gsl', 'GSL (10)', 0),
      (new_committee_id, 'mod_1', 'MOD 1 (10)', 1),
      (new_committee_id, 'mod_2', 'MOD 2 (10)', 2),
      (new_committee_id, 'verbal_poi_reply', 'Verbal POI + Reply (10)', 3),
      (new_committee_id, 'poi_chit', 'POI Chit (10)', 4),
      (new_committee_id, 'reply_chit', 'Reply Chit (5)', 5),
      (new_committee_id, 'substantive_chit', 'Substantive Chit (10)', 6),
      (new_committee_id, 'documentation', 'Documentation (10)', 7),
      (new_committee_id, 'decorum', 'Decorum (10)', 8);
  else
    insert into public.marksheet_columns (committee_id, key, label, position) values
      (new_committee_id, 'poi', 'POI', 0),
      (new_committee_id, 'chits', 'Chits', 1),
      (new_committee_id, 'verbal_reply', 'Verbal Reply', 2),
      (new_committee_id, 'gsl', 'GSL', 3),
      (new_committee_id, 'mod', 'MOD', 4),
      (new_committee_id, 'decorum', 'Decorum', 5),
      (new_committee_id, 'research', 'Research', 6),
      (new_committee_id, 'documentation', 'Documentation', 7);
  end if;
  return new_committee_id;
end;
$$;

revoke all on function public.create_committee_with_defaults(text,text,text,boolean) from public, anon;
grant execute on function public.create_committee_with_defaults(text,text,text,boolean) to authenticated;

-- Public marketplace media. Only files referenced by an active approved profile
-- can be read without signing in; uploads remain protected by owner policies.
create policy "Guests can view approved EB profile photos"
  on storage.objects for select to anon
  using (
    bucket_id = 'eb-profiles'
    and exists (
      select 1 from public.eb_applications
      where eb_applications.status = 'approved'
        and eb_applications.removed_at is null
        and eb_applications.photo_path = objects.name
    )
  );

create policy "Guests can view approved EB CVs"
  on storage.objects for select to anon
  using (
    bucket_id = 'eb-documents'
    and exists (
      select 1 from public.eb_applications
      where eb_applications.status = 'approved'
        and eb_applications.removed_at is null
        and eb_applications.cv_path = objects.name
    )
  );
