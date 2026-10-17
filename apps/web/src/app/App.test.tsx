import * as gameCore from '@snack-market/game-core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('개발 환경', () => {
  it('앱을 React DOM에 표시한다', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '얼마일까요?' })).toBeInTheDocument();
  });

  it('workspace 패키지의 공개 진입점을 불러온다', () => {
    expect(gameCore).toBeDefined();
  });
});
