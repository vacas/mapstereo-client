import React, { Dispatch, SetStateAction } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import ListItem from './ListItem';
import { ItemTypes } from './ItemTypes';
import maxBy from 'lodash/maxBy';
import { getRecorderId } from './helper';
import BoxType from './types/box';
import update from 'immutability-helper';
import Recorder from './Recorder';
import Box from './Box';

export interface ListItem {
  id?: number;
  title?: string;
  listId?: number;
  blobUrl?: string;
  isListItem?: boolean;
  type?: string;
}

export interface Props {
  drop?: any;
  deleteBox?: Function;
  updateBoxes?: (boxes: Array<BoxType>) => void;
  boxes?: Array<BoxType>;
  setDisableAll?: Dispatch<SetStateAction<boolean>>;
  fullDisable?: boolean;
  playingList?: boolean;
  setPlayList?: Dispatch<SetStateAction<boolean>>;
  listItems?: Array<ListItem>;
  left?: number;
  top?: number;
  id?: number;
  onStop: Dispatch<SetStateAction<string>>;
  socket?: SocketIOClient.Socket;
}

const StyledList = styled.div`
  & .cardWrapper {
    width: 400px;
    z-index: 3;
    margin: 10px 0;

    & .dropzone {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50px;
      border: 1px dashed black;
    }
  }
`;

const getCurrentIndex = (currentId, listItems) => {
  const currentIndex = listItems.findIndex(
    (item) =>
      item && getRecorderId(item.listId, item.id, item.blobUrl) === currentId
  );

  return currentIndex;
};

const List = ({
  updateBoxes,
  boxes,
  fullDisable,
  setDisableAll,
  playingList,
  setPlayList,
  listItems,
  left,
  top,
  id,
  onStop,
  deleteBox,
  socket,
}: Props) => {
  // if a box is dropped inside a list, box becomes into a list item and gets removed from droppable_background
  const [, drop] = useDrop({
    accept: [ItemTypes.CARD],
    drop: (item: any) => {

      if (item.type === 'card' && !item.isListItem) {
        const listIndex = boxes.findIndex((box) => box.id === id);

        if (!boxes[listIndex].cards.includes(item.id)) {
          const cardIndex = boxes.findIndex((box) => box.id === item.id);
          let newBoxes;
          newBoxes = update(boxes, {
            [listIndex]: {
              cards: {
                $push: [item.id],
              },
            },
          });

          newBoxes = update(newBoxes, {
            [cardIndex]: {
              $apply: (box) => ({
                ...box,
                isListItem: true,
              }),
            },
          });

          updateBoxes(newBoxes);
        }

        setDisableAll(false);

        return { type: 'list' };
      }

      return undefined;
    },
  });

  // adds new list item
  // NEED TO ADD BOX AND APPEND ID TO CARDS ARRAY IN LIST
  const addItem = () => {
    const listIndex = boxes.findIndex((box) => box.id === id);
    const highestID = maxBy(boxes, 'id');
    const newId = highestID.id + 1;

    let newBoxes = update(boxes, {
      $push: [
        {
          id: newId,
          type: 'card',
          isListItem: true,
          top,
          left,
          title: `box #${newId}`,
          blobUrl: undefined,
        },
      ],
    });

    newBoxes = update(newBoxes, {
      [listIndex]: { cards: { $push: [newId] } },
    });

    updateBoxes(newBoxes);
  };

  const moveCard = (dragIndex: number, hoverIndex: number, cardId: number) => {
    const listIndex = boxes.findIndex((box) => {
      if (box.type === 'list' && box.cards.includes(cardId)) {
        return true;
      }

      return false;
    });

    const newBoxes = update(boxes, {
      [listIndex]: {
        cards: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, cardId],
          ],
        },
      },
    });
    
    updateBoxes(newBoxes);
  };

  // event listener: handles playing next clip if available
  const playNextClip = (e) => {
    const currentId = e.currentTarget.id;
    // finds the current index in listItems
    const currentIndex = getCurrentIndex(currentId, listItems);
    const nextIndex = currentIndex + 1;
    const nextAudio = listItems[nextIndex] as any;

    // if currentIndex exists and the next item exists as well, play the next track
    if (currentIndex !== -1 && nextAudio && nextAudio.blobUrl) {
      return playList(currentIndex + 1);
    }

    return setPlayList(false);
  };

  // event listener: if any item in list is paused, pause the whole list
  const pauseList = (e) => {
    if (
      e.currentTarget.paused &&
      e.currentTarget.duration !== e.currentTarget.currentTime
    ) {
      setPlayList(false);
      e.currentTarget.removeEventListener('ended', playNextClip, {
        once: true,
      });
      return;
    }
  };

  // plays items in list
  const playList = (n: number) => {
    const listItem = listItems[n];

    if (listItem) {
      const { id, listId, blobUrl } = listItem;
      const audioTag = document.getElementById(
        getRecorderId(listId, id, blobUrl)
      ) as HTMLAudioElement;

      audioTag.currentTime = 0;

      audioTag.addEventListener('ended', playNextClip, {
        once: true,
      });
      audioTag.addEventListener('pause', pauseList, {
        once: true,
      });
      audioTag.play();
    }
  };

  return (
    <StyledList ref={drop}>
      <button disabled={playingList || fullDisable} onClick={addItem}>
        Add list item
      </button>
      <button
        disabled={fullDisable}
        onClick={() => {
          setPlayList(true);
          playList(0);
        }}
      >
        {playingList ? 'Stop' : 'Play'} list
      </button>
      <div className="cardWrapper">
        {listItems.length === 0 ? (
          <div className="dropzone">Drop box here</div>
        ) : (
          listItems.map((listItem, i) => (
            <ListItem
              key={`listKey:${Math.pow(new Date().getDate(), i)}`}
              boxes={boxes}
              left={left}
              top={top}
              listItemIndex={i}
              id={listItem.id}
              title={listItem.title}
              blobUrl={listItem.blobUrl}
              moveCard={moveCard}
              updateBoxes={updateBoxes}
              isListItem={listItem.isListItem}
            >
              <Box
                id={listItem.id}
                type={listItem.type}
                title={listItem.title}
                deleteBox={deleteBox}
                fullDisable={fullDisable}
                boxes={boxes}
                updateBoxes={updateBoxes}
              >
                <Recorder
                  playList={playingList}
                  cardId={id}
                  onStop={onStop}
                  blobUrl={listItem.blobUrl}
                  setDisableAll={setDisableAll}
                  fullDisable={fullDisable}
                  socket={socket}
                  title={listItem.title}
                />
              </Box>
            </ListItem>
          ))
        )}
      </div>
    </StyledList>
  );
};

// fullDisable?: boolean;
//   playList: boolean;
//   socket?: SocketIOClient.Socket;
//   onStop: Dispatch<SetStateAction<string>>;
//   deleteBox?: Function;
//   type: string;

export default List;
