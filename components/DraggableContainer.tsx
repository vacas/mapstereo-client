import React from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';

interface Props {
  id: number;
  left?: number;
  top?: number;
  children?: React.ReactElement;
  type?: string;
  title?: string;
  blobUrl?: string;
  fullDisable?: boolean;
  deleteBox?: Function;
}

const StyledDraggable = styled.div`
  position: absolute;
`;

const DraggableContainer = ({
  id,
  left,
  top,
  type,
  children,
  title,
  blobUrl,
}: Props) => {

  const [{ isDragging }, drag] = useDrag({
    item: {
      id,
      left,
      top,
      title,
      blobUrl,
    },
    type,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  if (isDragging) {
    return <div ref={drag} />;
  }

  return (
    <StyledDraggable
      ref={drag}
      style={{ left, top } as React.CSSProperties}
    >
      {children}
    </StyledDraggable>
  );
};

export default DraggableContainer;
