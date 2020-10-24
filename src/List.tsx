import React, { useState, Dispatch, SetStateAction, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import Card from './Card';
import { ItemTypes } from './ItemTypes';
import maxBy from 'lodash/maxBy';
import { getRecorderId } from './helper';
import BoxType from './types/box';
import update from 'immutability-helper';

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
  deleteBox
}: Props) => {
  // if a box is dropped inside a list, box becomes into a list item and gets removed from droppable_background
  const [, drop] = useDrop({
    accept: [ItemTypes.CARD],
    drop: (item: any) => {
      console.log('drop item on list', item);
      
      if (item.type === 'card') {
        const listIndex = boxes.findIndex(box => box.id === id);
        
        
        console.log('listIndex', listIndex);
        
        console.log('item.id', item.id);
        console.log('boxes[listIndex]', boxes[listIndex]);
        
        console.log('before adding cards - boxes', boxes);
        
        if (!boxes[listIndex].cards.includes(item.id)) {
          const cardIndex = boxes.findIndex(box => box.id === item.id);
          let newBoxes;
          newBoxes = update(boxes, {
            [listIndex]: {
              cards: { 
                $push: [item.id]
              }
            }
          });
          
          console.log('after adding cards - newBoxes', newBoxes);
  
          newBoxes = update(newBoxes, {
            [cardIndex]: {
              $apply: (box) => ({
                ...box,
                isListItem: true,
              })
            }
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
    const highestID = maxBy(boxes, 'id');

    const newId = highestID.id + 1;

    console.log('newId', newId);

    console.log('boxes inside addItem', boxes);

    let newBoxes = update(boxes, {$push: [{
        type: 'card',
        top,
        left,
        id: newId,
        title: `box #${newId}`,
        isListItem: true,
        blobUrl: undefined,
      }]})

    newBoxes = update(newBoxes, {
      [id]: { cards: { $push: [newId]} }
    });

    console.log('newBoxes inside addItem', newBoxes);
    

    updateBoxes(newBoxes);
  };

  const moveCard = (
    dragIndex: number,
    hoverIndex: number,
    cardId: number
  ) => {
    const listIndex = boxes.findIndex(box => {
      if (box.type === 'list' && box.cards.includes(cardId)) {
        return true;
      }

      return false;
    })

    const newBoxes = update(boxes, {
      [listIndex]: {
        cards: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, cardId],
          ],
        }
      }
    });

    console.log('boxes', boxes);
    console.log('newBoxes', newBoxes);
    console.log('dragIndex', dragIndex);
    console.log('hoverIndex', hoverIndex);
    console.log('cardId', cardId);
    console.log('listIndex', listIndex);
    console.log('boxes[listIndex]', boxes[listIndex]);
    
    
    

    updateBoxes(newBoxes);
    // const listData =
    // lists && lists.length > 0 && lists.find((list) => list.id === listId);
    // const dragCard = listData.listItems[dragIndex];
    // const newLists = lists.map((list) => {
    //   if (list.id === listId) {
    //     const reorganizedListItems = update(list.listItems, {
    //       $splice: [
    //         [dragIndex, 1],
    //         [hoverIndex, 0, dragCard],
    //       ],
    //     });
    //     return {
    //       ...list,
    //       listItems: reorganizedListItems,
    //     };
    //   }
    //   return list;
    // });
    // setLists(newLists);
    // socket.emit('sendingChanges', {
    //   // lists: newLists,
    // });
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
              <Card
                boxes={boxes}
                playList={playingList}
                left={left}
                top={top}
                key={listItem.id}
                index={i}
                id={listItem.id}
                title={listItem.title}
                blobUrl={listItem.blobUrl}
                type={listItem.type}
                moveCard={moveCard}
                setDisableAll={setDisableAll}
                updateBoxes={updateBoxes}
                fullDisable={fullDisable}
                isListItem={listItem.isListItem}
                onStop={onStop}
                deleteBox={deleteBox}
              />
            ))
        )}
      </div>
    </StyledList>
  );
};

export default List;
