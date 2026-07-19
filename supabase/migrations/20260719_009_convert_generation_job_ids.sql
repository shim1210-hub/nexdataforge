begin;

lock table generation_jobs in exclusive mode;
lock table generated_files in exclusive mode;

create temporary table generation_job_id_migration_map on commit drop as
select id as old_id,
       'GE-' || lpad(row_number() over (order by created_at nulls last, id)::text, 6, '0') as new_id
from generation_jobs;

alter table generation_jobs alter column id drop default;

alter table generated_files alter column generation_job_id type text using generation_job_id::text;
alter table generation_jobs alter column id type text using id::text;

update generated_files c
set generation_job_id = m.new_id
from generation_job_id_migration_map m
where c.generation_job_id = m.old_id::text;

update generation_jobs c
set id = m.new_id
from generation_job_id_migration_map m
where c.id = m.old_id::text;

alter table generation_jobs alter column id type varchar(9);
alter table generated_files alter column generation_job_id type varchar(9);

alter table generation_jobs
  add constraint generation_jobs_id_format_check
  check (id ~ '^GE-[0-9]{6}$');

create sequence if not exists generation_job_id_sequence start with 1 minvalue 1 maxvalue 999999;
select setval(
  'generation_job_id_sequence',
  coalesce((select max(substring(id from 4)::integer) from generation_jobs), 1),
  (select count(*) > 0 from generation_jobs)
);

create or replace function next_generation_job_id()
returns varchar(9)
language plpgsql
as $$
declare
  next_number bigint := nextval('generation_job_id_sequence');
begin
  if next_number > 999999 then raise exception '생성 작업 ID를 999999개보다 많이 생성할 수 없습니다.'; end if;
  return 'GE-' || lpad(next_number::text, 6, '0');
end;
$$;

alter table generation_jobs alter column id set default next_generation_job_id();
grant usage, select on sequence generation_job_id_sequence to authenticated, service_role;

commit;
