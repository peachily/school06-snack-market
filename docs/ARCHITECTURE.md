# 「얼마일까요?」 아키텍처

## 1. 경계와 의존성

`apps/web`은 React UI, 접근성, 입력 처리, 디자인 시스템, 자산과 데이터 연결을 담당한다. `packages/game-core`는 가격 생성, 자릿값 계산, 과자 셔플, 학생별 세션과 진행 전이를 담당하는 순수 TypeScript 패키지다. `docs`는 요구사항과 구조 및 개발 절차를 기록한다.

의존 방향은 `apps/web → packages/game-core` 하나다. core는 React, DOM, @dnd-kit/react, 이미지 경로, CSS, 브라우저 저장소를 참조하지 않는다. 앱은 core의 공개 진입점만 사용한다. 두 패키지는 pnpm의 `workspace:*`로 연결하고 별도 모노레포 빌드 오케스트레이터를 추가하지 않는다.

현재 커밋은 문서 2개와 원본 이미지 34개만 포함한다. 아래 디렉터리와 타입, 함수, 컴포넌트는 후속 구현 설계이며 실행 파일을 생성하지 않는다.

## 2. 예정 구조

```text
apps/web/
  public/
    images/snacks/snack01.avif … snack30.avif
    images/cash/1.webp, 10.webp, 100.webp, 1000.webp
    fonts/
  src/
    app/App.tsx
    components/ActivityHeader.tsx
    components/StudentTabs.tsx
    components/SnackCard.tsx
    components/NumberBoard.tsx
    components/DigitBox.tsx
    components/Wallet.tsx
    components/WalletSection.tsx
    components/CashItem.tsx
    components/NextButton.tsx
    components/CompletionEffect.tsx
    components/RestartDialog.tsx
    hooks/useGameSession.ts
    hooks/useCashInteraction.ts
    data/snacks.ts
    data/cash.ts
    styles/tokens.css
    styles/app.css
    test/
  package.json
  vite.config.ts
packages/game-core/
  src/types.ts
  src/price.ts
  src/shuffle.ts
  src/session.ts
  src/selectors.ts
  src/index.ts
  test/
docs/
  SPEC.md
  ARCHITECTURE.md
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
tsconfig.base.json
```

테스트 전용 패키지나 범용 UI 패키지는 추가하지 않는다.

## 3. 주요 도메인 타입 설계

다음은 구현 시 사용할 계약 초안이다. TypeScript 코드 블록은 문서 안의 설계 표현이며 이번 커밋에서 소스 파일로 만들지 않는다.

```ts
type StudentId = 1 | 2 | 3;
type Level = StudentId;
type Place = 'thousands' | 'hundreds' | 'tens' | 'ones';
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type SlotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Digits = Readonly<Record<Place, Digit>>;
type RandomSource = () => number;
type SnackId = string;
type SessionId = string;
type QuestionId = string;
type CashId = string;

type CashToken = Readonly<{
  id: CashId;
  place: Place;
  slotIndex: SlotIndex;
}>;

type QuestionState = Readonly<{
  id: QuestionId;
  snackId: SnackId;
  targetPrice: number;
  cash: readonly CashToken[];
  usedCashIds: readonly CashId[];
  status: 'playing' | 'solved';
}>;

type StudentState = Readonly<{
  sessionId: SessionId;
  studentId: StudentId;
  level: Level;
  questions: readonly QuestionState[];
  currentIndex: number;
  status: 'in-progress' | 'completed';
}>;

type GameState = Readonly<{
  activeStudentId: StudentId;
  students: Readonly<Record<StudentId, StudentState>>;
}>;
```

학생 ID와 수준은 항상 같은 값이다. `questions`는 정확히 30개이고 배열 순서 자체가 과자 순서다. `currentIndex`는 0~29다. `targetPrice`는 생성 경계에서 수준별 범위를 검증한다. `RandomSource`의 계약은 0 이상 1 미만이다.

