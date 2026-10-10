HR COMP Mobile V1 - modular structure

GitHub repository root에 index.html, css/, js/ 전체 업로드.
기존 루트 stock.js, stock.css, delivery.js, delivery.css는 참조되지 않으므로 정상 동작 확인 후 삭제 가능합니다.
공통: js/config.js(Supabase 공개 키), js/auth.js(인증), js/app.js(화면전환/HTML escape), css/common.css
업무: js/stock.js + css/stock.css; js/delivery.js + css/delivery.css
Supabase DB/RPC 변경 없음.
실제 배포 후 로그인, 재고조회, 재고실사 조회/저장, 납기관리 3단계 검증 필요.
