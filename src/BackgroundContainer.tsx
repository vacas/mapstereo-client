import React, { SetStateAction, Dispatch } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import maxBy from 'lodash/maxBy';
import update from 'immutability-helper';

const styles = {
  width: '100%',
  height: '100vh',
  border: '1px solid black',
  position: 'relative',
}

const Container = ({ setBoxes, boxes }: { setBoxes: Dispatch<SetStateAction<Array<{ id: number, left: number, top: number, title: string, blobUrl: string }>>>; boxes: Array<{ id: number, left: number, top: number, title: string, blobUrl: string }> }) => {

  const [, drop] = useDrop({
    accept: [ItemTypes.BOX, ItemTypes.CARD, ItemTypes.LIST],
    drop(item: any, monitor) {
      if (item.type === 'box' || item.type === 'list') {
        const delta = monitor.getDifferenceFromInitialOffset();
  
        if (delta) {
          const left = Math.round(item.left + delta.x)
          const top = Math.round(item.top + delta.y)

          if (left < (window.innerWidth - 50) && left > 0 && top > 0 && top < (window.innerHeight - 50)) {
            moveBox(item.id, left, top)
          }
        }
      }

      if (item.type === 'card') {
        const maxBoxId = maxBy(boxes, 'id');

        const delta = monitor.getClientOffset();

        // // change to width by half
        // const left = delta.x - 64.25;
        // // change to height by half
        // const top = delta.y - 18;

        if (delta && item.ref && item.ref.current) {
          const boundingRect = item.ref.current.getElementsByClassName('title')[0].getBoundingClientRect();
          const xPadding = 32;
          const yPadding = 31;

          const approxWidth = Math.floor(boundingRect.width);
          const approxHeight = Math.floor(boundingRect.height);
          // top left corner minus half of the width of item
          const left = delta.x - ((approxWidth + xPadding) / 2);
          // top left corner minus half of the height of item
          const top = delta.y - ((approxHeight + yPadding) / 2);

          setBoxes([
            ...boxes,
            {
              id: maxBoxId ? maxBoxId.id + 1 : boxes.length + 1,
              left,
              top,
              title: item.title,
              blobUrl: item.blobUrl
            }
          ]);
        }

        return { type: 'container' };
      }
    },
  });

  const moveBox = (id, left, top) => {
    setBoxes(
      update(boxes, {
        $set: ([
          ...boxes.map(box => {
            if (box.id === id) {              
              return {...box, left, top }
            }

            return box;
          }),
        ])
      }),
    )
  }
  return (
    <div ref={drop} style={styles as React.CSSProperties}/>
  )
}

export default Container;