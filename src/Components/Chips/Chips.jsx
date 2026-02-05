import React from 'react';

import './Chips.scss';

export default function Chips({
  onDeal,
  chips,
  betAmount,
  betStack,
  addToBet,
  removeFromBet,
  disabled,
}) {
  return (
    <div className='Chips-Wrapper'>
      <div className='Chips'>
        {Object.entries(chips).map(([type, chip]) => (
          <div key={type} className={`Chip-${type}`}>
            <button onClick={() => addToBet(type)} disabled={disabled}>
              <chip.Component />
            </button>
            <span>{chip.label}</span>
          </div>
        ))}
      </div>

      <div className='Bet-Balance'>
        <span>Current Bet: {betAmount}</span>
      </div>

      <div className='Bet-Stack'>
        {betStack.map((chip) => {
          const ChipSvg = chips[chip.type].Component;
          return (
            <div key={chip.id} className={`Bet-Chip-${chip.type}`}>
              <button
                onClick={() => removeFromBet(chip.id)}
                title='Remove chip'
                disabled={disabled}
              >
                <ChipSvg />
              </button>
            </div>
          );
        })}
      </div>

      <button
        className='Button Button-Place-Bet'
        onClick={onDeal}
        disabled={disabled || betAmount <= 0}
      >
        Deal (${betAmount})
      </button>
    </div>
  );
}
