import React, { useState, useEffect } from 'react';
import { Check, Edit } from 'react-feather';
import styled from 'styled-components';
import cn from 'classnames';
import update from 'immutability-helper';
import BoxType from './types/box';

interface Props {
  boxes: Array<BoxType>;
  box: BoxType;
  children?: React.ReactElement;
  fullDisable?: boolean;
  deleteBox?: Function;
  updateBoxes: (boxes: Array<BoxType>) => void;
}

const StyledBox = styled.div`
  color: white;
  /* border: 1px dashed gray; */
  background-color: #f2ac52;
  border-radius: 16px;
  padding: 18px 26px;
  cursor: move;

  & .boxHeader {
    font-size: 20px;
    font-weight: 700;
    padding-bottom: 15px;
    border-bottom: 1px solid;
    margin-bottom: 30px;
  }

  &.isList {
    padding-top: 20px;
    
  }

  & .child {
    & + button {
      position: absolute;
      top: 0;
      right: 0;
    }
  }

  .icons {
    transition: all 250ms;
    &:hover {
      cursor: pointer;
      opacity: 0.5;
    }
  }
`;

const Box = ({
  box,
  children,
  fullDisable,
  deleteBox,
  boxes,
  updateBoxes,
}: Props) => {
  const { id, title, type } = box;
  const [edit, setEdit] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  useEffect(() => {
    if (!edit && editedTitle !== title) {
      const cardIndex = boxes.findIndex((box) => box.id === id);
      const newBoxes = update(boxes, {
        [cardIndex]: {
          $set: {
            ...boxes[cardIndex],
            title: editedTitle,
          },
        },
      });
      updateBoxes(newBoxes);
    }
  }, [edit]);

  return (
    <StyledBox
      className={cn({
        isList: type === 'list',
      })}
    >
      {!edit ? (
        <div className="boxHeader">
          {title}{' '}
          <span
            className="icons"
            onClick={() => {
              setEditedTitle(title);
              setEdit(true);
            }}
          >
            <Edit size={12} />
          </span>
        </div>
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
