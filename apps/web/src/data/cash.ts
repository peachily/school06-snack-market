import type { Cash } from './types';

export const cashCatalog = [
  { id: 'cash1000', kind: 'banknote', denomination: 1000, place: 'thousand', imageSrc: '/images/money/1000.webp' },
  { id: 'cash100', kind: 'coin', denomination: 100, place: 'hundred', imageSrc: '/images/money/100.webp' },
  { id: 'cash10', kind: 'coin', denomination: 10, place: 'ten', imageSrc: '/images/money/10.webp' },
  { id: 'cash1', kind: 'coin', denomination: 1, place: 'one', imageSrc: '/images/money/1.webp' },
] as const satisfies readonly Cash[];
