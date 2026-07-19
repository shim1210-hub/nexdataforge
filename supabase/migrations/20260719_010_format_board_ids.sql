begin;

lock table boards in exclusive mode;
lock table menus in exclusive mode;
lock table board_posts in exclusive mode;

create temporary table board_id_format_map on commit drop as
select id as old_id,
       'BBS-' || lpad(row_number() over (order by id)::text, 7, '0') as new_id
from boards;

alter table menus drop constraint if exists menus_board_id_fkey;
alter table boards alter column id drop identity if exists;
alter table boards alter column id drop default;

alter table menus alter column board_id type text using board_id::text;
alter table board_posts alter column board_id type text using board_id::text;
alter table boards alter column id type text using id::text;

update menus c set board_id = m.new_id from board_id_format_map m where c.board_id = m.old_id::text;
update board_posts c set board_id = m.new_id from board_id_format_map m where c.board_id = m.old_id::text;
update boards b set id = m.new_id from board_id_format_map m where b.id = m.old_id::text;

alter table boards alter column id type varchar(11);
alter table menus alter column board_id type varchar(11);
alter table board_posts alter column board_id type varchar(11);

alter table boards add constraint boards_id_format_check check (id ~ '^BBS-[0-9]{7}$');

create sequence if not exists board_id_sequence start with 1 minvalue 1 maxvalue 9999999;
select setval(
  'board_id_sequence',
  coalesce((select max(substring(id from 5)::integer) from boards), 1),
  (select count(*) > 0 from boards)
);

create or replace function next_board_id()
returns varchar(11)
language plpgsql
as $$
declare
  next_number bigint := nextval('board_id_sequence');
begin
  if next_number > 9999999 then raise exception '게시판 ID를 9999999개보다 많이 생성할 수 없습니다.'; end if;
  return 'BBS-' || lpad(next_number::text, 7, '0');
end;
$$;

alter table boards alter column id set default next_board_id();
grant usage, select on sequence board_id_sequence to authenticated, service_role;

alter table menus
  add constraint menus_board_id_fkey
  foreign key (board_id) references boards(id) on delete set null;

commit;
