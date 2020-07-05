import React, { Dispatch, SetStateAction } from 'react';
import cn from 'classnames';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';

interface Props {
  id: number;
  left?: number;
  top?: number;
  children: React.ReactElement;
  isList?: boolean;
  title?: string;
  setBoxes: Dispatch<
    SetStateAction<
      Array<{ id: number; left: number; top: number; title: string }>
    >
  >;
  boxes: Array<{ id: number; left: number; top: number; title: string }>;
  blobUrl?: string;
  fullDisable?: boolean;
  socket?: SocketIOClient.Socket;
}

const StyledBox = styled.div`
  position: absolute;
  border: 1px dashed gray;
  background-color: white;
  cursor: move;
  padding-top: 15px;

  &.isList {
    padding-top: 0;
  }

  & .child {
    padding: 0.5rem 1rem;

    & + button {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
`;

const Box = ({
  id,
  left,
  top,
  children,
  isList,
  title,
  setBoxes,
  boxes,
  blobUrl,
  fullDisable,
  socket,
}: Props) => {
  const [{ isDragging }, drag] = useDrag({
    item: {
      id,
      left,
      top,
      title,
      blobUrl,
      type: isList ? ItemTypes.LIST : ItemTypes.BOX,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  if (isDragging) {
    return <div ref={drag} />;
  }

  const deleteBox = () => {
    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    if (confirmed) {
      const newBoxes = boxes.filter((box) => box.id !== id);
      setBoxes(newBoxes);
      socket.emit('sendingChanges', {
        boxes: newBoxes,
      });
    }
  };

  return (
    <StyledBox
      ref={drag}
      className={cn({
        isList,
      })}
      style={{ left, top } as React.CSSProperties}
    >
      <div className="child">{children}</div>
      <button disabled={fullDisable} onClick={deleteBox}>
        delete
      </button>
    </StyledBox>
  );
};

export default Box;
