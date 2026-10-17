# 얼마일까요?

Node.js 24와 pnpm 10.34.7을 사용합니다.

```sh
npm install --global pnpm@10.34.7
pnpm install --frozen-lockfile
pnpm dev
```

루트에서 검증 및 빌드를 실행합니다.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm check:assets
pnpm build
```

정적 배포 산출물은 `apps/web/dist`에 생성됩니다.
