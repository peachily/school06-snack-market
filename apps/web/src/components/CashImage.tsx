import type { Cash } from '../data/types';
import { AssetImage } from './AssetImage';

type CashImageProps = { cash: Cash };

export function CashImage({ cash }: CashImageProps) {
  const kindLabel = cash.kind === 'banknote' ? '지폐' : '동전';

  return <AssetImage src={cash.imageSrc} alt={`${cash.denomination.toLocaleString('ko-KR')}원 ${kindLabel}`} />;
}
