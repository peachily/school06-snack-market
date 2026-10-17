# Cloudflare Pages 배포

이 저장소는 Vite 정적 앱입니다. 계정 연결과 최초 배포는 사용자가 진행합니다. API 키, Functions, 데이터베이스, Wrangler 의존성은 필요하지 않습니다.

## GitHub 연결과 설정

1. 커밋을 GitHub의 `peachily/school06-snack-market` 저장소에 push합니다.
2. Cloudflare 대시보드의 Workers & Pages에서 **Pages** 프로젝트를 만들고 Git 저장소 연결을 선택합니다.
3. GitHub 연결을 승인하고 해당 저장소를 선택합니다.
4. 아래 설정을 입력합니다.

| 항목 | 값 |
| --- | --- |
| 프로젝트 이름 | 예: `snack-market-classroom` (사용 가능한 이름 선택) |
| Production branch | `main` |
| Framework preset | None |
| Root directory | 저장소 루트, 비워 둠 |
| Build command | `pnpm build` |
| Build output directory | `apps/web/dist` |
| Build system | v3 |
| 환경 변수 `NODE_VERSION` | `24` |
| 환경 변수 `PNPM_VERSION` | `10.34.7` |

모노레포 전체의 workspace 및 lockfile을 사용하므로 Root directory를 `apps/web`로 설정하지 않습니다. Pages의 의존성 자동 설치를 켜 둡니다. Node 버전은 루트 `.node-version`에도 지정되어 있습니다. 환경 변수는 Production과 사용할 Preview 환경에 동일하게 적용합니다.

Git 연결 프로젝트는 변경 push에 따라 빌드·배포됩니다. Production branch를 `main`으로 두고 자동 배포를 활성화합니다. 첫 성공 후 제공되는 `<프로젝트 이름>.pages.dev` 주소로 접속합니다. 프로젝트 이름은 GitHub 사용자명과 독립적입니다. 별도 도메인을 구매할 필요는 없습니다.

근거: [Git 연결](https://developers.cloudflare.com/pages/get-started/git-integration/), [빌드 설정](https://developers.cloudflare.com/pages/configuration/build-configuration/), [빌드 환경 버전](https://developers.cloudflare.com/pages/configuration/build-image/), [모노레포](https://developers.cloudflare.com/pages/configuration/monorepos/).

## 배포 산출물과 캐시

`pnpm build`는 타입 검사 후 `apps/web/dist`를 생성합니다. 루트의 `index.html`, 해시가 붙은 JS/CSS, 이미지 34개, 글꼴 2개, `_headers`가 포함됩니다. 서버 실행 명령이나 SPA 라우터 설정은 필요하지 않습니다.

`apps/web/public/_headers`는 빌드 결과에 복사됩니다. 해시가 붙은 JS/CSS는 장기 캐시하고, 같은 파일명으로 교체할 수 있는 이미지·글꼴은 캐시를 저장하되 사용 전 재검증합니다. HTML은 Pages 기본 정책을 사용합니다. [Pages 헤더 설정](https://developers.cloudflare.com/pages/configuration/headers/)을 따릅니다.

## 사용자 배포 후 확인

- 빌드 로그에서 Node 24, pnpm 10.34.7과 성공한 빌드를 확인합니다.
- HTTPS의 pages.dev 주소에서 이미지·빙그레체가 로드되는지 확인합니다.
- 학생 전환, 터치 드래그, 다음 문제, 확인 취소와 재시작, 새로고침 초기화를 확인합니다.
- 이미지 교체 후 새 이미지가 보이는지 확인합니다.
- 실제 전자칠판의 브라우저 확대율 100%에서 터치와 화면 크기를 점검합니다.

로컬 미리보기는 `pnpm preview`로 실행합니다. 이는 정적 앱 확인용이며 Cloudflare의 CDN·응답 헤더·자동 배포를 재현하지 않습니다.
