begin;

lock table boards in exclusive mode;
lock table menus in exclusive mode;
lock table board_posts in exclusive mode;

create temporary table board_id_simple_map on commit drop as
select id as old_id,
       'BBS-' || substring(id from 5)::bigint::text as new_id
from boards;

alter table menus drop constraint if exists menus_board_id_fkey;
alter table boards alter column id drop default;
alter table boards drop constraint if exists boards_id_format_check;

update menus c set board_id = m.new_id from board_id_simple_map m where c.board_id = m.old_id;
update board_posts c set board_id = m.new_id from board_id_simple_map m where c.board_id = m.old_id;
update boards b set id = m.new_id from board_id_simple_map m where b.id = m.old_id;

alter table boards add constraint boards_id_format_check check (id ~ '^BBS-[1-9][0-9]*$');

create or replace function next_board_id()
returns varchar(11)
language plpgsql
as $$
declare
  next_number bigint := nextval('board_id_sequence');
begin
  if next_number > 9999999 then raise exception '게시판 ID를 9999999개보다 많이 생성할 수 없습니다.'; end if;
  return 'BBS-' || next_number::text;
end;
$$;

alter table boards alter column id set default next_board_id();

alter table menus
  add constraint menus_board_id_fkey
  foreign key (board_id) references boards(id) on delete set null;

commit;
