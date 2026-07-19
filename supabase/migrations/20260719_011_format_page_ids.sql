begin;

lock table pages in exclusive mode;

create temporary table page_id_format_map on commit drop as
select id as old_id,
       'PG-' || row_number() over (order by created_at nulls last, id)::text as new_id
from pages;

alter table pages alter column id drop default;
alter table pages alter column id type text using id::text;

update pages p
set id = m.new_id
from page_id_format_map m
where p.id = m.old_id::text;

alter table pages alter column id type varchar(22);
alter table pages add constraint pages_id_format_check check (id ~ '^PG-[1-9][0-9]*$');

create sequence if not exists page_id_sequence start with 1 minvalue 1;
select setval(
  'page_id_sequence',
  coalesce((select max(substring(id from 4)::bigint) from pages), 1),
  (select count(*) > 0 from pages)
);

create or replace function next_page_id()
returns varchar(22)
language sql
as $$
  select ('PG-' || nextval('page_id_sequence')::text)::varchar(22);
$$;

alter table pages alter column id set default next_page_id();
grant usage, select on sequence page_id_sequence to authenticated, service_role;

commit;
