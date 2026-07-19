begin;

lock table profiles in exclusive mode;

create temporary table profile_id_usr_map on commit drop as
select id as old_id,
       'USR-' || row_number() over (order by id)::text as new_id
from profiles;

alter table profiles alter column id drop default;
alter table profiles drop constraint if exists profiles_id_format_check;

update sites c set created_by = m.new_id from profile_id_usr_map m where c.created_by = m.old_id;
update site_templates c set selected_by = m.new_id from profile_id_usr_map m where c.selected_by = m.old_id;
update assets c set uploaded_by = m.new_id from profile_id_usr_map m where c.uploaded_by = m.old_id;
update pages c set created_by = m.new_id from profile_id_usr_map m where c.created_by = m.old_id;
update pages c set updated_by = m.new_id from profile_id_usr_map m where c.updated_by = m.old_id;
update board_posts c set author_id = m.new_id from profile_id_usr_map m where c.author_id = m.old_id;
update generation_jobs c set requested_by = m.new_id from profile_id_usr_map m where c.requested_by = m.old_id;
update profiles p set id = m.new_id from profile_id_usr_map m where p.id = m.old_id;

alter table profiles alter column id type varchar(22);
alter table sites alter column created_by type varchar(22);
alter table site_templates alter column selected_by type varchar(22);
alter table assets alter column uploaded_by type varchar(22);
alter table pages alter column created_by type varchar(22);
alter table pages alter column updated_by type varchar(22);
alter table board_posts alter column author_id type varchar(22);
alter table generation_jobs alter column requested_by type varchar(22);

alter table profiles add constraint profiles_id_format_check check (id ~ '^USR-[1-9][0-9]*$');

alter sequence profile_id_sequence no maxvalue;
select setval(
  'profile_id_sequence',
  coalesce((select max(substring(id from 5)::bigint) from profiles), 1),
  (select count(*) > 0 from profiles)
);

create or replace function next_profile_id()
returns varchar(22)
language sql
as $$
  select ('USR-' || nextval('profile_id_sequence')::text)::varchar(22);
$$;

alter table profiles alter column id set default next_profile_id();

commit;
