-- Set the SW_002 platform administrator password to "1".
-- The password uses the same scrypt format as the application.
alter table sw002_users drop constraint if exists sw002_users_role_check;
alter table sw002_users add constraint sw002_users_role_check
  check (role in ('CUSTOMER', 'STORE_MANAGER', 'ADMIN'));

do $$
begin
  update sw002_users
     set password_hash = 'eb416f30e399b4fd1c532eda80ffb16f:eb07502a7589135763994198f7b71f835b3b6ab05ca49aebf85bdad342e30745549a016426e4542e62c69d47d7956ebf6dba4caf9bd3f07aff9c53ed9395b9dd',
         role = 'ADMIN',
         status = 'ACTIVE',
         updated_at = now()
   where lower(email) = 'admin@naver.com';

  if not found then
    insert into sw002_users (email, password_hash, nickname, role, status)
    values (
      'admin@naver.com',
      'eb416f30e399b4fd1c532eda80ffb16f:eb07502a7589135763994198f7b71f835b3b6ab05ca49aebf85bdad342e30745549a016426e4542e62c69d47d7956ebf6dba4caf9bd3f07aff9c53ed9395b9dd',
      'Platform Admin',
      'ADMIN',
      'ACTIVE'
    );
  end if;
end $$;
