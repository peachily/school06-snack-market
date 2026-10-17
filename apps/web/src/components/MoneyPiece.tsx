import type { Cash } from '../data/types';
import { AssetImage } from './AssetImage';

type MoneyPieceProps = { cash: Cash };

export function MoneyPiece({ cash }: MoneyPieceProps) {
  const kindLabel = cash.kind === 'banknote' ? '지폐' : '동전';

  return (
    <div className="money-piece" data-kind={cash.kind} data-denomination={cash.denomination}>
      <AssetImage src={cash.imageSrc} alt={`${cash.denomination.toLocaleString('ko-KR')}원 ${kindLabel}`} />
    </div>
  );
}
