import type { Place } from './types';

export const places = [
  { id: 'thousand', label: '천' },
  { id: 'hundred', label: '백' },
  { id: 'ten', label: '십' },
  { id: 'one', label: '일' },
] as const satisfies readonly { id: Place; label: string }[];
