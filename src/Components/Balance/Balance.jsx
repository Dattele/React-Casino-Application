import React from 'react';

import './Balance.scss';

export default function Balance({ balance }) {
  return (
    <div className='Balance-Wrapper'>
      <div className='Balance'>
        <span className="Balance-Label">BALANCE</span>
        <span className="Balance-Amount">
          {balance}
        </span>
        </div>
    </div>
  )
}