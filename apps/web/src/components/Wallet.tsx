import { DraggableMoney } from './DraggableMoney';
import type { AvailableCash, CashInteraction } from '../hooks/useCashInteraction';
import { cashCatalog } from '../data/cash';
import { MoneyPiece } from './MoneyPiece';
import { places } from '../data/places';

const slots = Array.from({ length: 9 }, (_, index) => index);

export function Wallet({ cash, interaction }: { interaction?: CashInteraction; cash: readonly AvailableCash[] }) {
  return (
    <section className="wallet" aria-label="지갑">
      <div className="wallet-band" aria-hidden="true" />
      <div className="wallet-sections">
        {places.map((place) => {
          const metadata = cashCatalog.find((item) => item.place === place.id)!;
          const tokens = cash.filter((item) => item.place === place.corePlace);
          return (
            <section className="wallet-section" data-place={place.id} key={place.id} aria-labelledby={`wallet-${place.id}`}>
              <h2 id={`wallet-${place.id}`}>{place.label}</h2>
              <div className="wallet-slots">
                {slots.map((slot) => {
                  const token = tokens.find((item) => item.slotIndex === slot);
                  return <div className="wallet-slot" key={slot} data-slot-index={slot} data-cash-id={token?.id}>
                    {token && !token.used && (interaction ? <DraggableMoney token={token} cash={metadata} interaction={interaction} /> : <MoneyPiece cash={metadata} />)}
                  </div>;
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
