import React, { useState, Dispatch, SetStateAction } from 'react';
import update from 'immutability-helper';
import List from './List';
import Recorder from './Recorder';
import Box from './Box';
import BoxType from './types/box';
import DraggableContainer from './DraggableContainer';

interface Props {
  boxes: Array<BoxType>;
  setDisableAll: Dispatch<SetStateAction<boolean>>;
  fullDisable?: boolean;
  socket?: SocketIOClient.Socket;
  updateBoxes?: (boxes: Array<BoxType>) => void;

  // current box
  box: BoxType;
}

const InternalBox = ({
  boxes,
  setDisableAll,
  fullDisable,
  box,
  updateBoxes,
  socket,
}: Props) => {
  const [playingList, setPlayList] = useState(false);
  const { left, top, title, id, blobUrl, type, cards, isListItem } = box;

  const deleteBox = (currentId) => {
    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    if (confirmed) {
      const updatedBoxes = boxes.filter((box) => box.id !== currentId);
      updateBoxes(updatedBoxes);
    }
  };

  const onStop = (url) => {
    const updatedBoxes = boxes.map((box) => {
      if (box.id === id) {
        return {
          ...box,
          blobUrl: url,
        };
      }

      return box;
    });

    updateBoxes(updatedBoxes);
  };

  if (type === 'list') {
    const listItems: Array<any> =
      (boxes &&
        boxes.length > 0 &&
        boxes.filter((boxItem) => {
          const listItem =
            cards &&
            cards.length > 0 &&
            cards.find((cardId) => boxItem.id === cardId);

          if (listItem || listItem === 0) {
            return true;
          }

          return false;
        })) ||
      [];

    let listItemsSorted = [];

    // sorting listItems
    if (listItems && listItems.length > 0) {
      for (let i = 0; i < cards.length; i++) {
        const cardId = cards[i];
        const cardObj = listItems.find((listItem) => listItem.id === cardId);
        console.log('cardObj', cardObj);

        if (cardObj) {
          listItemsSorted = update(listItemsSorted, {
            $push: [{ ...cardObj }],
          });
        }
      }
    }

    return (
      <DraggableContainer {...box}>
        <Box
          id={id}
          type={type}
          title={title}
          deleteBox={deleteBox}
          fullDisable={fullDisable}
        >
          <List
            {...box}
            setDisableAll={setDisableAll}
            fullDisable={fullDisable}
            updateBoxes={updateBoxes}
            boxes={boxes}
            listItems={listItemsSorted}
            setPlayList={setPlayList}
            playingList={playingList}
            deleteBox={deleteBox}
            onStop={onStop}
            socket={socket}
          />
        </Box>
      </DraggableContainer>
    );
  }

  if (isListItem) {
    return null;
  }

  // this dynamic should be consolidated within card component
  return (
    <DraggableContainer {...box}>
      <Box
        id={id}
        type={type}
        title={title}
        deleteBox={deleteBox}
        fullDisable={fullDisable}
      >
        <Recorder
          fullDisable={fullDisable}
          setDisableAll={setDisableAll}
          onStop={onStop}
          blobUrl={blobUrl}
          socket={socket}
          title={title}
        />
      </Box>
    </DraggableContainer>
  );
};

export default InternalBox;
