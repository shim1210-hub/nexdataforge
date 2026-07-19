# SW_006 PostgreSQL 설정

Supabase Dashboard의 **SQL Editor → New query**에서 아래 파일 전체를 복사해 실행합니다.

`supabase/migrations/20260718_001_create_sw006_schema.sql`

스크립트의 범위는 다음과 같습니다.

- SW_006 테이블 20개 생성
- 각 테이블 Primary Key 생성
- 각 테이블과 모든 컬럼에 한글 설명 등록
- `authenticated`, `service_role`에 CRUD 권한 부여
- Identity 컬럼의 Sequence 사용 권한 부여

외래 키, 인덱스, RLS, 트리거, CHECK/UNIQUE 제약조건과 초기 데이터는 포함하지 않았습니다. 기존 `public.dept`, `public.insa` 테이블은 변경하지 않습니다.

생성 결과 확인:

```sql
select tablename
from pg_catalog.pg_tables
where schemaname = 'public'
order by tablename;
```
