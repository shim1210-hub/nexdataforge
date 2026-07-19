begin;

lock table generated_files in exclusive mode;

create temporary table generated_file_id_format_map on commit drop as
select id as old_id,
       'GEF-' || row_number() over (order by created_at nulls last, id)::text as new_id
from generated_files;

alter table generated_files alter column id drop default;
alter table generated_files alter column id type text using id::text;

update generated_files f
set id = m.new_id
from generated_file_id_format_map m
where f.id = m.old_id::text;

alter table generated_files alter column id type varchar(22);
alter table generated_files
  add constraint generated_files_id_format_check
  check (id ~ '^GEF-[1-9][0-9]*$');

create sequence if not exists generated_file_id_sequence start with 1 minvalue 1;
select setval(
  'generated_file_id_sequence',
  coalesce((select max(substring(id from 5)::bigint) from generated_files), 1),
  (select count(*) > 0 from generated_files)
);

create or replace function next_generated_file_id()
returns varchar(22)
language sql
as $$
  select ('GEF-' || nextval('generated_file_id_sequence')::text)::varchar(22);
$$;

alter table generated_files alter column id set default next_generated_file_id();
grant usage, select on sequence generated_file_id_sequence to authenticated, service_role;

commit;
