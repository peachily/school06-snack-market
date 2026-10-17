import { createCashTokens } from '@snack-market/game-core';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Wallet } from './Wallet';

describe('고정 현금 슬롯', () => {
  it('9999원의 현금 36개를 자리마다 9개의 고정 슬롯에 표시한다', () => {
    const cash = createCashTokens(9999, 'q1').map((token) => ({ ...token, used: false }));
    render(<Wallet cash={cash} />);
    for (const label of ['천', '백', '십', '일']) {
      const region = screen.getByRole('region', { name: label });
      expect(within(region).getAllByRole('img')).toHaveLength(9);
      expect(region.querySelectorAll('.wallet-slot')).toHaveLength(9);
    }
    expect(screen.getAllByRole('img')).toHaveLength(36);
  });

  it('중간 현금 사용 후 빈 슬롯과 나머지 현금의 DOM 위치를 유지한다', () => {
    const cash = createCashTokens(3000, 'q1').map((token) => ({ ...token, used: false }));
    const { rerender } = render(<Wallet cash={cash} />);
    const region = screen.getByRole('region', { name: '천' });
    const slots = Array.from(region.querySelectorAll('.wallet-slot'));
    const lastImage = slots[2].querySelector('img');
    rerender(<Wallet cash={cash.map((token) => ({ ...token, used: token.slotIndex === 1 }))} />);
    expect(region.querySelectorAll('.wallet-slot')).toHaveLength(9);
    expect(slots[1]).toBeEmptyDOMElement();
    expect(slots[2].querySelector('img')).toBe(lastImage);
    expect(region.querySelectorAll('.wallet-slot')[2]).toBe(slots[2]);
    for (const label of ['백', '십', '일']) {
      expect(within(screen.getByRole('region', { name: label })).queryByRole('img')).toBeNull();
    }
  });
});
