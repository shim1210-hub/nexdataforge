alter table profiles add column if not exists login_id varchar(100);
alter table profiles add column if not exists company_slug varchar(100);
alter table profiles add column if not exists access_level varchar(30) default 'SITE_USER';
alter table profiles add column if not exists password_hash text;

create unique index if not exists profiles_login_id_uq on profiles (login_id) where login_id is not null;
create index if not exists profiles_company_slug_idx on profiles (company_slug) where company_slug is not null;

comment on column profiles.login_id is '사용자 로그인 아이디';
comment on column profiles.company_slug is '사이트사용자 담당 업체 영문명';
comment on column profiles.access_level is '권한 구분: SUPER_ADMIN 또는 SITE_USER';
comment on column profiles.password_hash is 'salt가 포함된 단방향 비밀번호 해시';

grant select, insert, update, delete on profiles to authenticated, service_role;
