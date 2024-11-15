import React, { useState, useEffect } from 'react';
import { getDeck, reShuffle, drawCard, getBackOfCard, sleep } from '../../Apis/DeckOfCards';
import './BlackJackGame.scss';

export default function BlackJackGame() {
  const [deckId, setDeckId] = useState(null);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [showDealersTotal, setShowDealersTotal] = useState(false);
  const [result, setResult] = useState('');
  const [backOfCardURL, setBackOfCardURL] = useState('');

  useEffect(() => {
    const setUpGame = async () => {
      const newDeckId = await getDeck();
      await reShuffle(newDeckId);
      setDeckId(newDeckId);

      const initialDealerHand = await drawCard(newDeckId, 2);
      const initialPlayerHand = await drawCard(newDeckId, 2);
      const backURL = await getBackOfCard();
      
      setDealerHand(initialDealerHand);
      setPlayerHand(initialPlayerHand);
      setBackOfCardURL(backURL);

      setPlayerTotal(calculateHandValue(initialPlayerHand));
      setDealerTotal(calculateHandValue(initialDealerHand));
    };
    setUpGame();
  }, []);

  const calculateHandValue = (hand) => {
    let handValue = 0;
    let aceCount = 0;
    hand.forEach(card => {
      if (card.value === "ACE") {
        aceCount++;
        handValue += 11;
      } else if (["JACK", "QUEEN", "KING"].includes(card.value)) {
        handValue += 10;
      } else {
        handValue += +card.value;
      }
    });

    while (handValue > 21 && aceCount > 0) {
      handValue -= 10;
      aceCount--;
    }

    return handValue;
  };

  const renderHand = (hand, isDealer) => {
    return hand.map((card, index) => (
      <img
        key={index}
        src={isDealer && index === 1 && !showDealersTotal ? backOfCardURL : card.image}
        alt={isDealer && index === 1 && !showDealersTotal ? 'Back of Card' : card.code}
        className={isDealer && index === 1 && !showDealersTotal ? 'hidden-card' : 'visible-card'}
      />
    ));
  };

  /* Handle the user hitting the hit button
   * If the user's score is under 22, draw a card 
   * and add it to his hand & score
   */
  const handleHit = async () => {
    const currentTotal = playerTotal;
    if (currentTotal < 22) {
      const newCard = await drawCard(deckId, 1);
      setPlayerHand((prevHand) => [...prevHand, ...newCard]);
      setPlayerTotal(calculateHandValue([...playerHand, ...newCard]));
    } else {
      alert("Your current score is over 21. You must stand.");
    }
  };

  // Handle the user hitting the stand button
  const handleStand = () => {
    setShowDealersTotal(true);
    dealerMoves();
  };

  /* Perform the moves for the dealer
     * Dealer doesn't draw if hand is at 17 or above, or if player busts
     * Draw a card until the dealer's total reaches 17
     */
  const dealerMoves = async () => {
    let currentTotal = dealerTotal;
    while (currentTotal < 17 && playerTotal <= 21) {
      const newCard = await drawCard(deckId, 1);
      await sleep(1000);
      setDealerHand((prevHand) => {
        const updatedHand = [...prevHand, ...newCard];
        currentTotal = calculateHandValue(updatedHand);
        setDealerTotal(calculateHandValue(updatedHand));
        return updatedHand;
      });
      await sleep(1000);
      if (currentTotal >= 17) {
        break;
      }
    }

    //determineWinner();
  }

// Determines who the winner of the game is
// const determineWinner = () => {
//     const playerTotal = calculateHandValue(playerHand);
//     const dealerTotal = calculateHandValue(dealerHand);
//     let gameResult;

//     if (playerTotal > 21) {
//         gameResult = `Player busts, Dealer wins with the score ${dealerTotal}!`;
//     } else if (dealerTotal > 21) {
//         gameResult = `Dealer busts, Player wins with the score ${playerTotal}!`;
//     } else if (playerTotal > dealerTotal) {
//         gameResult = `Player wins with the score ${playerTotal}!`;
//     } else if (playerTotal === dealerTotal) {
//         gameResult = "Sorry the house wins on draws.. Better luck next time Loser!!"
//     } else {
//         gameResult = `Dealer wins with the score ${dealerTotal}!`;
//     }

//     resultText.textContent = gameResult;
//     openPopupWindow(gamePopup);
// }

  return (
    <div className="Wrapper-Bg">
      <div className="Wrapper">
        <main className="Game">
          <h1>BlackJack</h1>
          <div className='Game Game-Header'>
            <div className="Game Game-Header Game-Header-Text">
              <h2>Dealer's Hand</h2>
            </div>
            <div className="Game Game-Header Game-Header-Images">
              {renderHand(dealerHand, true)}
            </div>
            <div className="Game Game-Header Game-Header-Text">
              {showDealersTotal && <p>Total: {dealerTotal}</p>}
            </div>
          </div>
          <div className="Game Game-Footer">
            <div className="Game Game-Footer Game-Footer-Text">
              <h2>Player's Hand</h2>
            </div>
            <div className="Game Game-Footer Game-Footer-Images">
              {renderHand(playerHand, false)}
            </div>
            <div className="Game Game-Header Game-Header-Text">
              <p>Total: {playerTotal}</p>
            </div>
            <div className="Game Game-Footer Game-Footer-Buttons">
              <button onClick={handleHit}>Hit</button>
              <button onClick={handleStand}>Stand</button>
            </div>
          </div>
          {result && <div className="Result">{result}</div>}
        </main>
      </div>
    </div>
  );
}