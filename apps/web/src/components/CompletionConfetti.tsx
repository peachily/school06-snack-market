import { useEffect, type CSSProperties } from 'react';

const particles = Array.from({ length: 16 }, (_, index) => ({
  angle: (index / 16) * Math.PI * 2,
  color: ['thousand', 'hundred', 'ten', 'one'][index % 4],
}));

export function CompletionConfetti({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 1000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="completion-confetti" aria-hidden="true" onAnimationEnd={(event) => {
      if (event.target === event.currentTarget) onFinish();
    }}>
      {particles.map(({ angle, color }, index) => (
        <i key={index} data-place={color} style={{
          '--particle-x': `${Math.cos(angle) * 55}px`,
          '--particle-y': `${(index < 8 ? -1 : 1) * (8 + Math.abs(Math.sin(angle)) * 16)}px`,
          left: `${8 + (index % 8) * 12}%`,
          top: index < 8 ? '-12px' : 'calc(100% + 12px)',
        } as CSSProperties} />
      ))}
    </div>
  );
}
