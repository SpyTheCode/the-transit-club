-- The Transit Club schema for Supabase.
-- Run in Supabase Dashboard > SQL Editor as the project owner.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  role text not null default 'member'
    check (role in ('admin', 'sub_admin', 'member')),
  permissions jsonb not null default '{}'::jsonb
    check (jsonb_typeof(permissions) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  start_date timestamptz not null,
  end_date timestamptz not null,
  destination text not null,
  status text not null default 'upcoming_view_only'
    check (status in (
      'upcoming_view_only',
      'open_for_payment',
      'closed'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_valid_date_range check (end_date >= start_date)
);

create table if not exists public.fee_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  label text not null,
  amount bigint not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete restrict,
  event_id uuid not null references public.events (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  subtotal bigint not null check (subtotal >= 0),
  processing_fee bigint not null check (processing_fee >= 0),
  total bigint not null check (total = subtotal + processing_fee),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  paystack_reference text not null unique
    check (length(btrim(paystack_reference)) > 0),
  amount bigint not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed', 'abandoned', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references public.attendees (id) on delete cascade,
  ticket_code text not null unique
    check (length(btrim(ticket_code)) > 0),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists fee_items_event_id_idx
  on public.fee_items (event_id);
create index if not exists orders_buyer_id_created_at_idx
  on public.orders (buyer_id, created_at desc);
create index if not exists orders_event_id_idx
  on public.orders (event_id);
create index if not exists attendees_order_id_idx
  on public.attendees (order_id);
create index if not exists payments_order_id_idx
  on public.payments (order_id);
create index if not exists tickets_attendee_id_idx
  on public.tickets (attendee_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    lower(new.email)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.promote_member_to_sub_admin(
  target_profile_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Only an authenticated admin can promote members'
      using errcode = '42501';
  end if;

  update public.profiles
  set role = 'sub_admin'
  where id = target_profile_id
    and role = 'member';

  if not found then
    raise exception 'Profile not found or is not a member'
      using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.promote_member_to_sub_admin(uuid)
  from public, anon;
grant execute on function public.promote_member_to_sub_admin(uuid)
  to authenticated;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.fee_items enable row level security;
alter table public.orders enable row level security;
alter table public.attendees enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Events are publicly readable" on public.events;
create policy "Events are publicly readable"
  on public.events for select to anon, authenticated
  using (true);

drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events"
  on public.events for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events"
  on public.events for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
  on public.events for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Fee items are publicly readable" on public.fee_items;
create policy "Fee items are publicly readable"
  on public.fee_items for select to anon, authenticated
  using (true);

drop policy if exists "Admins can insert fee items" on public.fee_items;
create policy "Admins can insert fee items"
  on public.fee_items for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update fee items" on public.fee_items;
create policy "Admins can update fee items"
  on public.fee_items for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete fee items" on public.fee_items;
create policy "Admins can delete fee items"
  on public.fee_items for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Buyers can read their own orders" on public.orders;
create policy "Buyers can read their own orders"
  on public.orders for select to authenticated
  using (buyer_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Buyers can read attendees on their orders" on public.attendees;
create policy "Buyers can read attendees on their orders"
  on public.attendees for select to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = attendees.order_id
        and (orders.buyer_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

drop policy if exists "Buyers can read payments on their orders" on public.payments;
create policy "Buyers can read payments on their orders"
  on public.payments for select to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = payments.order_id
        and (orders.buyer_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

drop policy if exists "Buyers can read tickets for their orders" on public.tickets;
create policy "Buyers can read tickets for their orders"
  on public.tickets for select to authenticated
  using (
    exists (
      select 1
      from public.attendees
      join public.orders on orders.id = attendees.order_id
      where attendees.id = tickets.attendee_id
        and (orders.buyer_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

revoke all on table
  public.profiles,
  public.events,
  public.fee_items,
  public.orders,
  public.attendees,
  public.payments,
  public.tickets
from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.events, public.fee_items to anon, authenticated;
grant insert, update, delete on table public.events, public.fee_items
  to authenticated;
grant select on table
  public.orders,
  public.attendees,
  public.payments,
  public.tickets
to authenticated;
grant all on table
  public.profiles,
  public.events,
  public.fee_items,
  public.orders,
  public.attendees,
  public.payments,
  public.tickets
to service_role;

-- Bootstrap the admin only when the matching Supabase Auth email is verified.
-- If the account does not exist yet, this block emits a notice; sign up, verify
-- the email, then run this block again.
do $$
declare
  admin_user auth.users%rowtype;
begin
  select *
  into admin_user
  from auth.users
  where lower(email) = lower('Viamalak.com@gmail.com')
    and email_confirmed_at is not null
  limit 1;

  if admin_user.id is null then
    raise notice
      'Admin not seeded: create and verify Viamalak.com@gmail.com in Supabase Auth, then rerun this DO block.';
  else
    insert into public.profiles (id, email, role)
    values (admin_user.id, lower(admin_user.email), 'admin')
    on conflict (id) do update
      set email = excluded.email,
          role = 'admin';
  end if;
end;
$$;
