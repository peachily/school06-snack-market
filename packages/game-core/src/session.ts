import { createStudentQuestions } from './questions';
import type { CashToken, Digits, Place, Question, RandomSource, StudentId } from './types';

export type QuestionState = Question & Readonly<{
  usedCashIds: readonly string[];
  completed: boolean;
}>;

export type StudentSession = Readonly<{
  studentId: StudentId;
  sessionId: string;
  questions: readonly QuestionState[];
  currentIndex: number;
  completed: boolean;
}>;

export type GameState = Readonly<{
  activeStudentId: StudentId;
  students: Readonly<Record<StudentId, StudentSession>>;
}>;

type SessionOptions = Readonly<{
  studentId: StudentId;
  sessionId: string;
  snackIds: readonly string[];
  random: RandomSource;
}>;

type Context = Readonly<{ studentId: StudentId; sessionId: string; questionId: string }>;
export type GameAction =
  | { type: 'select-student'; studentId: StudentId }
  | ({ type: 'use-cash'; cashId: string; targetPlace: Place } & Context)
  | ({ type: 'next-question' } & Context)
  | { type: 'restart-student'; studentId: StudentId; sessionId: string; replacement: StudentSession };

export function createStudentSession(options: SessionOptions): StudentSession {
  return {
    studentId: options.studentId,
    sessionId: options.sessionId,
    questions: createStudentQuestions(options).map((question) => ({ ...question, usedCashIds: [], completed: false })),
    currentIndex: 0,
    completed: false,
  };
}

export function createGameState(options: Omit<SessionOptions, 'studentId'>): GameState {
  const create = (studentId: StudentId) => createStudentSession({
    ...options, studentId, sessionId: JSON.stringify([options.sessionId, studentId]),
  });
  return { activeStudentId: 1, students: { 1: create(1), 2: create(2), 3: create(3) } };
}

export function getCurrentQuestion(session: StudentSession): QuestionState {
  return session.questions[session.currentIndex];
}

export function getDisplayedDigits(question: QuestionState): Digits {
  const digits = { thousands: 0, hundreds: 0, tens: 0, ones: 0 };
  for (const cash of question.cash) {
    if (question.usedCashIds.includes(cash.id)) digits[cash.place] += 1;
  }
  return digits as Digits;
}

export function getCashState(question: QuestionState): readonly (CashToken & { readonly used: boolean })[] {
  return question.cash.map((cash) => ({ ...cash, used: question.usedCashIds.includes(cash.id) }));
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'select-student') {
    if (!state.students[action.studentId] || state.activeStudentId === action.studentId) return state;
    return { ...state, activeStudentId: action.studentId };
  }

  const student = state.students[state.activeStudentId];
  if (action.studentId !== student.studentId || action.sessionId !== student.sessionId) return state;
  const replace = (session: StudentSession): GameState => ({
    ...state, students: { ...state.students, [session.studentId]: session },
  });

  if (action.type === 'restart-student') {
    if (action.replacement.studentId !== student.studentId || action.replacement.sessionId === student.sessionId) return state;
    return replace(action.replacement);
  }

  const question = getCurrentQuestion(student);
  if (action.questionId !== question.id || student.completed) return state;
  if (action.type === 'next-question') {
    if (!question.completed || student.currentIndex >= student.questions.length - 1) return state;
    return replace({ ...student, currentIndex: student.currentIndex + 1 });
  }

  if (question.completed || question.usedCashIds.includes(action.cashId)) return state;
  const cash = question.cash.find((token) => token.id === action.cashId);
  if (!cash || cash.place !== action.targetPlace) return state;
  const digits = getDisplayedDigits(question);
  if (digits[cash.place] >= question.targetDigits[cash.place]) return state;

  const usedCashIds = [...question.usedCashIds, cash.id];
  const nextDigits = { ...digits, [cash.place]: digits[cash.place] + 1 };
  const completed = usedCashIds.length === question.cash.length
    && (Object.keys(question.targetDigits) as Place[]).every((place) => nextDigits[place] === question.targetDigits[place]);
  const updated = { ...question, usedCashIds, completed };
  return replace({
    ...student,
    questions: student.questions.map((item, index) => index === student.currentIndex ? updated : item),
    completed: completed && student.currentIndex === student.questions.length - 1,
  });
}
