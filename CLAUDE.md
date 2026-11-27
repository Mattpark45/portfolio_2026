# human-mcp-web — Claude Code 지침

기준 원본: `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md` (복제하지 않고 보충만).

- 시작 시 `git status`와 두 문서를 읽고 `npm test`로 기준선을 확인합니다.
- 문구를 바꾸면 미심의 표현 규칙을 확인하고, 규칙 자체를 완화하지 않습니다(심의 승인 후 사용자 지시로만).
- 기본 역할: 구조·연동·보안·데이터. 화면·고객여정 대규모 변경은 Codex 이슈와 겹치지 않게 합니다.
- 배포(`npm run deploy`)는 사용자 승인 후. 토큰은 환경변수로만 쓰고 파일·커밋에 남기지 않습니다.
- 보고: 변경 파일, `npm test` 결과, 미검증 항목, 롤백 방법.
