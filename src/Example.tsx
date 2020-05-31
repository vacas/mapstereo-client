import React, { useState, useCallback } from 'react';
import update from 'immutability-helper';
import Container from './BackgroundContainer';
import Box from './Box';
import List from './List';
import maxBy from 'lodash/maxBy';

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

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number, listId: number, lists: Array<any>) => {
      const listData = lists && lists.length > 0 && lists.find(list => list.id === listId);
      const dragCard = listData.listItems[dragIndex]

      const newList = lists.map(list => {
        if (list.id === listId) {
          const reorganizedListItems = update(list.listItems, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard],
            ],
          });
          

          return {
            ...list,
            listItems: reorganizedListItems,
          };
        }

        return list;
      });

      setLists(newList)
    },[lists]
  )

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
    }}>
      <button style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 5,
      }} onClick={() => {
        const maxBoxId = maxBy(boxes, 'id');
        const boxId = !maxBoxId ? 0 : maxBoxId.id + 1;
        setBoxes([
          ...boxes,
          {
            id: boxId,
            title: `box #${boxId}`,
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
        const maxBoxId = maxBy(boxes, 'id');
        const maxListId = maxBy(lists, 'id');
        const boxId = !maxBoxId ? 0 : maxBoxId.id + 1;
        const listId = !maxListId ? 0 : maxListId.id + 1;

        setLists([
          ...lists,
          {
            id: listId,
            boxId,
            listItems: []
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
      <Container boxes={boxes} setBoxes={setBoxes} />
      {boxes.map((box) => {
        const { left, top, title, Component, listId, id, moveCard } = box
        
        if (Component) {
          return (
            <Box
              key={id}
              id={id}
              left={left}
              top={top}
              isList
              title={title}
              setBoxes={setBoxes}
              boxes={boxes}
            >
              <React.Fragment>
                {title}
                <Component 
                  setLists={setLists} 
                  lists={lists} 
                  listId={listId} 
                  boxId={id}
                  left={left}
                  top={top}
                  setBoxes={setBoxes} 
                  boxes={boxes}
                  moveCard={moveCard}
                />
              </React.Fragment>
            </Box>
          )
        }

        return (
          <Box
            key={id}
            id={id}
            left={left}
            top={top}
            title={title}
            setBoxes={setBoxes}
            boxes={boxes}
          >
            {title}
          </Box>
        )
      })}
    </div>
  )
}

export default Example;