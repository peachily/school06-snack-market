import { useReducer } from 'react';
import { createPriceSession, priceSessionReducer, getCashState, getDisplayedDigits, type Place } from '@snack-market/game-core';
import { priceExercises } from '../data/priceExercises';

export function usePriceSession() {
  const [session, dispatch] = useReducer(priceSessionReducer, undefined, () => createPriceSession(crypto.randomUUID(), priceExercises));
  const question = session.questions[session.currentIndex];
  const context = { sessionId: session.sessionId, questionId: question.id };
  return {
    question,
    digits: getDisplayedDigits(question),
    cash: getCashState(question),
    completed: session.completed,
    hasNextQuestion: session.currentIndex < session.questions.length - 1,
    hasPreviousQuestion: session.currentIndex > 0,
    useCash: (cashId: string, targetPlace: Place) => dispatch({ type: 'use-cash', ...context, cashId, targetPlace }),
    nextQuestion: () => dispatch({ type: 'next-question', ...context }),
    previousQuestion: () => dispatch({ type: 'previous-question', ...context }),
    restart: () => dispatch({ type: 'restart', sessionId: session.sessionId, replacement: createPriceSession(crypto.randomUUID(), priceExercises) }),
  };
}
