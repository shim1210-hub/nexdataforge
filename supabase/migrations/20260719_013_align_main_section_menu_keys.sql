update main_sections s
set section_type = 'MENU_' || m.id::text
from menus m
where s.site_id = m.site_id
  and s.title = m.name
  and m.parent_id is null
  and s.section_type like 'MENU_%';
