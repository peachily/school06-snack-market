import { createCashTokens } from './cash';
import { generatePrice, splitDigits } from './price';
import { shuffleSnacks } from './shuffle';
import type { Level, Question, RandomSource, StudentId } from './types';

type QuestionOptions = Readonly<{
  questionId: string;
  snackId: string;
  level: Level;
  random: RandomSource;
}>;

export function createQuestion({ questionId, snackId, level, random }: QuestionOptions): Question {
  if (questionId.trim() === '' || snackId.trim() === '') throw new Error('문제 ID와 과자 ID가 필요합니다.');
  const targetPrice = generatePrice(level, random);
  return Object.freeze({
    id: questionId,
    snackId,
    targetPrice,
    targetDigits: splitDigits(targetPrice),
    cash: createCashTokens(targetPrice, questionId),
  });
}

type StudentQuestionsOptions = Readonly<{
  studentId: StudentId;
  sessionId: string;
  snackIds: readonly string[];
  random: RandomSource;
}>;

export function createStudentQuestions({ studentId, sessionId, snackIds, random }: StudentQuestionsOptions): readonly Question[] {
  if (sessionId.trim() === '') throw new Error('세션 ID가 필요합니다.');
  if (studentId !== 1 && studentId !== 2 && studentId !== 3) throw new RangeError('학생은 1, 2, 3 중 하나여야 합니다.');
  return Object.freeze(shuffleSnacks(snackIds, random).map((snackId, index) => createQuestion({
    questionId: JSON.stringify([sessionId, studentId, index]),
    snackId,
    level: studentId,
    random,
  })));
}
