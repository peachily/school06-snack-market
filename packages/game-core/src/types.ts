export type Level = 1 | 2 | 3;
export type StudentId = Level;
export type RandomSource = () => number;
export type Place = 'thousands' | 'hundreds' | 'tens' | 'ones';
export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SlotIndex = Exclude<Digit, 9>;
export type Digits = Readonly<Record<Place, Digit>>;

export type CashToken = Readonly<{
  id: string;
  place: Place;
  denomination: 1000 | 100 | 10 | 1;
  slotIndex: SlotIndex;
}>;

export type Question = Readonly<{
  id: string;
  snackId: string;
  targetPrice: number;
  targetDigits: Digits;
  cash: readonly CashToken[];
}>;
