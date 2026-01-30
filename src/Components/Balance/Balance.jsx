import React from 'react';

import { useBalance } from '../../Context/BalanceContext';

import './Balance.scss';

export default function Balance() {
  const { balance } = useBalance();
  return (
    <div className='Balance-Wrapper'>
      <div className='Balance'>
        <span className='Balance-Label'>BALANCE</span>
        <span className='Balance-Amount'>${balance.toString()}</span>
      </div>
    </div>
  );
}
