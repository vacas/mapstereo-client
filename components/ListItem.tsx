import React, { useRef, SetStateAction, Dispatch } from 'react';
import cn from 'classnames';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import styled from 'styled-components';
import { ItemTypes } from './ItemTypes';

export interface CardProps {
  id: any;
  title: string;
  listItemIndex: number;
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
  children?: React.ReactElement;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
  isListItem: boolean;
  listItemIndex: number;
}

const StyledCard = styled.div`
  position: relative;
  margin-bottom: 0.5rem;
  cursor: move;
  z-index: 4;
  opacity: 1;

  &.isDragging {
    opacity: 0.5;
  }
`;

const Card: React.FC<CardProps> = ({
  id,
  title,
  listItemIndex,
  moveCard,
  left,
  top,
  boxes,
  isListItem,
  updateBoxes,
  blobUrl,
  children
}: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current || !item || !item.isListItem) {
        return;
      }
      
      const dragIndex = item.listItemIndex;
      const hoverIndex = listItemIndex;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex || id === item.id) {
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
      item.listItemIndex = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: {
      type: ItemTypes.CARD,
      id,
      listItemIndex,
      isListItem,
      title,
      top,
      left,
      ref,
      blobUrl,
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    })
  });

  drag(drop(ref));

  return (
    <StyledCard
      ref={ref}
      className={cn('listItem', {
        isDragging,
      })}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
