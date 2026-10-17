import { createGameState, gameReducer, getCurrentQuestion } from '@snack-market/game-core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { snacks } from '../data/snacks';
import { App } from './App';

const fresh = () => createGameState({ sessionId: 'test', snackIds: snacks.map((snack) => snack.id), random: () => 0 });
afterEach(() => vi.restoreAllMocks());

describe('게임 화면 연결', () => {
  it('탭 선택과 키보드 이동을 연결한다', () => {
    render(<App initialState={fresh()} />);
    expect(screen.getByRole('heading', { name: '얼마일까요?' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '1' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: '2' }));
    expect(screen.getByRole('tab', { name: '2' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: '2' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: '3' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: '3' })).toHaveAttribute('aria-selected', 'true');
  });

  it('다시 시작 확인 취소 시 새 세션을 만들지 않는다', () => {
    render(<App initialState={fresh()} />);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const random = vi.spyOn(Math, 'random');
    const before = screen.getByRole('tabpanel').textContent;
    fireEvent.click(screen.getByRole('button', { name: '다시 시작' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(random).not.toHaveBeenCalled();
    expect(screen.getByRole('tabpanel').textContent).toBe(before);
  });

  it('확인 후 현재 학생만 다시 시작하고 다른 학생의 문제를 유지한다', () => {
    render(<App initialState={fresh()} />);
    const firstImage = within(screen.getByRole('tabpanel')).getAllByRole('img')[0].getAttribute('alt');
    fireEvent.click(screen.getByRole('tab', { name: '2' }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    fireEvent.click(screen.getByRole('button', { name: '다시 시작' }));
    expect(screen.getByRole('tab', { name: '2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('img', { name: '고구마깡' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '1' }));
    expect(within(screen.getByRole('tabpanel')).getAllByRole('img')[0]).toHaveAttribute('alt', firstImage);
  });

  it('완료한 문제에만 다음 버튼을 표시하고 클릭하면 새 문제로 이동한다', () => {
    let state = fresh();
    const student = state.students[1];
    const question = getCurrentQuestion(student);
    for (const cash of question.cash) state = gameReducer(state, { type: 'use-cash', studentId: 1, sessionId: student.sessionId, questionId: question.id, cashId: cash.id, targetPlace: cash.place });
    render(<App initialState={state} />);
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '꼬깔콘' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('0000원');
  });
});
