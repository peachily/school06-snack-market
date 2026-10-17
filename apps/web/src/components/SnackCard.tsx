import { useState } from 'react';
import type { Snack } from '../data/snacks';

type SnackCardProps = { snack: Snack };

export function SnackCard({ snack }: SnackCardProps) {
  const [failedSource, setFailedSource] = useState<string>();
  const hasImage = snack.imageSrc && snack.imageSrc !== failedSource;

  return (
    <figure className="snack-card">
      <div className="snack-photo-row">
        <div className="snack-photo">
          {hasImage ? (
            <img
              src={snack.imageSrc}
              alt={snack.name}
              draggable={false}
              onError={() => setFailedSource(snack.imageSrc)}
            />
          ) : (
            <svg className="snack-placeholder" viewBox="0 0 80 64" role="img" aria-label="과자 이미지 없음">
              <rect x="4" y="4" width="72" height="56" rx="8" />
              <circle cx="26" cy="23" r="5" />
              <path d="m5 49 20-16 14 12 12-9 24 18" />
            </svg>
          )}
        </div>
        <div className="snack-next-space" aria-hidden="true" />
      </div>
      <figcaption>{snack.name}</figcaption>
    </figure>
  );
}
