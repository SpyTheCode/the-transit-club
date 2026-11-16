-- Archive and community waitlist tables.
-- Run after supabase/schema.sql so public.is_admin() and public.events exist.

create table if not exists public.archive_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  kind text not null
    check (kind in ('lookbook', 'zine', 'moodboard', 'retreat')),
  caption text not null default '',
  image_path text,
  image_kind text
    check (image_kind is null or image_kind in ('storage', 'static')),
  alt_text text not null default '',
  year integer,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archive_items_title_not_empty check (length(btrim(title)) > 0),
  constraint archive_items_slug_not_empty check (length(btrim(slug)) > 0),
  constraint archive_items_image_pair check (
    (image_path is null and image_kind is null)
    or (image_path is not null and image_kind is not null)
  ),
  constraint archive_items_image_path_not_empty check (
    image_path is null or length(btrim(image_path)) > 0
  )
);

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  event_id uuid references public.events (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint waitlist_first_name_length check (
    length(btrim(first_name)) between 1 and 80
  ),
  constraint waitlist_last_name_length check (
    length(btrim(last_name)) between 1 and 80
  ),
  constraint waitlist_email_length check (
    length(btrim(email)) between 3 and 254
  ),
  constraint waitlist_email_format check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

create index if not exists archive_items_public_sort_idx
  on public.archive_items (published, sort_order, created_at desc);
create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at desc);

create unique index if not exists waitlist_email_per_event_unique_idx
  on public.waitlist_entries (lower(email), event_id)
  where event_id is not null;
create unique index if not exists waitlist_email_without_event_unique_idx
  on public.waitlist_entries (lower(email))
  where event_id is null;

drop trigger if exists archive_items_set_updated_at on public.archive_items;
create trigger archive_items_set_updated_at
  before update on public.archive_items
  for each row execute function public.set_updated_at();

alter table public.archive_items enable row level security;
alter table public.waitlist_entries enable row level security;

drop policy if exists "Published archive items are publicly readable"
  on public.archive_items;
create policy "Published archive items are publicly readable"
  on public.archive_items for select to anon, authenticated
  using (published);

drop policy if exists "Admins can read all archive items"
  on public.archive_items;
create policy "Admins can read all archive items"
  on public.archive_items for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can insert archive items"
  on public.archive_items;
create policy "Admins can insert archive items"
  on public.archive_items for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update archive items"
  on public.archive_items;
create policy "Admins can update archive items"
  on public.archive_items for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete archive items"
  on public.archive_items;
create policy "Admins can delete archive items"
  on public.archive_items for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can read waitlist entries"
  on public.waitlist_entries;
create policy "Admins can read waitlist entries"
  on public.waitlist_entries for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Anyone can join the waitlist"
  on public.waitlist_entries;
create policy "Anyone can join the waitlist"
  on public.waitlist_entries for insert to anon, authenticated
  with check (true);

drop policy if exists "Admins can update waitlist entries"
  on public.waitlist_entries;
create policy "Admins can update waitlist entries"
  on public.waitlist_entries for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete waitlist entries"
  on public.waitlist_entries;
create policy "Admins can delete waitlist entries"
  on public.waitlist_entries for delete to authenticated
  using ((select public.is_admin()));

revoke all on table public.archive_items, public.waitlist_entries
  from anon, authenticated;

grant select on table public.archive_items to anon, authenticated;
grant insert, update, delete on table public.archive_items to authenticated;

grant insert (first_name, last_name, email, event_id)
  on table public.waitlist_entries to anon, authenticated;
grant select, update, delete on table public.waitlist_entries to authenticated;

grant all on table public.archive_items, public.waitlist_entries
  to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'archive-images',
  'archive-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Archive images are publicly readable"
  on storage.objects;
create policy "Archive images are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'archive-images');

drop policy if exists "Admins can upload archive images"
  on storage.objects;
create policy "Admins can upload archive images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'archive-images'
    and (select public.is_admin())
  );

drop policy if exists "Admins can delete archive images"
  on storage.objects;
create policy "Admins can delete archive images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'archive-images'
    and (select public.is_admin())
  );

drop policy if exists "Admins can update archive images"
  on storage.objects;
create policy "Admins can update archive images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'archive-images'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'archive-images'
    and (select public.is_admin())
  );