각 문제의 `cash`는 생성 후 바뀌지 않으며 자리별 목표 숫자만큼 고유 토큰을 갖는다. 토큰 ID에는 세션·문제·자리·슬롯을 포함해 충돌을 방지한다. `usedCashIds`는 해당 문제 토큰의 중복 없는 부분집합이다.

목표 자릿값은 `targetPrice`에서 계산하고 화면 숫자는 사용 토큰의 자리별 개수로 계산한다. 현금 목록과 사용 ID로 슬롯 상태를 결정한다. 화면 숫자, 남은 현금 수, 별도 셔플 배열을 중복 상태로 보관하지 않는다. 문제와 학생의 완료 상태는 전이 함수가 함께 갱신하며 파생 조건과 일치하는지 테스트한다.

UI 전용 데이터 계약은 다음과 같다. 실제 과자 이름은 별도 매핑 확인 후 입력한다.

```ts
type SnackDefinition = Readonly<{
  id: SnackId;
  name: string;
  imageSrc: string;
}>;

type CashDefinition = Readonly<{
  place: Place;
  denomination: 1000 | 100 | 10 | 1;
  imageSrc: string;
}>;
```

`snacks.ts`는 안정된 `snack01`~`snack30` ID와 이름·경로를 관리한다. `cash.ts`는 자리와 액면가·이미지의 정확한 매핑을 관리한다. core에는 과자 ID 목록만 전달한다.

## 4. 순수 로직과 상태 전이

| 함수 책임 | 입력과 결과 |
| --- | --- |
| 가격 생성 | 수준과 RandomSource → 범위에 맞는 정수 가격 |
| 자릿값 분해 | 가격 → 천·백·십·일 숫자 |
| 과자 셔플 | 고유 과자 ID 30개와 RandomSource → 새 순열; 원본 불변 |
| 학생 세션 생성 | 학생 ID, 새 sessionId, 과자 ID, RandomSource → 독립된 30문제 |
| 전체 세션 생성 | 학생별 세션 3개 → 기본 학생 1인 GameState |
| 슬롯 생성 | 세션·문제 식별자와 목표 자릿값 → 고정 슬롯 CashToken 목록 |
| 선택자 | 현재 문제, 구성 숫자, 슬롯 사용 여부, 다음 가능 여부 계산 |
| 상태 전이 | GameState와 액션 → 새 GameState; 무효 액션은 기존 상태 유지 |

셔플은 원본을 복사한 Fisher–Yates 방식으로 설계한다. 가격은 자리별 허용 구간에서 생성하며 과자 ID를 생성 입력으로 사용하지 않는다. 테스트에서는 난수 공급자를 주입해 경계값과 재현 가능한 순서를 검증한다. 난수 호출은 생성 단계에만 있고 reducer에는 없다.

액션 계약은 다음과 같다.

| 액션 | 주요 데이터 | 허용 조건과 효과 |
| --- | --- | --- |
| SELECT_STUDENT | studentId | 선택 학생만 변경 |
| APPLY_CASH | studentId, sessionId, questionId, cashId, targetPlace | 활성 학생의 현재 진행 문제이며 미사용 현금의 자리와 대상이 같을 때만 사용 처리 |
| NEXT_QUESTION | studentId, sessionId, questionId | 활성 학생의 현재 완성 문제이며 인덱스 < 29일 때 +1 |
| RESTART_STUDENT | studentId, expectedSessionId, 새 StudentState | 확인 확정 후 활성 학생과 기존 세션이 일치할 때 해당 학생만 교체 |

사용 완료 직후 모든 현금이 사용되었으면 문제를 `solved`로 바꾼다. 인덱스가 29라면 학생도 `completed`로 바꾼다. 다른 학생 객체와 문제 데이터는 변경하지 않는다. 완료 상태에서의 추가 드롭과 마지막 문제에서의 NEXT는 무효다. 0인 자리는 토큰이 없으므로 처음부터 충족되며 0원 문제는 생성되지 않는다.

