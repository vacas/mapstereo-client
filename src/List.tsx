import React, { useState, Dispatch, SetStateAction } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import Card from './Card';
import { ItemTypes } from './ItemTypes';
import maxBy from 'lodash/maxBy';
import { getRecorderId } from './helper';

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
  setDisableAll?: Dispatch<SetStateAction<boolean>>;
  fullDisable?: boolean;
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
  lists,
  listId,
  setLists,
  boxes,
  setBoxes,
  left,
  top,
  moveCard,
  fullDisable,
  setDisableAll,
  socket,
}: Props) => {
  const [playingList, setPlayList] = useState(false);
  const listData: { listItems: Array<ListItem> } =
    lists && lists.length > 0 && lists.find((list) => list.id === listId);
  const { listItems } = listData || { listItem: [{ id: 0 }] };

  // if a box is dropped inside a list, box becomes into a list item and gets removed from background container
  const [, drop] = useDrop({
    accept: [ItemTypes.BOX, ItemTypes.CARD],
    drop: (item: any) => {
      if (item.type === 'box' && !item.Component) {
        const highestID = maxBy(listItems, 'id');

        const newId = !highestID ? 0 : highestID.id + 1;

        const newLists = lists.map((list) => {
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
        const newBoxes = [...boxes.filter((box) => box.id !== item.id)];

        setLists(newLists);
        setBoxes(newBoxes);

        socket.emit('sendingChanges', JSON.stringify({
          boxes: newBoxes,
          lists: newLists,
        }));

        setDisableAll(false);

        return { type: 'list' };
      }

      return undefined;
    },
  });

  // adds new list item
  const addItem = () => {
    const highestID = maxBy(listItems, 'id');

    const newId = !highestID ? 0 : highestID.id + 1;

    const newLists = lists.map((list) => {
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

    setLists(newLists);
    socket.emit('sendingChanges', JSON.stringify({
      lists: newLists,
    }));
  };

  // handles playing next clip if available
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

  // if any item in list is paused, pause the whole list
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

  const renderCard = (card: ListItem, index: number) => {
    return (
      <Card
        playList={playingList}
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
        setDisableAll={setDisableAll}
        fullDisable={fullDisable}
        socket={socket}
      />
    );
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
          listItems.map((listItem, i) => renderCard(listItem, i))
        )}
      </div>
    </StyledList>
  );
};

export default List;
