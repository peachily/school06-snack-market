import type { Place as CorePlace } from '@snack-market/game-core';
import type { Place } from './types';

export const places = [
  { id: 'thousand', corePlace: 'thousands', label: '천' },
  { id: 'hundred', corePlace: 'hundreds', label: '백' },
  { id: 'ten', corePlace: 'tens', label: '십' },
  { id: 'one', corePlace: 'ones', label: '일' },
] as const satisfies readonly { id: Place; corePlace: CorePlace; label: string }[];
