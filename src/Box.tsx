import React from 'react'
import { useDrag } from 'react-dnd'
import { ItemTypes } from './ItemTypes'

const style = {
  position: 'absolute',
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  cursor: 'move',
}

interface Props {
  id: number;
  left?: number;
  top?: number;
  children?: React.ReactChild;
  isList?: boolean;
}

const Box = ({ id, left, top, children, isList }: Props) => {
  const [{ isDragging }, drag] = useDrag({
    item: { id, left, top, type: isList ? ItemTypes.LIST : ItemTypes.BOX },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  if (isDragging) {
    return <div ref={drag} />
  }
  return (
    <div ref={drag} style={{ ...style, left, top } as React.CSSProperties}>
      {children}
    </div>
  )
}

export default Box;