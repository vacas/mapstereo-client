import React, { useRef, SetStateAction, Dispatch } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { XYCoord } from 'dnd-core'
import { ItemTypes } from './ItemTypes'
import Recorder from './Recorder';

const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move',
  zIndex: 4,
}

export interface CardProps {
  id: any
  title: string
  index: number
  listId: number;
  left?: number;
  top?: number;
  blobUrl?: string;
  moveCard: (dragIndex: number, hoverIndex: number, listId: number, lists: Array<any>) => void;
  lists: Array<any>;
  setLists?: Dispatch<SetStateAction<Array<any>>>
}

interface DragItem {
  index: number
  id: string
  type: string
}
export const Card: React.FC<CardProps> = ({ id, title, index, listId, moveCard, left, top, lists, setLists, blobUrl }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex, listId, lists)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CARD, id, index, listId, title, top, left, ref, blobUrl  },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (dropResult, monitor) => {
      const { type } = monitor.getDropResult() || {};
      
      const didDrop = monitor.didDrop()
      
      if (didDrop && type === 'container') {
        const newLists = lists.map(list => {
          if (list.id === listId) {
            const newList = list.listItems.filter(listItem => listItem.id !== id);

            return {
              ...list,
              listItems: newList
            };
          }

          return list
        });

        setLists(newLists);
      }
    },
  })

  const saveUrlToList = (url) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        const newList = list.listItems.map(listItem => {
          if (listItem.id === id) {
            return ({
              ...listItem,
              blobUrl: url
            })
          }

          return listItem;
        });

        return {
          ...list,
          listItems: newList
        };
      }

      return list
    });

    setLists(updatedLists);
  }

  const deleteCard = () => {
    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    if (confirmed) {
      const newLists = lists.map(list => {
        if (list.id === listId) {
          const newList = list.listItems.filter(listItem => listItem.id !== id);

          return {
            ...list,
            listItems: newList
          };
        }

        return list
      });

      setLists(newLists);
    }
  }

  const opacity = isDragging ? 0.5 : 1
  drag(drop(ref))
  return (
    <div ref={ref} style={{ 
      ...style,
      opacity,
      position: 'relative',
    }}>
      <React.Fragment>
        <span className="title">
          {title}
        </span>
        <Recorder
          cardId={id}
          listId={listId}
          onStop={(url) => { saveUrlToList(url)}}
          blobUrl={blobUrl}
        />
      </React.Fragment>
      <button 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
        onClick={deleteCard}
      >
        delete
      </button>
    </div>
  )
}
