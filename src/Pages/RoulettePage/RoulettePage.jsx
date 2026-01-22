import React from "react";
import { Helmet } from "react-helmet";

import RouletteWheel from "../../Components/RouletteWheel";

import './RoulettePage.scss';

export default function RoulettePage() {
  return (
    <>
      <Helmet>
        <title>Roulette</title>
      </Helmet>
      <RouletteWheel onResult={(outcome) => console.log(`Landed on ${outcome.number} (${outcome.color})`)} />
    </>
  );
}