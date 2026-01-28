import React from 'react';

import './PopUp.scss';

export default function PopUp({ result, onHome, onPlayAgain }) {
  return (
    <div className='Game-Body'>
      <div className='Game-Body-Popup'>
        <p className='Result-Text'>{result}</p>
        <div className='Game-Body-Popup-Buttons'>
          <button className='Button Button-Home' onClick={onHome}>
            Home
          </button>
          <button className='Button Button-Play' onClick={onPlayAgain}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
