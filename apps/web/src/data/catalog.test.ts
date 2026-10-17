import { describe, expect, it } from 'vitest';
import { cashCatalog } from './cash';
import { isImagePath } from './imagePath';
import { snacks } from './snacks';

describe('확정 자산 목록', () => {
  it('과자 30종의 번호, 이름, ID, 경로를 순서대로 연결한다', () => {
    const expectedNames = [
      '고구마깡',
      '고래밥',
      '꼬깔콘',
      '돼지바',
      '마가렛트',
      '마이쮸',
      '말랑카우',
      '메로나',
      '몽쉘',
      '바나나우유',
      '바나나킥',
      '버터와플',
      '붕어싸만코',
      '빠다코코낫',
      '빵또아',
      '빼빼로',
      '수박바',
      '양파링',
      '엄마손파이',
      '오감자',
      '오뜨',
      '요맘때',
      '월드콘',
      '자두바',
      '죠스바',
      '짜요짜요',
      '참붕어빵',
      '촉촉한 초코칩',
      '카스타드',
      '칸쵸',
    ];
    expect(snacks).toHaveLength(30);
    expect(new Set(snacks.map((snack) => snack.id)).size).toBe(30);
    expect(snacks.map((snack) => snack.name)).toEqual(expectedNames);
    snacks.forEach((snack, index) => {
      const number = String(index + 1).padStart(2, '0');
      expect(snack.number).toBe(index + 1);
      expect(snack.id).toBe(`snack${number}`);
      expect(snack.imageSrc).toBe(`/images/snacks/snack-${number}.avif`);
      expect(isImagePath(snack.imageSrc)).toBe(true);
      expect(snack).not.toHaveProperty('price');
    });
  });

  it('현금은 지정한 네 자리와 액면가, 종류, 경로만 포함한다', () => {
    expect(cashCatalog).toHaveLength(4);
    expect(new Set(cashCatalog.map((cash) => cash.id)).size).toBe(4);
    expect(cashCatalog.map(({ kind, denomination, place }) => [kind, denomination, place])).toEqual([
      ['banknote', 1000, 'thousand'],
      ['coin', 100, 'hundred'],
      ['coin', 10, 'ten'],
      ['coin', 1, 'one'],
    ]);
    cashCatalog.forEach((cash) => {
      expect(cash.imageSrc).toBe(`/images/money/${cash.denomination}.webp`);
      expect(isImagePath(cash.imageSrc)).toBe(true);
    });
  });
});