UI는 이벤트에 잡아둔 세션·문제 식별자를 전달한다. reducer는 현재 상태와 비교하여 탭 전환·초기화·다음 이동 이후 늦게 들어온 이벤트와 중복 입력을 거부한다. 다시 시작의 새 난수와 새 세션은 확인 확정 핸들러에서 준비하고 reducer는 준비된 상태만 반영한다.

앱 시작 때 초기 상태를 한 번 생성하여 React에 전달한다. 렌더, reducer 또는 effect에서 무작위 상태를 재생성하지 않는다. StrictMode에서 반복 실행되어도 사용 중인 문제 상태가 교체되지 않도록 검증한다.

## 5. React 상태와 컴포넌트 책임

`useGameSession`은 루트에서 단일 `useReducer`로 GameState를 소유하고 core 선택자와 액션 핸들러를 제공한다. 작은 트리에서는 props로 전달한다. 전역 상태 라이브러리나 선제적인 Context 계층을 도입하지 않는다.

드래그 대상, 키보드 선택, 오답 흔들림, 확인창 열림, 폭죽 타이머는 UI 임시 상태다. 영속 게임 상태와 분리하고 탭·문제·세션 변경 시 취소 및 정리한다. 연출 타이머는 게임 상태를 변경하지 않는다.

| 구성 요소 | 책임 |
| --- | --- |
| App | 데이터 연결, 세션 소유, 전체 레이아웃, 입력·완료 흐름 조정 |
| ActivityHeader | 제목, 유일한 안내, 학생 탭과 다시 시작 버튼 배치 |
| StudentTabs | 1·2·3 선택과 접근성 탭 키보드 조작; 학생 상태를 생성하지 않음 |
| SnackCard | 고정 크기 사진 영역, 오류 플레이스홀더, 이름, 오른쪽 다음 버튼 공간 |
| NumberBoard | 네 자리 배치와 `원`, 진행·완성 레이아웃 전환 |
| DigitBox | 현재 구성 숫자, 자리별 색, 드롭 영역, 포커스·대상 상태 |
| Wallet | 큰 지갑 외형, 상단 갈색 띠, 네 구역과 세로 박음질 |
| WalletSection | 자리 라벨, 항상 9개의 고정 슬롯, 슬롯별 현금 또는 빈자리 |
| CashItem | 현금 이미지, 입력 가능 여부, 드래그 연결과 접근성 이름 |
| NextButton | 완성 연출 후 이동 가능한 경우 삼각형 버튼; 접근성 이름 `다음` |
| CompletionEffect | 한 번의 짧은 폭죽, 모션 감소 대응, 타이머 정리 |
| RestartDialog | 현재 학생 초기화 확인, 포커스 가두기·복원, Escape 취소 |
| useCashInteraction | @dnd-kit/react 입력과 키보드 대체 조작을 공통 드롭 요청으로 변환 |

드래그 라이브러리의 실제 API는 후속 설치 버전의 공식 문서와 타입 선언으로 확인한다. 다른 dnd-kit 패키지의 예전 API를 가정하거나 패키지 이름을 바꾸지 않는다. 범용 드래그 프레임워크는 만들지 않는다.

## 6. 드래그·키보드·모션 설계

원래 슬롯은 CSS Grid의 고정 위치를 차지하고, 조작 중 현금만 별도 시각 레이어에서 1.1배로 표시한다. 사용 처리 후에도 슬롯 DOM 위치와 크기는 유지한다. 키는 배열의 재정렬 인덱스가 아닌 고정 슬롯·현금 ID를 사용한다.

각 숫자 상자 주변의 확장 드롭 영역은 인접 상자 사이 중간선보다 안쪽에 둔다. 기본 확장값은 12px이고, 간격이 부족하면 확장을 줄인다. 진행 중 상자 간격은 최소 32px로 잡아 양쪽 확장 후에도 빈 공간을 확보한다. 화면 크기 변경 시 실제 영역의 비중첩을 확인한다. 완료 후 이동한 상자는 더 이상 드롭을 받지 않는다.

