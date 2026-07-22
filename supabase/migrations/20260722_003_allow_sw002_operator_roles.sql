-- The original database constraint only allowed customer roles.
-- SW_002 also uses dedicated operator accounts.
alter table sw002_users drop constraint if exists sw002_users_role_check;

alter table sw002_users
  add constraint sw002_users_role_check
  check (role in ('CUSTOMER', 'STORE_MANAGER', 'ADMIN'));
