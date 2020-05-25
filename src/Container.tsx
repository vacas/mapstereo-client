import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import Box from './Box';
import List from './List';
import update from 'immutability-helper';

const styles = {
  width: '100%',
  height: '100vh',
  border: '1px solid black',
  position: 'relative',
}

const Container = ({ setBoxes, boxes }) => {
  const [, drop] = useDrop({
    accept: ItemTypes.BOX,
    drop(item: any, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset()
      const left = Math.round(item.left + delta.x)
      const top = Math.round(item.top + delta.y)
      moveBox(item.id, left, top)
      return undefined
    },
  })
  const moveBox = (id, left, top) => {
    setBoxes(
      update(boxes, {
        [id]: {
          $merge: { left, top },
        },
      }),
    )
  }
  return (
    <div ref={drop} style={styles as React.CSSProperties}>
      <List />
      {Object.keys(boxes).map((key) => {
        const { left, top, title } = boxes[key]
        return (
          <Box
            key={key}
            id={key}
            left={left}
            top={top}
          >
            {title}
          </Box>
        )
      })}
    </div>
  )
}

export default Container;