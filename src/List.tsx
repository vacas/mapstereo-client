import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useDrop } from 'react-dnd';
import cn from 'classnames';
import styled from 'styled-components';
import Card from './Card';
import { ItemTypes } from './ItemTypes';
import maxBy from 'lodash/maxBy';

export interface ListItem {
  id?: number;
  title?: string;
  listId?: number;
  blobUrl?: string;
}

export interface Props {
  drop?: any;
  setLists?: Dispatch<SetStateAction<Array<any>>>;
  lists?: Array<any>;
  listId?: number;
  setBoxes?: Dispatch<SetStateAction<Array<any>>>;
  boxes?: Array<any>;
  left?: number;
  top?: number;
  moveCard?: (
    dragIndex: number,
    hoverIndex: number,
    listId: number,
    lists: Array<any>
  ) => void;
  setRecording?: Dispatch<SetStateAction<boolean>>;
  isRecording?: boolean;
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

const List = ({
  lists,
  listId,
  setLists,
  boxes,
  setBoxes,
  left,
  top,
  moveCard,
  isRecording,
  setRecording,
}: Props) => {
  const [playingList, setPlayList] = useState(false);
  const listData: { listItems: Array<ListItem> } =
    lists && lists.length > 0 && lists.find((list) => list.id === listId);
  const { listItems } = listData || { listItem: [{ id: 0 }] };

  const [, drop] = useDrop({
    accept: [ItemTypes.BOX, ItemTypes.CARD],
    drop: (item: any) => {
      if (item.type === 'box' && !item.Component) {
        const highestID = maxBy(listItems, 'id');

        const newId = !highestID ? 0 : highestID.id + 1;

        const newList = lists.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              listItems: [
                ...list.listItems,
                {
                  id: newId,
                  title: item.title,
                  listId,
                  blobUrl: item.blobUrl,
                },
              ],
            };
          }

          return list;
        });

        setLists(newList);

        setBoxes([...boxes.filter((box) => box.id !== item.id)]);

        return { type: 'list' };
      }

      return undefined;
    },
  });

  const addItem = () => {
    const highestID = maxBy(listItems, 'id');

    const newId = !highestID ? 0 : highestID.id + 1;

    const newList = lists.map((list) => {
      if (list.id === listId) {
        const newList = [
          ...list.listItems,
          {
            id: newId,
            title: `Card Item #${newId}`,
            listId,
          },
        ];

        return {
          ...list,
          listItems: newList,
        };
      }

      return list;
    });

    setLists(newList);
  };

  const playList = (n: number) => {
    const listItem = listItems[n];

    if (playingList && listItem) {
      const { id, listId, blobUrl } = listItem;
      const audioTag = document.getElementById(
        `${listId ? `listId-${listId}-` : ''}${
          id ? `cardId-${id}-` : ''
        }${blobUrl}`
      ) as HTMLAudioElement;

      audioTag.currentTime = 0;

      const playNextClip = () => {
        if (listItems[n + 1]) {
          playList(n + 1);
        } else {
          setPlayList(false);
          audioTag.removeEventListener('ended', playNextClip);
        }
      };

      const pauseList = () => {
        if (audioTag.paused && audioTag.duration !== audioTag.currentTime) {
          // isPlaying = false;
          setPlayList(false);
          audioTag.removeEventListener('ended', playNextClip);
          audioTag.removeEventListener('paused', pauseList);
          return;
        }
      };

      audioTag.addEventListener('ended', playNextClip);
      audioTag.addEventListener('paused', pauseList);
      audioTag.play();
    }
  };

  useEffect(() => {
    if (playingList) {
      playList(0);
    }

    return;
  }, [playingList]);

  const renderCard = (card: ListItem, index: number) => {
    return (
      <Card
        left={left}
        top={top}
        key={card.id}
        index={index}
        id={card.id}
        title={card.title}
        blobUrl={card.blobUrl}
        moveCard={moveCard}
        listId={listId}
        lists={lists}
        setLists={setLists}
        setRecording={setRecording}
        isRecording={isRecording}
      />
    );
  };

  return (
    <StyledList ref={drop}>
      <button disabled={playingList || isRecording} onClick={addItem}>
        Add list item
      </button>
      <button
        disabled={isRecording}
        onClick={() => {
          setPlayList(!playingList);
        }}
      >
        {playingList ? 'Stop' : 'Play'} list
      </button>
      <div className="cardWrapper">
        {listItems.length === 0 ? (
          <div className="dropzone">Drop box here</div>
        ) : (
          listItems.map((listItem, i) => renderCard(listItem, i))
        )}
      </div>
    </StyledList>
  );
};

export default List;