포인터와 키보드는 동일한 APPLY_CASH 액션을 사용한다. UI는 잘못된 자리에 놓은 경우에만 시각 흔들림을 표시하고 core가 게임 규칙을 최종 검증한다. 터치 스크롤 방지는 드래그 손잡이 영역에 한정한다. 실제 전자칠판에서 터치 시작, 드래그, 취소, 다중 터치 차단을 확인한다.

완료 연출은 현재 보이는 문제의 `playing → solved` 전이에서 한 번만 실행한다. 완성된 문제로 탭 복귀 시 최종 레이아웃을 즉시 표시한다. 연출 도중 탭을 바꾸거나 초기화하면 기존 타이머와 오버레이를 제거한다. `prefers-reduced-motion`에서는 연출 대기 없이 다음 조작을 제공한다.

## 7. 디자인 토큰

`styles/tokens.css`에 CSS custom properties를 단일 원본으로 둔다. Tailwind CSS v4의 테마 연결을 통해 같은 값을 사용하고 컴포넌트마다 색상을 복사하지 않는다.

| 범주 | 초기 토큰 계약 |
| --- | --- |
| 자리 색 | thousands #F8E1E3/#E9A6AE, hundreds #DDEDF8/#A2C9E8, tens #E0F1E5/#A5D5B9, ones #FFF1CA/#F2D78D; 배경/테두리 순이며 변경 금지 |
| 중립 색 | 화면 #FFFCF7, 사진 #FFFEFB, 사진 테두리 #EDE5D9, 본문 #3F352E, 지갑 띠 #A67550 |
| 글꼴 | Binggrae, sans-serif; Regular 400, Bold 700 |
| 글자 크기 | 제목 40px, 안내 24px, 이름·자리 라벨 28px, 숫자 72px를 기준으로 화면별 조정 |
| 간격 | 4, 8, 12, 16, 24, 32, 48, 64px |
| 모서리 | 사진 20px, 숫자 16px, 지갑 외곽 24px; 내부 구역은 개별 라운딩 없음 |
| 그림자 | 사진 none; 필요한 포커스와 드래그 그림자는 별도 약한 토큰 |
| 사진 영역 | 기본 280×200px; 작은 화면용 224×160px; 같은 화면 내 크기 고정 |
| 시간 | 드롭 복귀 180ms, 오답 흔들림 180ms, 숫자 결합 320ms, 폭죽 700ms |
| 동작 | 드래그 배율 1.1, 모션 감소 시 이동·폭죽 시간 0ms |

확정된 자리 색 외의 초기값은 실제 전자칠판 화면 검증 후 조정 가능하다. 조정은 토큰에서 수행한다. 진행 중 숫자 간격과 완성 간격 0은 레이아웃 상태로 구분하며, 연결된 숫자에서도 각 자리 색상은 유지한다. 다음 버튼은 정상 모션에서 결합·폭죽 연출 종료 후 표시한다.

## 8. 자산과 배포

Vite public 자산으로 원본 파일을 복사 없이 참조하는 개발 구조를 사용한다. 배포 빌드에서는 public 자산이 산출물에 원본 그대로 포함되게 한다. AVIF의 흰 배경을 투명하게 만드는 CSS나 캔버스 처리도 하지 않는다. 화폐는 투명 배경을 유지한다.

과자 데이터는 30개의 고유 ID, 비어 있지 않은 이름·경로, 실제 파일 존재 여부를 개발 검증한다. 임시 이름과 실제 이름을 UI 로직에서 추론하지 않는다. 글꼴 파일과 실제 과자 이름 매핑은 후속 구현의 확인 항목이다.

Cloudflare Pages에는 `apps/web/dist` 정적 산출물을 배포한다. 루트에서 실행하는 예정 빌드 명령은 `pnpm --filter @snack-market/web build`다. core는 TypeScript 소스 공개 진입점을 앱 번들러와 테스트 도구가 처리하는 방식으로 시작하여 별도 패키지 배포나 중복 빌드를 두지 않는다. 앱 타입 검사를 빌드 전에 수행한다. Node·pnpm·패키지 버전은 환경 설정 단계에서 호환성을 확인하고 고정하며 lockfile을 커밋한다.

