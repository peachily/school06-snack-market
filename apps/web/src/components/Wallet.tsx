import { DraggableMoney } from './DraggableMoney';
import type { CashInteraction } from '../hooks/useCashInteraction';
import type { CashToken } from '@snack-market/game-core';
import { cashCatalog } from '../data/cash';
import { MoneyPiece } from './MoneyPiece';
import { places } from '../data/places';

const slots = Array.from({ length: 9 }, (_, index) => index);

export function Wallet({ cash, interaction }: { interaction?: CashInteraction; cash: readonly (CashToken & { readonly used: boolean })[] }) {
  return (
    <section className="wallet" aria-label="지갑">
      <div className="wallet-band" aria-hidden="true" />
      <div className="wallet-sections">
        {places.map((place) => (
          <section className="wallet-section" data-place={place.id} key={place.id} aria-labelledby={`wallet-${place.id}`}>
            <h2 id={`wallet-${place.id}`}>{place.label}</h2>
            <div className="wallet-slots">
              {slots.map((slot) => {
                const token = cash.find((item) => item.place === place.corePlace && item.slotIndex === slot);
                const metadata = token && cashCatalog.find((item) => item.denomination === token.denomination);
                return <div className="wallet-slot" key={slot} data-slot-index={slot} data-cash-id={token?.id}>
                  {token && !token.used && metadata && (interaction ? <DraggableMoney token={token} cash={metadata} interaction={interaction} /> : <MoneyPiece cash={metadata} />)}
                </div>;
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
