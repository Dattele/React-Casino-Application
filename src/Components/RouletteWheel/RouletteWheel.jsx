import React, { useRef, useState } from 'react';
import './RouletteWheel.scss';
import WheelNumbers from './Components/WheelNumbers';

const NUMBERS = WheelNumbers.length;
const ANGLE = 360 / NUMBERS;

export default function RouletteWheel({ onResult }) {
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef();
  const ballRef = useRef();

  const spin = () => {
    if (spinning) return;

    setSpinning(true);
    const targetIndex = Math.floor(Math.random() * NUMBERS);
    const segmentAngle = 360 / WheelNumbers.length;
    const stopAngle = 360 - targetIndex * segmentAngle; 
    const spinCount = 5;
    const finalRotation = 360 * spinCount + stopAngle;
    const duration = 4000;

    // Add class to rotate Ball
    ballRef.current.style.transform = `rotate(0deg) translateX(0px)`; 
    //ballRef.current.style.animation = `none`;
    //ballRef.current.offsetHeight // force reflow
    ballRef.current.style.setProperty('--final-rotation', `${finalRotation}deg`);
    ballRef.current.classList.add('Ball-Spin');

    console.log("Final rotation set to:", finalRotation);
    console.log("Ball classes:", ballRef.current.className);

    setTimeout(() => {
      ballRef.current.classList.remove('Ball-Spin');
      ballRef.current.style.animation = 'none';
      ballRef.current.style.transform = `rotate(${finalRotation}deg) translateX(-170px)`;
      setSpinning(false);
      onResult?.(WheelNumbers[targetIndex]);
    }, duration);
  };

  return (
    <div className="Wheel-Container">
      <div className="Wheel-Wrapper">
        <svg width="400" height="400" viewBox="0 0 400 400">
          {/* Border ring */}
          <circle cx="200" cy="200" r="190" fill="#222" />

          {/* Segments */}
          <g ref={wheelRef} transform="rotate(0)" className="Wheel">
            {WheelNumbers.map((segment, i) => {
              const startAngle = i * ANGLE;
              const endAngle = startAngle + ANGLE;
              const path = describeArc(200, 200, 180, startAngle, endAngle);

              const midAngle = startAngle + ANGLE / 2;
              const labelX = 200 + 120 * Math.cos((Math.PI / 180) * midAngle);
              const labelY = 200 + 120 * Math.sin((Math.PI / 180) * midAngle);

              return (
                <g key={segment.number}>
                  <path d={path} fill={segment.color} stroke="#111" strokeWidth="1" />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="white"
                    transform={`rotate(${midAngle}, ${labelX}, ${labelY})`}
                  >
                    {segment.number}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Inner hub */}
          <circle cx="200" cy="200" r="30" fill="#111" />
        </svg>

        <div className="Ball" ref={ballRef}></div>
      </div>

      <button className="Button Button-Spin" onClick={spin} disabled={spinning}>
        {spinning ? 'Spinning...' : 'Spin'}
      </button>
    </div>
  );
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const rad = (deg) => (Math.PI / 180) * deg;
  const x1 = cx + r * Math.cos(rad(startAngle));
  const y1 = cy + r * Math.sin(rad(startAngle));
  const x2 = cx + r * Math.cos(rad(endAngle));
  const y2 = cy + r * Math.sin(rad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
}