단일 화면으로 시작하며 라우터, 서버 함수, 런타임 API, 비밀키, 저장 서비스를 추가하지 않는다. 최초 정적 파일 요청 이외의 게임 데이터 네트워크 요청은 필요 없다. 이번 커밋에서는 배포 설정과 실제 배포를 수행하지 않는다.

## 9. 다음 개발 단계와 검증 순서

1. **개발 환경 구성**: pnpm workspace, React·TypeScript·Vite, Tailwind v4, core 공개 진입점, Vitest·RTL을 설정한다. 설치, 타입 검사, 최소 빌드가 통과하는지 확인한다.
2. **데이터와 순수 게임 규칙**: 과자·화폐 데이터 및 검증, 가격·자릿값·셔플·현금 슬롯·세션 전이를 구현한다. 사용자에게 실제 과자 이름과 Binggrae 파일을 확인한다. 미확정이면 명시된 임시 이름과 폴백 폰트로 진행한다.
3. **기본 화면과 토큰**: 상단, SnackCard, 숫자 상자, 큰 지갑과 고정 슬롯을 구현한다. 제공 원본 이미지와 자리별 고정 색을 연결하고 두 기준 해상도에서 배치·contain·겹침을 확인한다.
4. **학생별 상태와 입력**: useReducer, 탭 보존, 마우스·터치 드래그, 키보드 대체 조작, 오답·취소·오래된 이벤트 처리를 구현한다. core와 UI 통합 검증을 수행한다.
5. **완료·다음·초기화**: 숫자 결합, 폭죽, 다음 버튼, 확인창, 마지막 문제 종료와 모션 감소를 구현한다. 30문제 흐름 및 다른 학생 상태 보존을 확인한다.
6. **최종 검증과 정적 배포 준비**: 접근성, 실제 전자칠판 터치, 이미지 로드 실패, 새로고침 초기화, 프로덕션 빌드 자산 경로를 확인한다. Cloudflare Pages에서 정적 산출물을 검증하는 배포 단계로 이어간다.

### 자동 검증

- Vitest core: 수준별 가격 경계와 0 허용 조건, 자릿값 분해, 30종 순열·입력 불변성, 고정 슬롯, 임의 현금 사용 순서, 무효 드롭 무변경, 중복 사용 방지, 학생별 독립성, 30번째 완료, 마지막 NEXT 무효, 오래된 세션·문제 액션 무시를 확인한다.
- 난수 테스트: 주입한 0 및 1 직전 값으로 각 허용 범위 경계를 확인한다. 확률적으로 실패할 수 있는 “반드시 다른 순서”나 가격 중복 금지 검사는 하지 않는다.
- RTL 통합: 초기 문구와 0 표시, 목표 가격 비노출, 키보드 조작, 탭 복귀, 초기화 확인·취소, 다음 버튼 노출과 연속 입력, 0인 자리의 완료, 포커스 복원을 검증한다.
- 연출 검증: 가짜 타이머로 연출 종료·탭 전환·초기화 정리를 확인한다. 모션 감소에서도 완료와 다음 이동이 작동하는지 확인한다.
- 데이터 검증: 과자 ID 30개, 파일 존재, 화폐 매핑, 빈 이름·경로와 중복 ID를 검사한다.

### 수동 검증

DOM 기반 테스트만으로 실제 드래그 좌표, 터치 센서, 시각적 겹침을 입증하지 않는다. 브라우저와 실제 전자칠판에서 숫자 상자 중심·확장 가장자리·구역 사이·바깥 드롭, 9개 슬롯, 다양한 이미지 비율, 전체 키보드 흐름, 모션 감소를 확인한다. SPEC.md 인수 기준을 체크리스트로 사용한다.

현재 문서·자산 이동 커밋은 파일 개수, 원본 해시, 문서 간 일관성, Git diff 검사로 검증한다. 아직 실행 코드가 없으므로 앱 빌드나 게임 테스트를 수행했다고 보고하지 않는다.
