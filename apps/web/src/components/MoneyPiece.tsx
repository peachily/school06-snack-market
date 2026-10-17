import { getCashLabel } from '../data/cash';
import type { Cash } from '../data/types';
import { AssetImage } from './AssetImage';

type MoneyPieceProps = { cash: Cash };

export function MoneyPiece({ cash }: MoneyPieceProps) {
  return (
    <div className="money-piece" data-kind={cash.kind} data-denomination={cash.denomination}>
      <AssetImage src={cash.imageSrc} alt={getCashLabel(cash)} />
    </div>
  );
}
