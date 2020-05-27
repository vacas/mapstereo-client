import React, { useState, useEffect, useCallback } from 'react';
import update from 'immutability-helper';
import Container from './Container';
import List from './List';

const DEFAULT_POSITION = {
  top: 180,
  left: 20,
}

const LIST_DEFAULT_POSITION = {
  top: 20,
  left: 180,
}


const Example = () => {
  const [boxes, setBoxes] = useState([]);
  const [lists, setLists] = useState([]);

  // useEffect(() => {}, [lists]);

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number, listId: number, lists: Array<any>) => {
      const listData = lists && lists.length > 0 && lists.find(list => list.id === listId);
      const dragCard = listData.list[dragIndex]

      console.log(lists);

      const newList = lists.map(list => {
        if (list.id === listId) {
          const reorganizedListItems = update(list.list, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard],
            ],
          });

          console.log();
          

          return {
            ...list,
            list: reorganizedListItems,
          };
        }

        return list;
      });

      console.log(newList);

      // const reorganizedListItems = {
      //   update(listData, {
      //     $splice: [
      //       [dragIndex, 1],
      //       [hoverIndex, 0, dragCard],
      //     ],
      //   }),
      // }
      setLists(newList)
    },[lists]
  )

  return (
    <div style={{
      position: 'relative'
    }}>
      <button style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 5,
      }} onClick={() => {
        const id = boxes.length + 1;
        setBoxes([
          ...boxes,
          {
            id,
            title: `box #${id}`,
            ...DEFAULT_POSITION
          },
        ])
      }}>Add Box Item</button>
      <button style={{
        position: 'absolute',
        top: 0,
        left: 100,
        zIndex: 5,
      }} onClick={() => {
        const boxId = boxes.length + 1;
        const listId = lists.length + 1;

        setLists([
          ...lists,
          {
            id: listId,
            boxId,
            list: []
          },
        ])

        setBoxes([
          ...boxes,
          {
            id: boxId,
            title: `box #${boxId}`,
            ...LIST_DEFAULT_POSITION,
            listId,
            Component: List,
            moveCard,
          },
        ])
      }}>Add List</button>
      <Container boxes={boxes} setBoxes={setBoxes} lists={lists} setLists={setLists} />
    </div>
  )
}

export default Example;