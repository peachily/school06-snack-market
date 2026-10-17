import { createGameState, createStudentSession, gameReducer, getCurrentQuestion, getDisplayedDigits } from '@snack-market/game-core';
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

  it('완료된 문제도 다음 버튼을 표시하지 않고 구성한 숫자를 유지한다', () => {
    let state = fresh();
    const student = state.students[1];
    const question = getCurrentQuestion(student);
    for (const cash of question.cash) state = gameReducer(state, { type: 'use-cash', studentId: 1, sessionId: student.sessionId, questionId: question.id, cashId: cash.id, targetPlace: cash.place });
    render(<App initialState={state} />);
    expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '고래밥' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('1000원');
  });

  it('학생 전환 시 과자·숫자·사용한 현금 상태를 함께 복원한다', () => {
    let state = createGameState({ sessionId: 'progress', snackIds: snacks.map((snack) => snack.id), random: () => 0.4 });
    const first = state.students[1];
    const question = getCurrentQuestion(first);
    const token = question.cash[1];
    state = gameReducer(state, { type: 'use-cash', studentId: 1, sessionId: first.sessionId, questionId: question.id, cashId: token.id, targetPlace: token.place });
    const second = createStudentSession({ studentId: 2, sessionId: 'second', snackIds: snacks.map((snack) => snack.id), random: () => 0.8 });
    state = { ...state, students: { ...state.students, 2: second } };
    const { container, rerender } = render(<App initialState={state} />);
    const name = snacks.find((snack) => snack.id === question.snackId)!.name;
    const random = vi.spyOn(Math, 'random');
    expect(screen.getByRole('img', { name })).toBeInTheDocument();
    expect(container.querySelectorAll('.money-piece')).toHaveLength(question.cash.length - 1);
    fireEvent.click(screen.getByRole('tab', { name: '2' }));
    const secondName = snacks.find((snack) => snack.id === getCurrentQuestion(second).snackId)!.name;
    expect(screen.getByRole('img', { name: secondName })).toBeInTheDocument();
    expect(container.querySelectorAll('.money-piece')).toHaveLength(getCurrentQuestion(second).cash.length);
    fireEvent.click(screen.getByRole('tab', { name: '1' }));
    rerender(<App initialState={state} />);
    expect(screen.getByRole('img', { name })).toBeInTheDocument();
    expect(container.querySelectorAll('.money-piece')).toHaveLength(question.cash.length - 1);
    const digits = getDisplayedDigits(getCurrentQuestion(state.students[1]));
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent(`${digits.thousands}${digits.hundreds}${digits.tens}${digits.ones}원`);
    fireEvent.click(screen.getByRole('button', { name: '천의 자리' }));
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent(Object.values(digits).join('') + '원');
    expect(random).not.toHaveBeenCalled();
  });

});
