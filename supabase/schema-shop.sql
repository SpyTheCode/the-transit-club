-- MALAK product catalog schema.
-- Run after supabase/schema.sql in Supabase Dashboard > SQL Editor.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_empty check (length(btrim(name)) > 0),
  constraint categories_slug_not_empty check (length(btrim(slug)) > 0)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid not null references public.categories (id) on delete restrict,
  description text not null default '',
  specs jsonb not null default '[]'::jsonb,
  price_kobo bigint,
  status text not null default 'coming_soon'
    check (status in ('available', 'sold_out', 'coming_soon')),
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_not_empty check (length(btrim(name)) > 0),
  constraint products_slug_not_empty check (length(btrim(slug)) > 0),
  constraint products_price_nonnegative check (price_kobo is null or price_kobo >= 0),
  constraint products_specs_array check (jsonb_typeof(specs) = 'array')
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  kind text not null check (kind in ('storage', 'static')),
  path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_images_path_not_empty check (length(btrim(path)) > 0),
  constraint product_images_product_path_unique unique (product_id, path)
);

create index if not exists products_category_sort_order_idx
  on public.products (category_id, sort_order, name);
create index if not exists products_published_featured_sort_order_idx
  on public.products (published, featured desc, sort_order, name);
create index if not exists product_images_product_sort_order_idx
  on public.product_images (product_id, sort_order, id);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select to anon, authenticated
  using (true);

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Published products are publicly readable" on public.products;
create policy "Published products are publicly readable"
  on public.products for select to anon, authenticated
  using (published);

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
  on public.products for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Published product images are publicly readable"
  on public.product_images;
create policy "Published product images are publicly readable"
  on public.product_images for select to anon, authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = product_images.product_id
        and products.published
    )
  );

drop policy if exists "Admins can read all product images"
  on public.product_images;
create policy "Admins can read all product images"
  on public.product_images for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can insert product images"
  on public.product_images;
create policy "Admins can insert product images"
  on public.product_images for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update product images"
  on public.product_images;
create policy "Admins can update product images"
  on public.product_images for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete product images"
  on public.product_images;
create policy "Admins can delete product images"
  on public.product_images for delete to authenticated
  using ((select public.is_admin()));

revoke all on table
  public.categories,
  public.products,
  public.product_images
from anon, authenticated;

grant select on table
  public.categories,
  public.products,
  public.product_images
to anon, authenticated;

grant insert, update, delete on table
  public.categories,
  public.products,
  public.product_images
to authenticated;

grant all on table
  public.categories,
  public.products,
  public.product_images
to service_role;

insert into public.categories (name, slug, sort_order)
values
  ('Technical Headwear', 'technical-headwear', 10),
  ('Technical Outerwear and Apparel', 'technical-outerwear-and-apparel', 20),
  ('Everyday Carry', 'everyday-carry', 30),
  ('Heavy Textile Goods and Luggage', 'heavy-textile-goods-and-luggage', 40),
  ('Industrial Living Objects', 'industrial-living-objects', 50)
on conflict (slug) do nothing;

with starter_products (
  name,
  slug,
  category_slug,
  sort_order
) as (
  values
    ('Black Tee back', 'black-tee-back', 'technical-outerwear-and-apparel', 10),
    ('Black tee front', 'black-tee-front', 'technical-outerwear-and-apparel', 20),
    (
      'TTC MAP Trucket hat 1.0_20261105194220',
      'ttc-map-trucket-hat-1-0-20261105194220',
      'technical-headwear',
      30
    ),
    ('TTC TRUCKER HAT BLUE', 'ttc-trucker-hat-blue', 'technical-headwear', 40),
    ('TTC TRUCKER HAT GREEN', 'ttc-trucker-hat-green', 'technical-headwear', 50),
    ('TTC TRUCKER HAT RED', 'ttc-trucker-hat-red', 'technical-headwear', 60),
    ('White tee back', 'white-tee-back', 'technical-outerwear-and-apparel', 70),
    ('White tee front', 'white-tee-front', 'technical-outerwear-and-apparel', 80)
)
insert into public.products (
  name,
  slug,
  category_id,
  description,
  specs,
  price_kobo,
  status,
  featured,
  published,
  sort_order
)
select
  starter_products.name,
  starter_products.slug,
  categories.id,
  '',
  '[]'::jsonb,
  null,
  'available',
  false,
  true,
  starter_products.sort_order
from starter_products
join public.categories
  on categories.slug = starter_products.category_slug
on conflict (slug) do nothing;

with starter_images (product_slug, path, alt_text) as (
  values
    (
      'black-tee-back',
      '/images/Black Tee back.jpg',
      'Back view of the black Transit Club graphic tee'
    ),
    (
      'black-tee-front',
      '/images/Black tee front.jpg',
      'Front view of the black Transit Club graphic tee'
    ),
    (
      'ttc-map-trucket-hat-1-0-20261105194220',
      '/images/TTC MAP Trucket hat 1.0_20261105194220.jpg',
      'Map print Transit Club trucker hat'
    ),
    (
      'ttc-trucker-hat-blue',
      '/images/TTC TRUCKER HAT BLUE.jpg',
      'Blue Transit Club trucker hat'
    ),
    (
      'ttc-trucker-hat-green',
      '/images/TTC TRUCKER HAT GREEN.jpg',
      'Green Transit Club trucker hat'
    ),
    (
      'ttc-trucker-hat-red',
      '/images/TTC TRUCKER HAT RED.jpg',
      'Red Transit Club trucker hat'
    ),
    (
      'white-tee-back',
      '/images/White tee back.jpg',
      'Back view of the white Transit Club graphic tee'
    ),
    (
      'white-tee-front',
      '/images/White tee front .jpg',
      'Front view of the white Transit Club graphic tee'
    )
)
insert into public.product_images (
  product_id,
  kind,
  path,
  alt_text,
  sort_order
)
select
  products.id,
  'static',
  starter_images.path,
  starter_images.alt_text,
  10
from starter_images
join public.products
  on products.slug = starter_images.product_slug
on conflict (product_id, path) do nothing;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Product images are publicly readable"
  on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images"
  on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (select public.is_admin())
  );

drop policy if exists "Admins can delete product images from storage"
  on storage.objects;
create policy "Admins can delete product images from storage"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.is_admin())
  );

drop policy if exists "Admins can update product images in storage"
  on storage.objects;
create policy "Admins can update product images in storage"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'product-images'
    and (select public.is_admin())
  );
