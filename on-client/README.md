# 내 보안 Agent 시작 틀 0.2.21

이 보안 Agent는 회사 직원이 자기 로그인 상태, 업무 앱 접속 결과, 최근 접속 기록과 보안 경보를 보는 보안 앱입니다. 13단계부터 22단계까지 이 프로젝트 하나로 화면을 채워 가며 완성합니다. 처음이라면 docs/GETTING_STARTED_STUDENT.md부터 읽습니다. 무엇을 왜 만드는지와 단계별 순서가 그 문서에 있습니다.

이 시작 틀을 받은 것만으로 단계를 통과하지 않습니다. 단계마다 docs/STUDENT_PROMPTS.md의 안내를 수업용 AI에 붙여 넣어 student/extension.mjs를 고치고, 화면에서 확인하고, 커밋한 뒤 ALEPH에 제출합니다. 제출하면 서버가 그 커밋의 코드를 받아 AI가 단계 과제 기준으로 읽고 판정합니다. 코드를 실행해서 판정하지 않습니다.

## 켜기

검수 환경은 Node.js 24.19.0이며 외부 npm 의존성이 없습니다. 이 폴더의 PowerShell에서 아래를 실행하고 PC 브라우저로 http://127.0.0.1:5189 를 엽니다. 자세한 켜기·끄기·다시 켜기는 docs/STUDENT_LAUNCH_GUIDE.md에 있습니다.

    powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1

npm start도 같은 서버를 켭니다. 기본 실행은 실제 회사 시스템(기존 엔진)에 연결되지 않은 상태입니다. npm run demo는 예제 자료로 화면을 보여 줄 뿐이며 실제 연결이나 성취가 아닙니다. npm run check는 student/extension.mjs의 문법만 확인합니다.

## 지킬 것

- 기존 1~3차 프로젝트와 학생 파일은 지우거나 덮어쓰지 않습니다. 새 폴더에서 시작하거나, 이미 하던 프로젝트를 이어 씁니다.
- AI 열쇠·비밀번호·토큰을 코드, 커밋, 캡처, 도움정보에 넣지 않습니다. 주소나 열쇠를 직접 입력하는 칸도 만들지 않습니다.
- .env.example에는 비밀 없는 설정만 있습니다.

## 더 읽을 곳

- 단계별 안내와 AI에 붙여 넣을 문장: docs/STUDENT_PROMPTS.md
- 단계별 확인 항목: docs/CURRICULUM.json, docs/IMPLEMENTATION_CONTRACT.md
- 오류 코드별 해결: docs/CONNECTION_TROUBLESHOOT.md
- 시작 틀 업데이트(내 파일 보존): docs/STARTER_UPDATE.md
- 실제 회사 시스템(SDP)·앱 안 AI 연결은 담당자가 따로 안내할 때만 씁니다: docs/SDP_HOST_CONNECTION.md, docs/AI_SETUP_GUIDE.md. 이 연결은 앱을 처음 켜고 13~16단계 화면을 만들거나 공식 AI 코드 판정을 받기 위한 전제 조건은 아닙니다. 다만 17단계 이후의 실제 연결과 새 환경 재현은 해당 단계의 기준에 따라 따로 확인합니다.

## 학생 작성 부분 (케셰브)

이 절은 학생이 추가했습니다. 위의 제공 내용은 고치지 않았습니다.

- **목적**: 직원이 자기 로그인·기기·세션, 업무 앱 접속 판정, 접속·XDR 기록, AI 연결 상태와 사건 설명, 보안 조치 상태, 설치 패키지의 알려진 취약점 조회 결과를 구분해 보는 보안 Agent입니다.
- **학생이 구현한 기능**: `student/extension.mjs`의 `renderIdentity`(13), `renderDecision`(14), `renderEvents`(15), `renderStatus`(16), `renderAiConnection`(17), `renderExplanation`(18), `renderAction`(19), `renderVulnerabilities`(20). 요청·검사·늦은 응답 차단은 제공 코드(`public/app.js`, `src/`)가 하고, 학생 함수는 받은 값을 화면에 표시합니다.
- **구성**: 브라우저(`public/app.js` + `student/extension.mjs`) → 로컬 앱 서버(`src/server.mjs`, `127.0.0.1:5189`) → 접근 제어·XDR 시스템(SDP, `src/engine/`) / AI 게이트웨이(CLCO, `src/ai/`) / 조치 연동(`src/actions/`) / OSV(`src/vulnerabilities/`).
- **지원 환경과 버전**: Windows 11 Pro + Windows PowerShell 5.1에서 Node.js v24.22.1, npm 11.19.1로 실행해 확인했습니다. 수업 기준 Node.js 24.19.0에서는 실행해 보지 않았습니다. 외부 npm 의존성과 `package-lock.json`은 없습니다.
- **실행**: 앱 폴더(`on-client`)의 PowerShell에서 `npm.cmd run demo`(예제) 또는 `npm.cmd start`(연결 없음) → `http://127.0.0.1:5189/` → 종료는 `Ctrl+C`.

실행 절차, 시스템 구성도(Mermaid·글), 제공/학생 경계, 오류별 확인 순서, 미확인 기능은 [docs/STUDENT_RUNBOOK.md](docs/STUDENT_RUNBOOK.md)에 있습니다.

버전·새 환경 재현 기록·단계별 결과·데이터 보존 계획·미해결 사항은 [docs/STUDENT_RELEASE.md](docs/STUDENT_RELEASE.md)에 있습니다. 현재 학생 릴리스는 **v0.22-검증 중**이며 실제 연결 미완료 항목이 남아 있습니다.
