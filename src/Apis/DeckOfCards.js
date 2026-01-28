// Creates a new unshuffled deck
export async function getDeck() {
  const response = await fetch('https://deckofcardsapi.com/api/deck/new/');
  const data = await response.json();
  return data.deck_id;
}

// Reshuffling the specified deck
export async function reShuffle(deckId) {
  const response = await fetch(
    `https://www.deckofcardsapi.com/api/deck/${deckId}/shuffle/`,
  );
  const data = await response.json();
  return data.deck_id;
}

// Draws random card(s) from the deck
export async function drawCard(deckId, count) {
  const response = await fetch(
    `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`,
  );
  const data = await response.json();
  return data.cards;
}

// Gets the back of a card
export async function getBackOfCard() {
  const response = await fetch(
    'https://www.deckofcardsapi.com/static/img/back.png',
  );
  return response.url;
}

// Gets the specified card image and adds it to cardImage
export async function getSpecificCard(cardCode) {
  try {
    const deckId = await getDeck();
    const drawAll = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`,
    );
    const drawAllJson = await drawAll.json();
    const findCard = drawAllJson.cards.find((card) => card.code === cardCode);
    console.log(findCard);
    return findCard;
  } catch (error) {
    console.error('Error fetching the card:', error);
  }
}

// Sets a timeout to wait before performing any other actions
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
