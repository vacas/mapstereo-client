import React, { SetStateAction, Dispatch, useEffect } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import maxBy from 'lodash/maxBy';
import { useCurrentWidth, useCurrentHeight } from './helper';
import BoxType from './types/box';
import update from 'immutability-helper';

const StyledDroppableBackground = styled.div`
  width: 100%;
  height: 100vh;
  border: 1px solid black;
  position: relative;
`;

const DroppableBackground = ({
  updateBoxes,
  boxes,
  setDisableAll,
}: {
  updateBoxes: (boxes: Array<BoxType>) => void;
  boxes: Array<BoxType>;
  setDisableAll: Dispatch<SetStateAction<boolean>>;
}) => {
  const width = useCurrentWidth();
  const height = useCurrentHeight();

  useEffect(() => {
    for (let i = 0; i < boxes.length; i++) {
      const { left, top, id } = boxes[i];
      if (left > width) {
        moveBox(id, width - 50, top);
      } else if (top > height) {
        moveBox(id, left, height - 50);
      }
    }
  }, [width, height]);

  const [, drop] = useDrop({
    accept: [ItemTypes.BOX, ItemTypes.CARD, ItemTypes.LIST],
    drop(item: any, monitor) {

      console.log('item', item);
      
      if (item.type === 'box' || item.type === 'list' || (item.type === 'card' && !item.isListItem)) {
        const delta = monitor.getDifferenceFromInitialOffset();

        if (delta) {
          const left = Math.round(item.left + delta.x);
          const top = Math.round(item.top + delta.y);

          if (left < width - 50 && left > 0 && top > 0 && top < height - 50) {
            moveBox(item.id, left, top);
          }
        }
      }

      if (item.type === 'card' && item.isListItem) {
        const delta = monitor.getClientOffset();

        if (delta && item.ref && item.ref.current) {
          const boundingRect = item.ref.current
            .getElementsByClassName('title')[0]
            .getBoundingClientRect();
          const xPadding = 32;
          const yPadding = 31;

          const approxWidth = Math.floor(boundingRect.width);
          const approxHeight = Math.floor(boundingRect.height);
          // top left corner minus half of the width of item
          const left = delta.x - (approxWidth + xPadding) / 2;
          // top left corner minus half of the height of item
          const top = delta.y - (approxHeight + yPadding) / 2;

          const cardIndex = boxes.findIndex(box => box.id === item.id);
          let newBoxes = boxes;

          if (cardIndex !== -1 && boxes[cardIndex].isListItem) {
            const listIndex = boxes.findIndex(box => {
              if (box.type === 'list' && box.cards.includes(item.id)) {
                return true;
              }
    
              return false;
            });

            newBoxes = update(newBoxes, {
              [listIndex]: {
                cards: {
                  $set: newBoxes[listIndex].cards.filter(cardId => cardId !== item.id)
                }
              }
            })
          }
          
          newBoxes = update(newBoxes, {
            [cardIndex]: {
              $set: {
                id: item.id,
                left,
                top,
                blobUrl: item.blobUrl,
                type: item.type,
                title: item.title,
                isListItem: false,
              }
            }
          });

          updateBoxes(newBoxes);
        }

        return { type: 'droppable_background' };
      }
      setDisableAll(false);
    },
  });

  const moveBox = (id, left, top) => {
    const updatedBoxes = update(boxes, {
      $set: [
        ...boxes.map((box) => {
          if (box.id === id) {
            return { ...box, left, top };
          }

          return box;
        }),
      ],
    });
    updateBoxes(updatedBoxes);
  };
  return <StyledDroppableBackground ref={drop} />;
};

export default DroppableBackground;
