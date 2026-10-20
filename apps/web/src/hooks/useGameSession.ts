import { useReducer } from 'react';
import { createStudentSession, gameReducer, getCashState, getCurrentQuestion, getDisplayedDigits } from '@snack-market/game-core';
import type { GameState, Place, StudentId } from '@snack-market/game-core';

export function useGameSession(initialState: GameState, snackIds: readonly string[]) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const student = state.students[state.activeStudentId];
  const question = getCurrentQuestion(student);
  const context = { studentId: student.studentId, sessionId: student.sessionId, questionId: question.id };

  return {
    state,
    student,
    question,
    digits: getDisplayedDigits(question),
    cash: getCashState(question),
    hasNextQuestion: student.currentIndex < student.questions.length - 1,
    selectStudent: (studentId: StudentId) => dispatch({ type: 'select-student', studentId }),
    useCash: (cashId: string, targetPlace: Place) => dispatch({ type: 'use-cash', ...context, cashId, targetPlace }),
    nextQuestion: () => dispatch({ type: 'next-question', ...context }),
    restartStudent: () => dispatch({
      type: 'restart-student',
      studentId: student.studentId,
      sessionId: student.sessionId,
      replacement: createStudentSession({ studentId: student.studentId, sessionId: crypto.randomUUID(), snackIds, random: Math.random }),
    }),
  };
}
