import type { Snack } from '../data/types';
import { AssetImage } from './AssetImage';

type SnackCardProps = { snack: Snack };

export function SnackCard({ snack }: SnackCardProps) {
  return (
    <figure className="snack-card">
      <div className="snack-photo-row">
        <div className="snack-photo">
          <AssetImage src={snack.imageSrc} alt={snack.name} />
        </div>
        <div className="snack-next-space" aria-hidden="true" />
      </div>
      <figcaption>{snack.name}</figcaption>
    </figure>
  );
}
