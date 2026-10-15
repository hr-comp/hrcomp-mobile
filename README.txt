# HR COMP Mobile ERP V2

## 1. 시스템 개요
HR COMP 모바일 ERP는 Excel VBA 기반 PC ERP와 동일한 Supabase DB를 사용하는 모바일 웹 시스템입니다.

GitHub Pages를 통해 배포하며, 업무별 JavaScript 및 CSS 모듈을 분리하여 관리합니다.

## 2. GitHub 파일 구조

```text
hrcomp-mobile/
├── index.html
├── README.txt
├── css/
│   ├── common.css
│   ├── stock.css
│   └── delivery.css
└── js/
    ├── config.js
    ├── auth.js
    ├── app.js
    ├── stock.js
    └── delivery.js
```

## 3. 공통 모듈
- js/config.js : Supabase 접속 설정 및 공개 키
- js/auth.js : 사용자 인증
- js/app.js : 메뉴 및 화면 전환, 공통 기능
- css/common.css : 공통 UI 스타일

## 4. 업무 모듈
- 재고관리 : js/stock.js, css/stock.css
- 고객주문 납기관리 : js/delivery.js, css/delivery.css

## 5. 고객주문 납기관리
- 1단계 : 고객주문별 미출하 현황
- 2단계 : 주문 품목별 납기 및 수급 현황
- 3단계 : 품목별 공급추적 및 구매발주 입고예정 현황
- F/UP : 고객주문 품목별 조치이력 조회

PC ERP와 모바일의 공통 항목명 및 계산 기준을 일치시킵니다.

모바일 납기관리와 F/UP은 조회 전용이며, F/UP 등록 및 수정은 PC ERP에서 수행합니다.

## 6. 운영 및 배포 기준
- GitHub main 브랜치를 기준으로 배포
- index.html은 저장소 루트에 유지
- CSS는 css/ 폴더, JavaScript는 js/ 폴더에서 관리
- 파일 수정 후 Commit 및 GitHub Pages 배포 상태 확인
- 정상 운영 파일을 수정하기 전 기존 버전 백업
- Supabase DB/RPC 변경은 PC·모바일 영향 검토 후 적용

## 7. 주요 검증 항목
- 로그인 및 로그아웃
- 현재재고 조회
- 재고실사 조회 및 모바일 입력·저장
- 고객주문 납기관리 3단계 조회
- PC·모바일 수량 및 항목명 일치
- 고객주문 F/UP 이력 조회

## 8. 버전 관리
2026-10-15 : 고객주문 납기관리 PC·모바일 항목명 통일 및 F/UP 조회 기능 반영. GitHub 저장소 중복 파일 정리.
