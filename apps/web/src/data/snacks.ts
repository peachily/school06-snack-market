export type Snack = Readonly<{
  id: string;
  name: string;
  imageSrc?: string;
}>;

export const previewSnack: Snack = {
  id: 'snack01',
  name: '과자 01',
  imageSrc: '/images/snacks/snack01.avif',
};
