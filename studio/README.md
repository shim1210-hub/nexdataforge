# NexDataForge Design Studio

NexDataForge Design Studio(이하 Studio)는 NexDataForge의 모든 서비스가 사용자 경험, UI/UX, AI UX, 화면 설계, 프로토타입, 프로젝트별 Design Book을 같은 기준으로 만들고 검토하기 위한 설계 공간이다.

## 왜 존재하는가

기능을 먼저 구현하는 대신 사용자가 무엇을 보고, 이해하고, 결정하고, 행동해야 하는지를 먼저 정의한다. Studio는 제품 기능을 대체하지 않으며, 구현 전에 경험의 방향과 판단 기준을 제공한다.

## 적용 범위

- 공통 Experience·UI/UX·AI UX 원칙
- 공통 Design System 초안
- 프로젝트별 사용자 흐름·화면 목록·화면 명세
- Mockup, Concept Board, UI Kit, Prototype의 상태와 버전
- Codex와 개발자가 참고할 수 있는 검토 체크리스트

## 구조

`design-book/`은 공통 철학과 원칙, `design-system/`은 토큰과 컴포넌트 기준, `projects/`는 프로젝트별 설계를 관리한다. `assets/`에는 실제 파일이 존재할 때만 시각 자료를 둔다.

실행 가능한 공용 자산과 Studio 및 운영 문서의 release boundary는 [`production-core.md`](./production-core.md)에 정의한다.

## 변경 원칙

문서 변경은 구현보다 먼저 목적과 영향 범위를 기록한다. 제품별 색상과 표현은 공통 원칙을 깨지 않는 범위에서 확장하며, 기존 SW_007 DB/API, meta 테이블, CRUD, Supabase 연결, 인증과 메인 페이지 동작은 변경하지 않는다.

## Mockup과 개발 명세

Mockup은 의도와 화면 관계를 보여주고, `screen-spec.md`는 개발 가능한 상태·오류·접근성·AI 동작을 명시한다. 둘이 충돌하면 화면 명세와 사용자 목표를 함께 재검토한다.

## Codex 참고 순서

1. 이 README와 프로젝트 README
2. 해당 프로젝트의 experience-flow와 screen-inventory
3. 공통 design-book 원칙
4. 관련 design-system 문서
5. screen-spec과 design-review

## 현재 적용 프로젝트

v1.0의 첫 적용 프로젝트는 `projects/bidme`다. Bidme는 SEARCH에서 REQUEST로 이어지는 요청·제안·예약 경험을 설계 대상으로 한다.

## 향후 화면 확장

향후 Studio 화면은 Overview, Design Book, Design System, Projects, Screen Gallery, Components, Prototypes로 확장한다. 현재는 문서와 `/studio` 진입점만 제공하며 데이터베이스나 CRUD를 추가하지 않는다.
