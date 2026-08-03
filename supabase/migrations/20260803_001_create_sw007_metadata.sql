begin;
create table if not exists meta_word (
  word_id text primary key, kor_name varchar(100) not null, eng_name varchar(100) not null,
  abbrev varchar(50) not null unique, description text, use_yn char(1) not null default 'Y' check (use_yn in ('Y','N')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists meta_domain (
  domain_id text primary key, domain_name varchar(100) not null, kor_name varchar(100) not null,
  physical_name varchar(100) not null, data_type varchar(30) not null, length integer, precision integer, scale integer,
  nullable_yn char(1) not null default 'Y', default_value text, description text, use_yn char(1) not null default 'Y' check (use_yn in ('Y','N')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists meta_change_his (
  history_id bigserial primary key, target_type varchar(20) not null, target_id text not null, change_type varchar(20) not null,
  before_value jsonb, after_value jsonb, reason text, changed_by varchar(100), changed_at timestamptz not null default now()
);
commit;
