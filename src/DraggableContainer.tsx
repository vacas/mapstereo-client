import React, { useState } from 'react';
import cn from 'classnames';
import styled from 'styled-components';
import { Check, Edit } from 'react-feather';
import { useDrag } from 'react-dnd';

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

const DraggableContainer = ({
  id,
  left,
  top,
  type,
  children,
  title,
  deleteBox,
  blobUrl,
  fullDisable,
}: Props) => {
  const [edit, setEdit] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const [{ isDragging }, drag] = useDrag({
    item: {
      id,
      left,
      top,
      title,
      blobUrl,
      type,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  if (isDragging) {
    return <div ref={drag} />;
  }

  return (
    <StyledBox
      ref={drag}
      className={cn({
        isList: type === 'list',
      })}
      style={{ left, top } as React.CSSProperties}
    >
      {!edit ? (
        <React.Fragment>
          {title}{' '}
          <span className="icons" onClick={() => setEdit(true)}>
            <Edit size={12} />
          </span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />{' '}
          <span className="icons" onClick={() => setEdit(false)}>
            <Check size={12} />
          </span>
        </React.Fragment>
      )}
      <div className="child">{children}</div>
      <button disabled={fullDisable} onClick={() => deleteBox(id)}>
        delete
      </button>
    </StyledBox>
  );
};

export default DraggableContainer;
