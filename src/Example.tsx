import React, { useState, useEffect } from 'react';
import Container from './Container';
import List from './List';

const DEFAULT_POSITION = {
  top: 180,
  left: 20,
}

const LIST_DEFAULT_POSITION = {
  top: 20,
  left: 180,
}


const Example = () => {
  const [boxes, setBoxes] = useState([]);
  const [lists, setLists] = useState([]);

  useEffect(() => {}, [lists]);

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
        const id = boxes.length + 1;
        setBoxes([
          ...boxes,
          {
            id,
            title: `box #${id}`,
            ...DEFAULT_POSITION
          },
        ])
      }}>Add Box Item</button>
      <button style={{
        position: 'absolute',
        top: 0,
        left: 100,
        zIndex: 5,
      }} onClick={() => {
        const boxId = boxes.length + 1;
        const listId = lists.length + 1;

        setLists([
          ...lists,
          {
            id: listId,
            boxId,
            list: []
          },
        ])

        setBoxes([
          ...boxes,
          {
            id: boxId,
            title: `box #${boxId}`,
            ...LIST_DEFAULT_POSITION,
            listId,
            Component: List,
          },
        ])
      }}>Add List</button>
      <Container boxes={boxes} setBoxes={setBoxes} lists={lists} setLists={setLists} />
    </div>
  )
}

export default Example;