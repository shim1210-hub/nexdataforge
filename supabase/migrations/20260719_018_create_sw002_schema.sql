create table sw002_users (
  id bigint generated always as identity,
  auth_user_id uuid,
  email varchar(200),
  password_hash text,
  nickname varchar(100),
  phone varchar(50),
  role varchar(30) default 'CUSTOMER',
  status varchar(30) default 'ACTIVE',
  notification_consent boolean default false,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sw002_stores (
  id bigint generated always as identity,
  name varchar(200),
  business_number varchar(30),
  category varchar(50),
  description text,
  phone varchar(50),
  address text,
  address_detail text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  opening_hours jsonb default '{}'::jsonb,
  status varchar(30) default 'PENDING',
  is_map_visible boolean default false,
  approved_by bigint,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sw002_store_members (
  store_id bigint,
  user_id bigint,
  member_role varchar(30) default 'MANAGER',
  is_active boolean default true,
  joined_at timestamptz default now(),
  created_at timestamptz default now()
);

create table sw002_menus (
  id bigint generated always as identity,
  store_id bigint,
  name varchar(200),
  description text,
  category varchar(100),
  price integer,
  image_url text,
  is_main boolean default false,
  is_visible boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sw002_events (
  id bigint generated always as identity,
  store_id bigint,
  title varchar(300),
  description text,
  event_type varchar(30),
  map_icon varchar(30) default 'HOT',
  start_at timestamptz,
  end_at timestamptz,
  priority integer default 0,
  is_paid_promotion boolean default false,
  status varchar(30) default 'DRAFT',
  view_count bigint default 0,
  created_by bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sw002_coupons (
  id bigint generated always as identity,
  store_id bigint,
  event_id bigint,
  name varchar(300),
  description text,
  discount_type varchar(30),
  discount_value integer default 0,
  minimum_order_amount integer default 0,
  usage_instructions text,
  start_at timestamptz,
  end_at timestamptz,
  total_quantity integer,
  issued_quantity integer default 0,
  used_quantity integer default 0,
  per_user_limit integer default 1,
  status varchar(30) default 'DRAFT',
  created_by bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sw002_user_coupons (
  id bigint generated always as identity,
  coupon_id bigint,
  user_id bigint,
  coupon_code varchar(100),
  status varchar(30) default 'AVAILABLE',
  downloaded_at timestamptz default now(),
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sw002_favorite_stores (
  user_id bigint,
  store_id bigint,
  created_at timestamptz default now()
);

create table sw002_user_preferences (
  user_id bigint,
  radius_meters integer default 1000,
  preferred_categories text[] default '{}'::text[],
  preferred_event_types text[] default '{}'::text[],
  push_enabled boolean default true,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sw002_push_messages (
  id bigint generated always as identity,
  store_id bigint,
  title varchar(200),
  body text,
  target_type varchar(30) default 'ALL',
  target_config jsonb default '{}'::jsonb,
  status varchar(30) default 'DRAFT',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sw002_push_logs (
  id bigint generated always as identity,
  push_message_id bigint,
  user_id bigint,
  status varchar(30) default 'PENDING',
  provider_message_id varchar(300),
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz default now()
);

create table sw002_store_views (
  id bigint generated always as identity,
  store_id bigint,
  event_id bigint,
  user_id bigint,
  anonymous_session_id varchar(200),
  view_type varchar(30),
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  viewed_at timestamptz default now()
);

create table sw002_assets (
  id bigint generated always as identity,
  store_id bigint,
  uploaded_by bigint,
  asset_type varchar(30),
  storage_provider varchar(30) default 'LOCAL',
  storage_path text,
  original_name varchar(500),
  mime_type varchar(200),
  size_bytes bigint,
  alt_text varchar(500),
  is_active boolean default true,
  created_at timestamptz default now()
);
