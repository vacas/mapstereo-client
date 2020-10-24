import React, { useRef, SetStateAction, Dispatch } from 'react';
import cn from 'classnames';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import styled from 'styled-components';
import { ItemTypes } from './ItemTypes';
import Recorder from './Recorder';
import update from 'immutability-helper';
import DraggableContainer from './DraggableContainer';

export interface CardProps {
  id: any;
  title: string;
  index: number;
  left?: number;
  top?: number;
  blobUrl?: string;
  moveCard: (
    dragIndex: number,
    hoverIndex: number,
    cardId: number
  ) => void;
  boxes: Array<any>;
  isListItem?: boolean;
  updateBoxes?: Dispatch<SetStateAction<Array<any>>>;
  setDisableAll?: Dispatch<SetStateAction<boolean>>;
  fullDisable?: boolean;
  playList: boolean;
  socket?: SocketIOClient.Socket;
  onStop: Dispatch<SetStateAction<string>>;
  deleteBox?: Function;
  type: string;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
  isListItem: boolean;
}

const StyledCard = styled.div`
  border: 1px dashed gray;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  background-color: white;
  cursor: move;
  z-index: 4;
  opacity: 1;

  &.isDragging {
    opacity: 0.5;
  }

  & > button {
    position: absolute;
    top: 0;
    right: 0;
  }
`;

const Card: React.FC<CardProps> = ({
  id,
  title,
  index,
  moveCard,
  left,
  top,
  boxes,
  isListItem,
  updateBoxes,
  blobUrl,
  fullDisable,
  playList,
  setDisableAll,
  socket,
  onStop,
  deleteBox,
  type,
}: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current || !item || !item.isListItem) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex, Number(item.id));

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: {
      type: ItemTypes.CARD,
      id,
      index,
      // listId,
      isListItem,
      title,
      top,
      left,
      ref,
      blobUrl,
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (dropResult, monitor) => {
      const { type } = monitor.getDropResult() || {};

      const didDrop = monitor.didDrop();

      // when dropped outside of list, this is removes from list
      if (didDrop && type === 'droppable_background') {
        // this should remove this card from the listItems of list
        const listIndex = boxes.findIndex(box => {
          if (box.type === 'list' && box.cards.includes(id)) {
            return true;
          }

          return false;
        });
        const cardIndex = boxes.findIndex(box => box.id === id);

        let newBoxes = update(boxes, {
          [listIndex]: {
            cards: { $set: boxes[listIndex].cards.filter(cardId => cardId !== id)
          }}
        });

        newBoxes = update(newBoxes, {
          [cardIndex]: {
            isListItem: {$apply: () => false}
          }
        });
        
        // const newBoxes = lists.map((list) => {
        //   if (list.id === listId) {
        //     const newList = list.listItems.filter(
        //       (listItem) => listItem.id !== id
        //     );

        //     return {
        //       ...list,
        //       listItems: newList,
        //     };
        //   }

        //   return list;
        // });

        updateBoxes(newBoxes);
        // socket.emit('sendingChanges', {
        //   lists: newBoxes,
        // });
      }
    },
  });

  // this should save to card data, not list
  const saveUrlToList = (url) => {
    // const updatedLists = lists.map((list) => {
    //   if (list.id === listId) {
    //     const newList = list.listItems.map((listItem) => {
    //       if (listItem.id === id) {
    //         return {
    //           ...listItem,
    //           blobUrl: url,
    //         };
    //       }

    //       return listItem;
    //     });

    //     return {
    //       ...list,
    //       listItems: newList,
    //     };
    //   }

    //   return list;
    // });

    // setLists(updatedLists);
    // socket.emit('sendingChanges', {
    //   lists: updatedLists,
    // });
  };

  // this should remove card from list and card itself from "boxes"
  const deleteCard = () => {
    // const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    // if (confirmed) {
    //   const newBoxes = lists.map((list) => {
    //     if (list.id === listId) {
    //       const newList = list.listItems.filter(
    //         (listItem) => listItem.id !== id
    //       );

    //       return {
    //         ...list,
    //         listItems: newList,
    //       };
    //     }

    //     return list;
    //   });

    //   setLists(newBoxes);
    //   socket.emit('sendingChanges', {
    //     lists: newBoxes,
    //   });
    // }
  };

  drag(drop(ref));

  return (
    <StyledCard
      ref={ref}
      className={cn({
        isDragging,
      })}
    >
      <span className="title">{title}</span>
      <Recorder
        playList={playList}
        cardId={id}
        // listId={listId}
        onStop={(url) => {
          saveUrlToList(url);
        }}
        blobUrl={blobUrl}
        setDisableAll={setDisableAll}
        fullDisable={fullDisable}
        socket={socket}
        title={title}
      />
      <button disabled={fullDisable} onClick={deleteCard}>
        delete
      </button>
    </StyledCard>
  );
};

export default Card;
