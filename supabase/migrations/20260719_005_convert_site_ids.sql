begin;

lock table sites in exclusive mode;

create temporary table site_id_migration_map on commit drop as
select id as old_id,
       (to_char(coalesce(created_at, now()), 'YYYYMMDD') ||
        lpad(row_number() over (
          partition by coalesce(created_at::date, current_date)
          order by created_at nulls last, id
        )::text, 4, '0'))::bigint as new_id
from sites;

alter table sites alter column id drop default;

alter table site_templates alter column site_id type text using site_id::text;
alter table menus alter column site_id type text using site_id::text;
alter table footers alter column site_id type text using site_id::text;
alter table main_sections alter column site_id type text using site_id::text;
alter table assets alter column site_id type text using site_id::text;
alter table pages alter column site_id type text using site_id::text;
alter table boards alter column site_id type text using site_id::text;
alter table board_posts alter column site_id type text using site_id::text;
alter table generation_jobs alter column site_id type text using site_id::text;
alter table generated_files alter column site_id type text using site_id::text;
alter table sites alter column id type text using id::text;

update site_templates c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update menus c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update footers c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update main_sections c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update assets c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update pages c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update boards c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update board_posts c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update generation_jobs c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update generated_files c set site_id = m.new_id::text from site_id_migration_map m where c.site_id = m.old_id::text;
update sites s set id = m.new_id::text from site_id_migration_map m where s.id = m.old_id::text;

alter table sites alter column id type bigint using id::bigint;
alter table site_templates alter column site_id type bigint using site_id::bigint;
alter table menus alter column site_id type bigint using site_id::bigint;
alter table footers alter column site_id type bigint using site_id::bigint;
alter table main_sections alter column site_id type bigint using site_id::bigint;
alter table assets alter column site_id type bigint using site_id::bigint;
alter table pages alter column site_id type bigint using site_id::bigint;
alter table boards alter column site_id type bigint using site_id::bigint;
alter table board_posts alter column site_id type bigint using site_id::bigint;
alter table generation_jobs alter column site_id type bigint using site_id::bigint;
alter table generated_files alter column site_id type bigint using site_id::bigint;

create or replace function next_site_id()
returns bigint
language plpgsql
as $$
declare
  day_prefix bigint := to_char(current_date, 'YYYYMMDD')::bigint * 10000;
  next_number integer;
begin
  perform pg_advisory_xact_lock(hashtext('sites_daily_id_' || current_date::text));
  select coalesce(max((id - day_prefix)::integer), 0) + 1
    into next_number
    from sites
   where id between day_prefix and day_prefix + 9999;
  if next_number > 9999 then raise exception '하루에 사이트 ID를 9999개보다 많이 생성할 수 없습니다.'; end if;
  return day_prefix + next_number;
end;
$$;

alter table sites alter column id set default next_site_id();

commit;
