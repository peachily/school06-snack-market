export type Place = 'thousand' | 'hundred' | 'ten' | 'one';

export type Snack = Readonly<{
  id: string;
  number: number;
  name: string;
  imageSrc: string;
}>;

export type Cash = Readonly<{
  id: string;
  imageSrc: string;
} & (
  | { kind: 'banknote'; denomination: 1000; place: 'thousand' }
  | { kind: 'coin'; denomination: 100; place: 'hundred' }
  | { kind: 'coin'; denomination: 10; place: 'ten' }
  | { kind: 'coin'; denomination: 1; place: 'one' }
)>;
