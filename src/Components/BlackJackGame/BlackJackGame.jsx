import React, { useState, useCallback, useReducer, useMemo } from 'react';
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
import { ReactComponent as RedChip } from '../../Assets/Images/RedChip.svg';
import { ReactComponent as BlueChip } from '../../Assets/Images/BlueChip.svg';
import { ReactComponent as GreenChip } from '../../Assets/Images/GreenChip.svg';
import { ReactComponent as BlackChip } from '../../Assets/Images/BlackChip.svg';

import './BlackJackGame.scss';

const CHIP_DEFINITIONS = {
  Red: {
    value: 5,
    label: '$5',
    Component: RedChip,
  },
  Blue: {
    value: 10,
    label: '$10',
    Component: BlueChip,
  },
  Green: {
    value: 25,
    label: '$25',
    Component: GreenChip,
  },
  Black: {
    value: 100,
    label: '$100',
    Component: BlackChip,
  },
};

export default function BlackJackGame() {
  const { add, subtract, balance } = useBalance();

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
    phase: 'betting',
    betStack: [],
    handBet: 0,
    hasActed: false,
  };

  const BlackJackReducer = (state, action) => {
    switch (action.type) {
      case 'HANDLE_HIT': {
        const { updatedHand, newTotal } = action.payload;
        return {
          ...state,
          playerHand: updatedHand,
          playerTotal: newTotal,
          hasActed: true,
        };
      }
      case 'HANDLE_STAND': {
        return {
          ...state,
          showDealersTotal: true,
          hasActed: true,
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
          phase: 'result',
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
          betAmount,
        } = action.payload;

        return {
          ...state,
          deckId: newDeckId,
          dealerHand: initialDealerHand,
          playerHand: initialPlayerHand,
          backOfCardURL: backURL,
          playerTotal: playerStartTotal,
          dealerTotal: dealerStartTotal,
          phase: 'playing',
          hasActed: false,
          handBet: betAmount,
        };
      }
      case 'RESET_GAME': {
        return {
          ...initialState,
        };
      }
      case 'ADD_BET_CHIP': {
        const { id, type } = action.payload;
        return {
          ...state,
          betStack: [...state.betStack, { id, type }],
        };
      }

      case 'REMOVE_BET_CHIP': {
        const { chipId } = action.payload;
        return {
          ...state,
          betStack: state.betStack.filter((c) => c.id !== chipId),
        };
      }

      case 'CLEAR_BET': {
        return {
          ...state,
          betStack: [],
        };
      }

      case 'SET_HAND_BET': {
        const { doubleBet } = action.payload;
        return { ...state, handBet: doubleBet };
      }

      default: {
        return state;
      }
    }
  };

  const [state, dispatch] = useReducer(BlackJackReducer, {
    ...initialState,
  });

  const betAmount = useMemo(() => {
    return state.betStack.reduce(
      (sum, chip) => sum + CHIP_DEFINITIONS[chip.type].value,
      0,
    );
  }, [state.betStack]);

  const navigate = useNavigate();

  // Function that navigates to home page
  const handleHomeClick = () => {
    navigate('/');
  };

  // Function for when user wants to play again
  const handlePlayAgainClick = () => {
    resetGame();
  };

  // Can the user double
  const canDouble =
    state.phase === 'playing' &&
    !state.hasActed &&
    state.playerHand.length === 2 &&
    balance >= state.handBet;

  // Add a chip to the bet
  const addToBet = (type) => {
    if (state.phase !== 'betting') return; // Don't allow changes mid-hand

    const chip = CHIP_DEFINITIONS[type];
    if (balance < chip.value) return; // Make sure user has enough balance

    subtract(chip.value);

    const id = crypto.randomUUID();
    dispatch({
      type: 'ADD_BET_CHIP',
      payload: { id, type },
    });
  };

  // Remove a chip from the bet
  const removeFromBet = (chipId) => {
    if (state.phase !== 'betting') return;

    const chipEntry = state.betStack.find((c) => c.id === chipId);
    if (!chipEntry) return;

    add(CHIP_DEFINITIONS[chipEntry.type].value);

    dispatch({
      type: 'REMOVE_BET_CHIP',
      payload: { chipId },
    });
  };

  // Clear the whole bet
  const clearBet = () => {
    if (state.phase !== 'betting') return;

    // refund everything
    if (betAmount > 0) add(betAmount);

    dispatch({ type: 'CLEAR_BET' });
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
  const handleDealer = async (finalPlayerTotal) => {
    if (finalPlayerTotal > 21) {
      determineWinner(finalPlayerTotal, state.dealerTotal);
      return;
    }

    let newTotal = state.dealerTotal;

    const dealerMoves = async () => {
      let updatedHand = [...state.dealerHand];
      while (newTotal < 17 && finalPlayerTotal <= 21) {
        const newCard = await drawCard(state.deckId, 1);
        updatedHand = [...updatedHand, ...newCard];
        newTotal = calculateHandValue(updatedHand);
        await sleep(2000);

        dispatch({
          type: 'SET_DEALER_HAND',
          payload: { updatedHand, newTotal },
        });
      }

      await sleep(1000);
      determineWinner(finalPlayerTotal, newTotal);
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
      if (newTotal === 21) {
        handleStand(newTotal);
      }

      if (newTotal > 21) {
        dispatch({ type: 'HANDLE_STAND' }); // UI reveal
        determineWinner(newTotal, state.dealerTotal);
      }
    }
  };

  // Handle the user hitting the stand button
  // Dealer then plays if player did not bust
  const handleStand = (finalPlayerTotal = state.playerTotal) => {
    dispatch({
      type: 'HANDLE_STAND',
    });

    console.log('Player Total in HandleStand', finalPlayerTotal);
    handleDealer(finalPlayerTotal);
  };

  /*
   * Handle the user hitting the double button
   * Only can be hit at the start of the turn
   * Can only draw one card - then it ends your turn
   */
  const handleDouble = async () => {
    if (!canDouble) return;
    console.log('handBet', state.handBet);
    // Take the additional wager
    subtract(state.handBet);

    // Double the hand bet
    const doubleBet = state.handBet * 2;
    console.log('doubleBet', doubleBet);
    dispatch({
      type: 'SET_HAND_BET',
      payload: { doubleBet },
    });
    console.log('updated handBet', state.handBet);
    // Player draws only one card
    const newCard = await drawCard(state.deckId, 1);
    const updatedHand = [...state.playerHand, ...newCard];
    const newTotal = calculateHandValue(updatedHand);

    dispatch({
      type: 'HANDLE_HIT',
      payload: { updatedHand, newTotal },
    });

    await sleep(1000);
    handleStand(newTotal);
  };

  /*
   * Handle the user hitting the split button
   * Can only be done when user has two of the same cards
   */
  // const handleSplit = () => {};

  // Determines who the winner of the game is
  const determineWinner = (playerTotal, dealerTotal) => {
    let gameResult;
    const wager = state.handBet;
    console.log('player total', playerTotal);
    console.log('dealer total', dealerTotal);
    if (playerTotal > 21) {
      gameResult = `Player busts, losing $${wager}, Dealer wins with the score ${dealerTotal}!`;
    } else if (dealerTotal > 21) {
      gameResult = `Dealer busts, Player wins $${wager * 2} with the score ${playerTotal}!!`;
      add(wager * 2);
    } else if (playerTotal > dealerTotal) {
      gameResult = `Player wins $${wager * 2} with the score ${playerTotal}!!`;
      add(wager * 2);
    } else if (playerTotal === dealerTotal) {
      gameResult = `Tie Game! Take your chips back - $${wager}.`;
      add(wager);
    } else {
      gameResult = `Dealer wins with the score ${dealerTotal}! Player loses $${wager}.. better luck next time!`;
    }

    dispatch({
      type: 'SET_RESULT',
      payload: { gameResult },
    });
  };

  // Function for setting up the game
  const setUpGame = async () => {
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
        betAmount,
      },
    });
  };

  // Resets the game
  const resetGame = () => {
    dispatch({
      type: 'RESET_GAME',
    });
  };

  return (
    <div className='Wrapper-Bg'>
      <div className='Wrapper'>
        <div className='Side-Wrapper'>
          <Balance balance={0} />
          <Chips
            onDeal={setUpGame}
            chips={CHIP_DEFINITIONS}
            betAmount={betAmount}
            betStack={state.betStack}
            addToBet={addToBet}
            removeFromBet={removeFromBet}
            disabled={state.phase !== 'betting'}
          />
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
              <div className='Hit-Stand-Container'>
                <button
                  className='Button Button-Game-Footer'
                  onClick={handleHit}
                  disabled={state.phase !== 'playing'}
                >
                  Hit
                </button>
                <button
                  className='Button Button-Game-Footer'
                  onClick={() => handleStand(state.playerTotal)}
                  disabled={state.phase !== 'playing'}
                >
                  Stand
                </button>
              </div>
              <div className='Double-Split-Container'>
                <button
                  className='Button Button-Game-Footer'
                  onClick={handleDouble}
                  disabled={!canDouble}
                >
                  Double
                </button>
                {/* <button
                  className='Button Button-Game-Footer'
                  onClick={handleSplit}
                  disabled={state.phase !== 'playing'}
                >
                  Split
                </button> */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
