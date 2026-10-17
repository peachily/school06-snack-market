import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { cashCatalog } from '../data/cash';
import { MoneyPiece } from './MoneyPiece';

describe('현금 이미지', () => {
  it.each(cashCatalog)('$denomination원 이미지를 데이터에서 읽고 로드 실패를 처리한다', (cash) => {
    render(<MoneyPiece cash={cash} />);
    const label = `${cash.denomination.toLocaleString('ko-KR')}원 ${cash.kind === 'banknote' ? '지폐' : '동전'}`;
    const image = screen.getByRole('img', { name: label });
    expect(image).toHaveAttribute('src', cash.imageSrc);
    expect(image).toHaveAttribute('draggable', 'false');
    fireEvent.error(image);
    expect(screen.getByRole('img', { name: `${label} 이미지 없음` })).toBeInTheDocument();
  });
});
