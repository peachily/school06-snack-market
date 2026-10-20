import { createCashTokens } from './cash';
import { splitDigits } from './price';
import { useQuestionCash, type QuestionState } from './session';
import type { Place } from './types';

export type PriceExercise = Readonly<{ snackId: string; price: number }>;
export type PriceSession = Readonly<{
  sessionId: string;
  questions: readonly QuestionState[];
  currentIndex: number;
  completed: boolean;
}>;

type Context = { sessionId: string; questionId: string };
export type PriceAction =
  | ({ type: 'use-cash'; cashId: string; targetPlace: Place } & Context)
  | ({ type: 'next-question' } & Context)
  | { type: 'restart'; sessionId: string; replacement: PriceSession };

export function createPriceSession(sessionId: string, exercises: readonly PriceExercise[]): PriceSession {
  if (!sessionId.trim()) throw new Error('세션 ID가 필요합니다.');
  if (exercises.length !== 30 || new Set(exercises.map((item) => item.snackId)).size !== 30) {
    throw new Error('중복 없는 과자 30종이 필요합니다.');
  }
  return {
    sessionId,
    currentIndex: 0,
    completed: false,
    questions: exercises.map(({ snackId, price }, index) => {
      const id = JSON.stringify([sessionId, index]);
      return {
        id, snackId, targetPrice: price, targetDigits: splitDigits(price),
        cash: createCashTokens(9999, id), usedCashIds: [], completed: false,
      };
    }),
  };
}

export function priceSessionReducer(state: PriceSession, action: PriceAction): PriceSession {
  if (action.sessionId !== state.sessionId) return state;
  if (action.type === 'restart') {
    return action.replacement.sessionId === state.sessionId ? state : action.replacement;
  }
  const question = state.questions[state.currentIndex];
  if (state.completed || question.id !== action.questionId) return state;
  if (action.type === 'next-question') {
    return question.completed && state.currentIndex < state.questions.length - 1
      ? { ...state, currentIndex: state.currentIndex + 1 } : state;
  }
  const updated = useQuestionCash(question, action.cashId, action.targetPlace, false);
  if (updated === question) return state;
  return {
    ...state,
    questions: state.questions.map((item, index) => index === state.currentIndex ? updated : item),
    completed: updated.completed && state.currentIndex === state.questions.length - 1,
  };
}
