import type { Snack } from '../data/types';
import { AssetImage } from './AssetImage';

type SnackCardProps = { snack: Snack; targetPrice?: number };

export function SnackCard({ snack, targetPrice }: SnackCardProps) {
  return (
    <figure className={`snack-card${targetPrice !== undefined ? ' snack-card-with-price' : ''}`}>
      <figcaption>{snack.name}</figcaption>
      <div className="snack-photo-row">
        <div className="snack-photo">
          <AssetImage src={snack.imageSrc} alt={snack.name} />
        </div>
        {targetPrice !== undefined && <div className="snack-price-space">
          <strong className="target-price" aria-label="목표 가격">{targetPrice}원</strong>
        </div>}
      </div>
    </figure>
  );
}
