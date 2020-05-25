import React, { useState } from 'react';
import Container from './Container';

const DEFAULT_POSITION = {
  top: 180,
  left: 20,
}

const Example = () => {
  const [iterator, setIterator] = useState(0);
  const [boxes, setBoxes] = useState({});

  return (
    <div style={{
      position: 'relative'
    }}>
      <button style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 5,
      }} onClick={() => {
        setBoxes({
          ...boxes,
          [iterator]: {
            title: `item #${iterator}`,
            ...DEFAULT_POSITION
          },
        })

        setIterator(iterator + 1);
      }}>Add +</button>
      <Container boxes={boxes} setBoxes={setBoxes} />
    </div>
  )
}

export default Example;