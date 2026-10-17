import { places } from '../data/places';

export function PriceDigits() {
  return (
    <div className="price-digits" role="group" aria-label="만든 금액">
      <div className="digit-track">
        {places.map((place) => (
          <div className="digit-position" key={place.id}>
            <span className="digit-box" data-place={place.id}>0</span>
          </div>
        ))}
      </div>
      <span className="price-unit">원</span>
    </div>
  );
}
