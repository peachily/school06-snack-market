import type { PriceExercise } from '@snack-market/game-core';
import { snacks } from './snacks';

export const priceExercises = [
  { snackId: 'snack01', price: 2000 },
  { snackId: 'snack15', price: 1000 },
  { snackId: 'snack03', price: 2300 },
  { snackId: 'snack16', price: 3000 },
  { snackId: 'snack02', price: 2100 },
  { snackId: 'snack17', price: 1900 },
  { snackId: 'snack04', price: 1050 },
  { snackId: 'snack18', price: 2030 },
  { snackId: 'snack05', price: 3500 },
  { snackId: 'snack19', price: 4200 },
  { snackId: 'snack09', price: 5280 },
  { snackId: 'snack20', price: 2307 },
  { snackId: 'snack06', price: 1850 },
  { snackId: 'snack21', price: 6020 },
  { snackId: 'snack10', price: 4900 },
  { snackId: 'snack22', price: 5230 },
  { snackId: 'snack07', price: 3090 },
  { snackId: 'snack23', price: 1550 },
  { snackId: 'snack11', price: 2070 },
  { snackId: 'snack24', price: 4805 },
  { snackId: 'snack08', price: 3165 },
  { snackId: 'snack25', price: 2008 },
  { snackId: 'snack12', price: 8105 },
  { snackId: 'snack26', price: 4782 },
  { snackId: 'snack13', price: 1005 },
  { snackId: 'snack27', price: 2250 },
  { snackId: 'snack14', price: 7386 },
  { snackId: 'snack28', price: 6027 },
  { snackId: 'snack29', price: 4063 },
  { snackId: 'snack30', price: 1905 },
] as const satisfies readonly PriceExercise[];

export function getPriceSnack(snackId: string) {
  const snack = snacks.find((item) => item.id === snackId)!;
  const name = snackId === 'snack27' ? '찰붕어빵' : snackId === 'snack28' ? '촉촉한초코칩' : snack.name;
  return { ...snack, name };
}
