import React, { useState, useEffect, useRef, Dispatch, SetStateAction, useCallback } from 'react';
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
  const audioRef = useRef(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
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

  const playNextClip = useCallback((e) => {
    if (playingList) {
      const nextSibling = e.target.parentElement.parentElement.parentElement.parentElement.nextElementSibling;
      if (nextSibling && nextSibling.getElementsByTagName('audio')[0]) {
        audioRef.current = nextSibling.getElementsByTagName('audio')[0];
        audioRef.current.play();
        audioRef.current.addEventListener('ended', playNextClip);
      }
      // setCurrentlyPlaying(cur + 1);
      // playList(currentlyPlaying + 1);
    } else {
      audioRef.current = null;
      setPlayList(false);
      // setCurrentlyPlaying(null);
    }
    console.log('currentlyPlaying', audioRef.current);
  }, [playingList, setPlayList]);

  // const pauseList = (audioTag) => {
  //   if (audioTag.paused && audioTag.duration !== audioTag.currentTime) {
  //     // isPlaying = false;
  //     // setPlayList(false);
  //     setCurrentlyPlaying(null);
  //     return;
  //   }
  // };

  const playList = (n: number) => {
    const listItem = listItems[n];
    console.log('listItem', listItem);
    
    if (listItem) {
      setCurrentlyPlaying(n);
      const { id, listId, blobUrl } = listItem;
      const audioTag = document.getElementById(
        `${listId ? `listId-${listId}-` : ''}${
          id ? `cardId-${id}-` : ''
        }${blobUrl}`
      ) as HTMLAudioElement;

      audioRef.current = audioTag;
      audioTag.currentTime = 0;

      // console.log('playingList', playingList);

      // @ts-ignore
      // audioTag.onpause = ((e: CustomEvent) => {
        // if (playingList && audioTag.paused && audioTag.duration !== audioTag.currentTime) {
          // console.log('playingList on pause', playingList);
          
          // isPlaying = false;
          // setPlayList(false);
          // audioTag.removeEventListener('ended', playNextClip);
          // audioTag.removeEventListener('paused', pauseList);
          // return;
        // }
      // });

      // @ts-ignore
      // audioTag.onended = ((e: CustomEvent) => {
        // console.log('playingList on ended', playingList);
        // if (playingList && listItems[n + 1]) {
          // playList(n + 1);
        // } else {
          // setPlayList(false);
          // audioTag.removeEventListener('ended', playNextClip);
      //   }
      // });

      audioTag.addEventListener('ended', playNextClip);
      // audioTag.addEventListener('paused', pauseList);
      audioTag.play();
    }
  };

  useEffect(() => {
    console.log('playingList', playingList);
    console.log('audioRef', audioRef);
    
    if (!playingList) {
      for (let i = 0; i < listItems.length; i++) {
        const { id, blobUrl } = listItems[i];
        
        const audioTag = document.getElementById(
          `${listId ? `listId-${listId}-` : ''}${
            id ? `cardId-${id}-` : ''
          }${blobUrl}`
        ) as HTMLAudioElement;

        audioTag.removeEventListener('ended', playNextClip);
        // audioTag.removeEventListener('paused', pauseList);
        return;
      }
      setCurrentlyPlaying(null);

      return;
    }
    
    return playList(0);
  }, [playingList]);

  useEffect(() => {
    if (currentlyPlaying + 1 === listItems.length) {
      setCurrentlyPlaying(null);
      setPlayList(false);
    }
    // console.log(currentlyPlaying);
    
  }, [currentlyPlaying])

  const renderCard = (card: ListItem, index: number) => {
    return (
      <Card
        setPlayList={setPlayList}
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
          // if (currentlyPlaying === null) {
          //   playList(0);
          //   // setCurrentlyPlaying(0);
          // } else {
          //   setCurrentlyPlaying(null);
          // }
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
