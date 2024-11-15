import React from "react";
import { Helmet } from "react-helmet";
import './CasinoPage.scss';

export default function CasinoPage() {
  return (
    <>
      <Helmet>
        <title>Casino</title>
      </Helmet>
      <main className="Card">
        <div className="Card Card-Body">
          <h1>Logan's Casino</h1>
          <button className="Button">BlackJack</button>
          <button className="Button">Roulette</button>
          <button className="Button">Texas Hold'em</button>
          <button className="Button">Slot Machine</button>
          <img className="Card-Image" alt="Jack of Spades" />
        </div>
      </main>
    </>
  );
}
