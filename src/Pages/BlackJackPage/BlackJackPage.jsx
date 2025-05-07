import React from "react";
import { Helmet } from "react-helmet";

import BlackJackGame from "../../Components/BlackJackGame";

import './BlackJackPage.scss';

export default function BlackJackPage() {
  return (
    <>
      <Helmet>
        <title>BlackJack</title>
      </Helmet>
      <BlackJackGame />
    </>
  );
}