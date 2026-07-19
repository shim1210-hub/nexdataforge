begin;

lock table main_sections in exclusive mode;

create temporary table main_section_id_format_map on commit drop as
select id as old_id,
       'MS-' || row_number() over (order by created_at nulls last, id)::text as new_id
from main_sections;

alter table main_sections alter column id drop default;
alter table main_sections alter column id type text using id::text;

update main_sections s
set id = m.new_id
from main_section_id_format_map m
where s.id = m.old_id::text;

alter table main_sections alter column id type varchar(22);
alter table main_sections add constraint main_sections_id_format_check check (id ~ '^MS-[1-9][0-9]*$');

create sequence if not exists main_section_id_sequence start with 1 minvalue 1;
select setval(
  'main_section_id_sequence',
  coalesce((select max(substring(id from 4)::bigint) from main_sections), 1),
  (select count(*) > 0 from main_sections)
);

create or replace function next_main_section_id()
returns varchar(22)
language sql
as $$
  select ('MS-' || nextval('main_section_id_sequence')::text)::varchar(22);
$$;

alter table main_sections alter column id set default next_main_section_id();
grant usage, select on sequence main_section_id_sequence to authenticated, service_role;

commit;
