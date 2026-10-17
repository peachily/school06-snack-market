import type { Digits } from '@snack-market/game-core';
import { places } from '../data/places';

export function PriceDigits({ digits }: { digits: Digits }) {
  return (
    <div className="price-digits" role="group" aria-label="만든 금액">
      <div className="digit-track">
        {places.map((place) => (
          <div className="digit-position" key={place.id}>
            <span className="digit-box" data-place={place.id}>{digits[place.corePlace]}</span>
          </div>
        ))}
      </div>
      <span className="price-unit">원</span>
    </div>
  );
}
