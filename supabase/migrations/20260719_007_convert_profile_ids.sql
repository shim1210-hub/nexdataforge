begin;

lock table profiles in exclusive mode;

create temporary table profile_id_migration_map on commit drop as
select id as old_id,
       lpad(row_number() over (order by created_at nulls last, id)::text, 5, '0') as new_id
from profiles;

alter table profiles alter column id drop default;

alter table sites alter column created_by type text using created_by::text;
alter table site_templates alter column selected_by type text using selected_by::text;
alter table assets alter column uploaded_by type text using uploaded_by::text;
alter table pages alter column created_by type text using created_by::text;
alter table pages alter column updated_by type text using updated_by::text;
alter table board_posts alter column author_id type text using author_id::text;
alter table generation_jobs alter column requested_by type text using requested_by::text;
alter table profiles alter column id type text using id::text;

update sites c set created_by = m.new_id from profile_id_migration_map m where c.created_by = m.old_id::text;
update site_templates c set selected_by = m.new_id from profile_id_migration_map m where c.selected_by = m.old_id::text;
update assets c set uploaded_by = m.new_id from profile_id_migration_map m where c.uploaded_by = m.old_id::text;
update pages c set created_by = m.new_id from profile_id_migration_map m where c.created_by = m.old_id::text;
update pages c set updated_by = m.new_id from profile_id_migration_map m where c.updated_by = m.old_id::text;
update board_posts c set author_id = m.new_id from profile_id_migration_map m where c.author_id = m.old_id::text;
update generation_jobs c set requested_by = m.new_id from profile_id_migration_map m where c.requested_by = m.old_id::text;
update profiles p set id = m.new_id from profile_id_migration_map m where p.id = m.old_id::text;

alter table profiles alter column id type varchar(5);
alter table sites alter column created_by type varchar(5);
alter table site_templates alter column selected_by type varchar(5);
alter table assets alter column uploaded_by type varchar(5);
alter table pages alter column created_by type varchar(5);
alter table pages alter column updated_by type varchar(5);
alter table board_posts alter column author_id type varchar(5);
alter table generation_jobs alter column requested_by type varchar(5);

alter table profiles add constraint profiles_id_format_check check (id ~ '^[0-9]{5}$');

create sequence if not exists profile_id_sequence start with 1 minvalue 1 maxvalue 99999;
select setval('profile_id_sequence', coalesce((select max(id::integer) from profiles), 1), (select count(*) > 0 from profiles));

create or replace function next_profile_id()
returns varchar(5)
language plpgsql
as $$
declare
  next_number bigint := nextval('profile_id_sequence');
begin
  if next_number > 99999 then raise exception '프로필 ID를 99999개보다 많이 생성할 수 없습니다.'; end if;
  return lpad(next_number::text, 5, '0');
end;
$$;

alter table profiles alter column id set default next_profile_id();
grant usage, select on sequence profile_id_sequence to authenticated, service_role;

commit;
