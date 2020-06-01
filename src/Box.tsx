import React, { Dispatch, SetStateAction } from 'react'
import { useDrag } from 'react-dnd'
import { ItemTypes } from './ItemTypes'

const style = {
  position: 'absolute',
  border: '1px dashed gray',
  backgroundColor: 'white',
  cursor: 'move',
}

interface Props {
  id: number;
  left?: number;
  top?: number;
  children?: React.ReactChild;
  isList?: boolean;
  title?: string;
  setBoxes: Dispatch<SetStateAction<Array<{ id: number, left: number, top: number, title: string }>>>; 
  boxes: Array<{ id: number, left: number, top: number, title: string }>
  blobUrl?: string,
}

const Box = ({ id, left, top, children, isList, title, setBoxes, boxes, blobUrl }: Props) => {
  const [{ isDragging }, drag] = useDrag({
    item: { id, left, top, title, blobUrl, type: isList ? ItemTypes.LIST : ItemTypes.BOX },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  if (isDragging) {
    return <div ref={drag} />
  }
  return (
    <div ref={drag} style={{ ...style, left, top, paddingTop: !isList && 15 } as React.CSSProperties}>
      <div style={{
        padding: '0.5rem 1rem',
      }}>
        {children}
      </div>
      <button 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
        onClick={() => {
          const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
          if (confirmed) {
            const newBoxes = boxes.filter(box => box.id !== id);
            setBoxes(newBoxes);
          }
        }}
      >
        delete
      </button>
    </div>
  )
}

export default Box;