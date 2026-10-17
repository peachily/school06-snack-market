import { describe, expect, it } from 'vitest';
import { findDropPlace, type DropArea } from './dropTarget';

const areas: DropArea[] = [
  { place: 'thousands', left: 10, right: 110, top: 20, bottom: 100 },
  { place: 'hundreds', left: 130, right: 230, top: 20, bottom: 100 },
];
describe('실제 포인터 위치로 드롭 판정', () => {
  it('영역 내부와 경계만 허용한다', () => {
    expect(findDropPlace({ x: 10, y: 20 }, areas)).toBe('thousands');
    expect(findDropPlace({ x: 180, y: 50 }, areas)).toBe('hundreds');
  });
  it('가장 가까워도 영역 밖이나 칸 사이면 거부한다', () => {
    for (const point of [{ x: 9, y: 50 }, { x: 120, y: 50 }, { x: 50, y: 101 }]) {
      expect(findDropPlace(point, areas)).toBeNull();
    }
  });
  it('잘못 겹친 영역에서는 임의의 칸을 선택하지 않는다', () => {
    expect(findDropPlace({ x: 50, y: 50 }, [...areas, { ...areas[0], place: 'ones' }])).toBeNull();
  });
});
