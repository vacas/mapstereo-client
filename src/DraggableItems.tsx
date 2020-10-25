import React, { useState, Dispatch, SetStateAction } from 'react';
import update from 'immutability-helper';
import List from './List';
import Recorder from './Recorder';
import Box from './Box';
import BoxType from './types/box';
import DraggableContainer from './DraggableContainer';
import { LOADIPHLPAPI } from 'dns';

interface Props {
  boxes: Array<BoxType>;
  setDisableAll: Dispatch<SetStateAction<boolean>>;
  fullDisable?: boolean;
  socket?: SocketIOClient.Socket;
  updateBoxes?: (boxes: Array<BoxType>) => void;

  // current box
  currentBox: BoxType;
}

const InternalBox = ({
  boxes,
  setDisableAll,
  fullDisable,
  currentBox,
  updateBoxes,
  socket,
}: Props) => {
  const [playingList, setPlayList] = useState(false);
  const { title, id, blobUrl, type, cards, isListItem } = currentBox;

  const deleteBox = (currentId) => {
    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    if (confirmed) {
      const selectedBox = boxes.find(box => box.id === currentId);
      let newBoxes = boxes;

      if (selectedBox) {
        if (selectedBox.type === 'list' && selectedBox.cards.length > 0) {
          const listItems = selectedBox.cards;

          for (let i = 0; i < listItems.length; i++) {
            const listItemId = listItems[i];

            newBoxes = update(newBoxes, {
              $set: newBoxes.filter(box => box.id !== listItemId)
            });
          }
        }

        newBoxes = newBoxes = update(newBoxes, {
          $set: newBoxes.filter(box => box.id !== currentId)
        });
        updateBoxes(newBoxes);
      }
    }
  };

  const onStop = (url, cardId) => {
    const cardIndex = boxes.findIndex(box => box.id === cardId);    
    const updatedBoxes = update(boxes, {
      [cardIndex]: {
        blobUrl: { $set: url }
      }
    });

    updateBoxes(updatedBoxes);
  };

  if (type === 'list') {
    // getting list items inside list
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

    // sorting listItems to how list has them sorted
    if (listItems && listItems.length > 0) {
      for (let i = 0; i < cards.length; i++) {
        const cardId = cards[i];
        const cardObj = listItems.find((listItem) => listItem.id === cardId);

        if (cardObj) {
          listItemsSorted = update(listItemsSorted, {
            $push: [{ ...cardObj }],
          });
        }
      }
    }

    return (
      <DraggableContainer {...currentBox}>
        <Box
          box={currentBox}
          deleteBox={deleteBox}
          fullDisable={fullDisable}
          boxes={boxes}
          updateBoxes={updateBoxes}
        >
          <List
            {...currentBox}
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
    <DraggableContainer {...currentBox}>
      <Box
        box={currentBox}
        deleteBox={deleteBox}
        fullDisable={fullDisable}
        boxes={boxes}
        updateBoxes={updateBoxes}
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
