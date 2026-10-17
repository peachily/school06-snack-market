import { places } from '../data/places';

const slots = Array.from({ length: 9 }, (_, index) => index);

export function Wallet() {
  return (
    <section className="wallet" aria-label="지갑">
      <div className="wallet-band" aria-hidden="true" />
      <div className="wallet-sections">
        {places.map((place) => (
          <section className="wallet-section" data-place={place.id} key={place.id} aria-labelledby={`wallet-${place.id}`}>
            <h2 id={`wallet-${place.id}`}>{place.label}</h2>
            <div className="wallet-slots" aria-hidden="true">
              {slots.map((slot) => <div className="wallet-slot" key={slot} />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
