import React, { useState, useMemo } from 'react';

import { useBalance } from '../../Context/BalanceContext';

import { ReactComponent as RedChip } from '../../Assets/Images/RedChip.svg';
import { ReactComponent as BlueChip } from '../../Assets/Images/BlueChip.svg';
import { ReactComponent as GreenChip } from '../../Assets/Images/GreenChip.svg';
import { ReactComponent as BlackChip } from '../../Assets/Images/BlackChip.svg';

import './Chips.scss';

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

export default function Chips() {
  const { balance, add, subtract } = useBalance();
  const [betStack, setBetStack] = useState([]);

  const betAmount = useMemo(() => {
    return betStack.reduce(
      (sum, chip) => sum + CHIP_DEFINITIONS[chip.type].value,
      0,
    );
  }, [betStack]);

  // Add a chip to the bet
  const addToBet = (type) => {
    const chip = CHIP_DEFINITIONS[type];

    if (balance < chip.value) return; // Make sure user has enough balance

    subtract(chip.value);

    setBetStack((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
      },
    ]);
  };

  // Remove a chip from the bet
  const removeFromBet = (chipId) => {
    setBetStack((prev) => {
      const chip = prev.find((c) => c.id === chipId);
      if (!chip) return prev; // Can not find chip id

      add(CHIP_DEFINITIONS[chip.type].value);

      return prev.filter((c) => c.id !== chipId);
    });
  };

  return (
    <div className='Chips-Wrapper'>
      <div className='Chips'>
        {Object.entries(CHIP_DEFINITIONS).map(([type, chip]) => (
          <div key={type} className={`Chip-${type}`}>
            <button onClick={() => addToBet(type)}>
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
          const ChipSvg = CHIP_DEFINITIONS[chip.type].Component;
          return (
            <div key={chip.id} className={`Bet-Chip-${chip.type}`}>
              <button
                onClick={() => removeFromBet(chip.id)}
                title='Remove chip'
              >
                <ChipSvg />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
