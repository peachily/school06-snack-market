import { createGameState } from '@snack-market/game-core';
import { snacks } from './data/snacks';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/app.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('앱을 표시할 루트 요소가 없습니다.');
}

const initialState = createGameState({ sessionId: crypto.randomUUID(), snackIds: snacks.map((snack) => snack.id), random: Math.random });

createRoot(root).render(
  <StrictMode>
    <App initialState={initialState} />
  </StrictMode>,
);
