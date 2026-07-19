begin;
create unique index if not exists boards_site_name_uq on boards (site_id, name);
create unique index if not exists boards_site_code_uq on boards (site_id, code);
create index if not exists board_posts_site_created_idx on board_posts (site_id, created_at desc);
commit;
