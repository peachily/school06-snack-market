# 얼마일까요?

과자에 준비된 현금을 옮겨 네 자리 수를 만들고 읽는 교실 활동입니다. 교사가 전자칠판에서 학생과 함께 사용하며, 가격은 실제 판매가와 무관하게 무작위로 정합니다.

## 활동 방법

1. 1·2·3 탭에서 학생을 선택합니다.
2. 지갑의 현금을 같은 자리의 숫자 칸으로 드래그합니다. 현금을 탭한 뒤 숫자 칸을 탭해도 됩니다.
3. 모두 옮기면 숫자가 연결됩니다. 교사와 함께 읽은 뒤 과자 옆 삼각형 버튼으로 넘어갑니다.

키보드에서는 Tab으로 현금에 이동하고 Enter 또는 Space로 선택합니다. 자동으로 이동한 숫자 칸에서 Enter 또는 Space로 놓습니다. 방향키로 숫자 칸을 이동하고 Escape로 취소할 수 있습니다.

| 학생 | 출제 범위 |
| --- | --- |
| 1 | 천 1~9, 나머지 0 |
| 2 | 천·백 각각 1~9, 십·일 0 |
| 3 | 천 1~9, 백·십·일 각각 0~9 |

학생마다 과자 30종을 한 번씩 진행합니다. 탭을 바꿔도 진행은 유지되지만 새로고침하면 모두 초기화됩니다. 상단 다시 시작은 확인 후 현재 학생만 초기화합니다. 30번째 완료 후에는 상단 다시 시작을 이용합니다.

## 실행

React, TypeScript, Vite, Tailwind CSS v4, pnpm workspace, @dnd-kit/react, React Hooks, Vitest와 React Testing Library를 사용합니다. 백엔드나 로그인은 없습니다.

Node.js 24와 pnpm 10.34.7을 준비하고 저장소 루트에서 실행합니다.

```sh
npm install --global pnpm@10.34.7
pnpm install --frozen-lockfile
pnpm dev
```

검증과 배포 빌드:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm check:assets
pnpm build
pnpm preview
```

## 이미지 교체

- 과자: `apps/web/public/images/snacks/snack-01.avif` ~ `snack-30.avif`
- 현금: `apps/web/public/images/money/1000.webp`, `100.webp`, `10.webp`, `1.webp`
- 과자 번호·이름은 [snacks.ts](apps/web/src/data/snacks.ts), 현금 정보는 [cash.ts](apps/web/src/data/cash.ts)에서 확인합니다.

같은 파일명으로 교체하면 코드 수정이 필요 없습니다. 과자 AVIF와 현금 WebP 원본을 사용하며 배경 제거·변환·크롭은 하지 않습니다. 이미지가 없거나 로딩에 실패하면 플레이스홀더를 표시합니다. `pnpm check:assets`는 누락 목록을 출력하며, 누락만으로 실패하지 않습니다.

## 정적 배포

Cloudflare Pages에서 GitHub 저장소를 연결하고 루트에서 `pnpm build`를 실행하도록 설정합니다. 결과 디렉터리는 `apps/web/dist`, 배포 브랜치는 `main`입니다.

프로젝트 이름을 `snack-market-classroom`처럼 지정하면 사용 가능한 이름에 대해 `snack-market-classroom.pages.dev` 주소를 사용할 수 있습니다. GitHub 사용자명을 주소에 넣을 필요는 없습니다.

[배포 설정](docs/DEPLOYMENT.md) · [구현 구조](docs/ARCHITECTURE.md) · [검증 결과와 기기 점검](docs/VALIDATION.md)
