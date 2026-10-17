import type { Snack } from '../data/types';
import { AssetImage } from './AssetImage';

type SnackCardProps = { snack: Snack; onNext?: () => void };

export function SnackCard({ snack, onNext }: SnackCardProps) {
  return (
    <figure className="snack-card">
      <div className="snack-photo-row">
        <div className="snack-photo">
          <AssetImage src={snack.imageSrc} alt={snack.name} />
        </div>
        <div className="snack-next-space">
          {onNext && <button type="button" className="next-button" aria-label="다음 문제" onClick={onNext}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4 20 12 8 20Z" /></svg>
          </button>}
        </div>
      </div>
      <figcaption>{snack.name}</figcaption>
    </figure>
  );
}
