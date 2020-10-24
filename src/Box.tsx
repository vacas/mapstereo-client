import React, { useState } from 'react';
import { Check, Edit } from 'react-feather';
import styled from 'styled-components';
import cn from 'classnames';

interface Props {
  id: number;
  children?: React.ReactElement;
  type?: string;
  title?: string;
  fullDisable?: boolean;
  deleteBox?: Function;
}

const StyledBox = styled.div`
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

const Box = ({ children, title, fullDisable, deleteBox, id, type }: Props) => {
  const [edit, setEdit] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  return (
    <StyledBox
      className={cn({
        isList: type === 'list',
      })}
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

export default Box;