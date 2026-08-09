# Production Core Architecture

NexDataForge Design System은 실행 자산, 검증 화면, 운영 문서를 분리한다. 이 경계는 시스템을 별도 프레임워크로 만들기 위한 것이 아니라 각 서비스가 동일한 최소 구현을 재사용하도록 하기 위한 것이다.

## Release boundary

1. **Production Core — `components/design-system/`**
   - 서비스 화면이 직접 import하는 token 기준, foundation helper, core component와 public entry point다.
   - 내부 사용자는 `@/components/design-system` 진입점을 우선한다.
2. **Studio — `app/studio/`**
   - Production Core를 실제로 소비하면서 상태, 반응형, 접근성과 시각 결과를 검증한다.
   - Studio 전용 layout과 설명 UI는 Production Core의 public API가 아니다.
3. **Documentation / Governance — `studio/`**
   - Constitution, adoption, migration, compliance와 프로젝트 evidence를 관리한다.
   - 실행 컴포넌트를 복제하지 않고 변경·검토·release 기준을 통제한다.

## Adoption flow

```text
Design System Production Core
  -> Studio Preview / Validation
  -> Project Adoption
  -> PriceGo / BidMe / SoolMap / AI Measure

Documentation / Constitution / Compliance
  -> defines evidence, review, exception, and release requirements
```

새 primitive는 실제 서비스와 Studio 양쪽에서 같은 구현을 사용할 수 있을 때 Production Core에 추가한다. 특정 보드의 설명이나 mock에만 필요한 표현은 Studio에 유지한다.
