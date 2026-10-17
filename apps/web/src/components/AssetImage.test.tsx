import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AssetImage } from './AssetImage';

describe('공통 자산 이미지', () => {
  it.each([undefined, '', '/images/../private.png', 'https://example.com/image.png', '/images/broken.svg'])('잘못된 경로 %s를 요청하지 않는다', (src) => {
    const { container } = render(<AssetImage src={src} alt="과자" />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: '과자 이미지 없음' })).toBeInTheDocument();
  });

  it('로드 실패 후 플레이스홀더를 표시하고 새 이미지 경로에서는 다시 로드한다', () => {
    const { rerender } = render(<AssetImage src="/images/snacks/first.avif" alt="과자" />);
    fireEvent.error(screen.getByRole('img', { name: '과자' }));
    expect(screen.getByRole('img', { name: '과자 이미지 없음' })).toBeInTheDocument();
    rerender(<AssetImage src="/images/snacks/second.avif" alt="새 과자" />);
    expect(screen.getByRole('img', { name: '새 과자' })).toHaveAttribute('src', '/images/snacks/second.avif');
    rerender(<AssetImage src="/images/snacks/first.avif" alt="과자" />);
    expect(screen.getByRole('img', { name: '과자' })).toHaveAttribute('src', '/images/snacks/first.avif');
  });
});
