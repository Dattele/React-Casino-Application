import React, { useCallback, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDeck,
  reShuffle,
  drawCard,
  getBackOfCard,
  sleep,
} from '../../Apis/DeckOfCards';

import Balance from '../Balance';
import Chips from '../Chips';
import { useBalance } from '../../Context/BalanceContext';
import PopUp from '../PopUp/PopUp';

import './BlackJackGame.scss';

export default function BlackJackGame() {
  const { add, subtract } = useBalance();

  // Function to calculate the total value of a hand
  const calculateHandValue = (hand) => {
    let aceCount = 0;
    const handValue = hand.reduce((total, card) => {
      if (card.value === 'ACE') {
        aceCount++;
        return total + 11;
      } else if (['JACK', 'QUEEN', 'KING'].includes(card.value)) {
        return total + 10;
      } else {
        return total + Number(card.value);
      }
    }, 0);

    let adjustedValue = handValue;
    while (adjustedValue > 21 && aceCount > 0) {
      adjustedValue -= 10;
      aceCount--;
    }

    return adjustedValue;
  };

  const initialState = {
    deckId: null,
    dealerHand: [],
    playerHand: [],
    dealerTotal: 0,
    playerTotal: 0,
    showDealersTotal: false,
    result: '',
    isPopupVisible: false,
    backOfCardURL: '',
  };

  const BlackJackReducer = (state, action) => {
    switch (action.type) {
      case 'HANDLE_HIT': {
        const { updatedHand, newTotal } = action.payload;
        return {
          ...state,
          playerHand: updatedHand,
          playerTotal: newTotal,
        };
      }
      case 'HANDLE_STAND': {
        return {
          ...state,
          showDealersTotal: true,
        };
      }
      case 'SET_DEALER_HAND': {
        const { updatedHand, newTotal } = action.payload;

        return {
          ...state,
          dealerHand: updatedHand,
          dealerTotal: newTotal,
        };
      }
      case 'SET_RESULT': {
        const { gameResult } = action.payload;
        return {
          ...state,
          result: gameResult,
          isPopupVisible: true,
        };
      }
      case 'SET_UP_GAME': {
        const {
          newDeckId,
          initialDealerHand,
          initialPlayerHand,
          backURL,
          playerStartTotal,
          dealerStartTotal,
        } = action.payload;

        return {
          ...state,
          deckId: newDeckId,
          dealerHand: initialDealerHand,
          playerHand: initialPlayerHand,
          backOfCardURL: backURL,
          playerTotal: playerStartTotal,
          dealerTotal: dealerStartTotal,
        };
      }
      case 'RESET_GAME': {
        return {
          deckId: null,
          dealerHand: [],
          playerHand: [],
          dealerTotal: 0,
          playerTotal: 0,
          showDealersTotal: false,
          result: '',
          isPopupVisible: false,
          backOfCardURL: '',
        };
      }
      default: {
        return state;
      }
    }
  };

  const [state, dispatch] = useReducer(BlackJackReducer, {
    ...initialState,
  });

  const navigate = useNavigate();

  // Function that navigates to home page
  const handleHomeClick = () => {
    navigate('/');
  };

  // Function for when user wants to play again
  const handlePlayAgainClick = () => {
    resetGame();
    setUpGame();
  };

  // Function for setting up the player and dealers hands
  const renderHand = (hand, isDealer) => {
    return hand.map((card, index) => (
      <img
        key={index}
        src={
          isDealer && index === 1 && !state.showDealersTotal
            ? state.backOfCardURL
            : card.image
        }
        alt={
          isDealer && index === 1 && !state.showDealersTotal
            ? 'Back of Card'
            : card.code
        }
        className={
          isDealer && index === 1 && !state.showDealersTotal
            ? 'hidden-card'
            : 'visible-card'
        }
      />
    ));
  };

  /* Handle the dealer logic
   * Dealer doesn't draw if hand is at 17 or above, or if player busts
   * Draw a card until the dealer's total reaches 17
   */
  const handleDealer = async () => {
    let newTotal = state.dealerTotal;

    const dealerMoves = async () => {
      let updatedHand = [...state.dealerHand];
      console.log('dealers newTotal', newTotal);
      console.log('dealers player total', state.playerTotal);

      while (newTotal < 17 && state.playerTotal <= 21) {
        const newCard = await drawCard(state.deckId, 1);
        updatedHand = [...updatedHand, ...newCard];
        newTotal = calculateHandValue(updatedHand);
        await sleep(2000);

        dispatch({
          type: 'SET_DEALER_HAND',
          payload: { newCard, updatedHand, newTotal },
        });
      }

      await sleep(1000);
      determineWinner(state.playerTotal, newTotal);
    };

    dealerMoves();
  };

  /* Handle the user hitting the hit button
   * If the user's score is under 22, draw a card
   * and add it to his hand & score
   */
  const handleHit = async () => {
    console.log('player total before hit', state.playerTotal);
    const currentTotal = state.playerTotal;
    if (currentTotal < 22) {
      const newCard = await drawCard(state.deckId, 1);
      const updatedHand = [...state.playerHand, ...newCard];
      const newTotal = calculateHandValue(updatedHand);

      dispatch({
        type: 'HANDLE_HIT',
        payload: { newCard, updatedHand, newTotal },
      });

      await sleep(1000);
      if (newTotal > 20) {
        handleStand();
      }
    }
  };

  // Handle the user hitting the stand button
  // Dealer then plays if player did not bust
  const handleStand = () => {
    dispatch({
      type: 'HANDLE_STAND',
    });

    handleDealer();
  };

  //Determines who the winner of the game is
  const determineWinner = (playerTotal, dealerTotal) => {
    let gameResult;
    console.log('player total', playerTotal);
    console.log('dealer total', dealerTotal);
    if (playerTotal > 21) {
      gameResult = `Player busts, Dealer wins with the score ${dealerTotal}!`;
    } else if (dealerTotal > 21) {
      gameResult = `Dealer busts, Player wins with the score ${playerTotal}!`;
    } else if (playerTotal > dealerTotal) {
      gameResult = `Player wins with the score ${playerTotal}!`;
    } else if (playerTotal === dealerTotal) {
      gameResult = 'Tie Game! Take your chips back.';
    } else {
      gameResult = `Dealer wins with the score ${dealerTotal}!`;
    }

    dispatch({
      type: 'SET_RESULT',
      payload: { gameResult },
    });
  };

  // Function for setting up the game
  const setUpGame = useCallback(async () => {
    const newDeckId = await getDeck();
    await reShuffle(newDeckId);

    const initialDealerHand = await drawCard(newDeckId, 2);
    const initialPlayerHand = await drawCard(newDeckId, 2);
    const backURL = await getBackOfCard();

    const playerStartTotal = calculateHandValue(initialPlayerHand);
    const dealerStartTotal = calculateHandValue(initialDealerHand);

    dispatch({
      type: 'SET_UP_GAME',
      payload: {
        newDeckId,
        initialDealerHand,
        initialPlayerHand,
        backURL,
        playerStartTotal,
        dealerStartTotal,
      },
    });
  }, []);

  // Resets the game
  const resetGame = () => {
    dispatch({
      type: 'RESET_GAME',
    });
  };

  // Sets up the game
  // useEffect(() => {
  //   setUpGame();
  // }, [setUpGame]);

  return (
    <div className='Wrapper-Bg'>
      <div className='Wrapper'>
        <div className='Side-Wrapper'>
          <Balance balance={0} />
          <Chips />
        </div>
        <main className='Game Game-Wrapper'>
          <h1>BlackJack</h1>
          <div className='Game Game-Header'>
            <div className='Game Game-Header Game-Header-Text'>
              <h2>Dealer's Hand</h2>
            </div>
            <div className='Game Game-Header Game-Header-Images'>
              {renderHand(state.dealerHand, true)}
            </div>
            <div className='Game Game-Header Game-Header-Text'>
              {state.showDealersTotal && <p>Total: {state.dealerTotal}</p>}
            </div>
          </div>
          {state.isPopupVisible && (
            <PopUp
              result={state.result}
              onHome={handleHomeClick}
              onPlayAgain={handlePlayAgainClick}
            />
          )}
          <div className='Game Game-Footer'>
            <div className='Game Game-Footer Game-Footer-Text'>
              <h2>Player's Hand</h2>
            </div>
            <div className='Game Game-Footer Game-Footer-Images'>
              {renderHand(state.playerHand, false)}
            </div>
            <div className='Game Game-Header Game-Header-Text'>
              <p>Total: {state.playerTotal}</p>
            </div>
            <div className='Game Game-Footer Game-Footer-Buttons'>
              <button className='Button Button-Game-Footer' onClick={handleHit}>
                Hit
              </button>
              <button
                className='Button Button-Game-Footer'
                onClick={handleStand}
              >
                Stand
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
