begin;

lock table generation_jobs in exclusive mode;
lock table generated_files in exclusive mode;

create temporary table generation_job_id_simple_map on commit drop as
select id as old_id,
       'GE-' || substring(id from 4)::bigint::text as new_id
from generation_jobs;

alter table generation_jobs alter column id drop default;
alter table generation_jobs drop constraint if exists generation_jobs_id_format_check;

update generated_files c
set generation_job_id = m.new_id
from generation_job_id_simple_map m
where c.generation_job_id = m.old_id;

update generation_jobs j
set id = m.new_id
from generation_job_id_simple_map m
where j.id = m.old_id;

alter table generation_jobs alter column id type varchar(22);
alter table generated_files alter column generation_job_id type varchar(22);

alter table generation_jobs
  add constraint generation_jobs_id_format_check
  check (id ~ '^GE-[1-9][0-9]*$');

alter sequence generation_job_id_sequence no maxvalue;
select setval(
  'generation_job_id_sequence',
  coalesce((select max(substring(id from 4)::bigint) from generation_jobs), 1),
  (select count(*) > 0 from generation_jobs)
);

create or replace function next_generation_job_id()
returns varchar(22)
language sql
as $$
  select ('GE-' || nextval('generation_job_id_sequence')::text)::varchar(22);
$$;

alter table generation_jobs alter column id set default next_generation_job_id();

commit;
