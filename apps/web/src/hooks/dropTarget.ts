import type { Place } from '@snack-market/game-core';

export type DropArea = Readonly<{ place: Place; left: number; right: number; top: number; bottom: number }>;

export function findDropPlace(point: { x: number; y: number }, areas: readonly DropArea[]): Place | null {
  const matches = areas.filter((area) => point.x >= area.left && point.x <= area.right
    && point.y >= area.top && point.y <= area.bottom);
  return matches.length === 1 ? matches[0].place : null;
}
