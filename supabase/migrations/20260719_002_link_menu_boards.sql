begin;

alter table menus add column if not exists board_id varchar(11) references boards(id) on delete set null;
create index if not exists menus_board_id_idx on menus (board_id) where board_id is not null;

comment on column menus.board_id is '게시판 용도 중메뉴에 연결된 게시판 ID';

commit;
