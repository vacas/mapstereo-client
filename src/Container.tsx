import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import Box from './Box';
import List from './List';
import update from 'immutability-helper';

const styles = {
  width: '100%',
  height: '100vh',
  border: '1px solid black',
  position: 'relative',
}

const Container = ({ setBoxes, boxes, setLists, lists }) => {
  const [, drop] = useDrop({
    accept: [ItemTypes.BOX, ItemTypes.CARD, ItemTypes.LIST],
    drop(item: any, monitor) {
      if (item.type === 'box' || item.type === 'list') {
        const delta = monitor.getDifferenceFromInitialOffset();
  
        if (delta) {
          const left = Math.round(item.left + delta.x)
          const top = Math.round(item.top + delta.y)
          moveBox(item.id, left, top)
        }
      }

      if (item.type === 'card') {
        const delta = monitor.getDifferenceFromInitialOffset();
        const newList = lists.map(listData => {
          if (listData.id === item.listId) {
            return {
              ...listData,
              list: listData.list.filter(listItem => listItem.id !== item.id),
            }
          }

          return listData;
        })

        if (newList) {
          setLists(newList)
        }

        if (delta) {
          const left = Math.round(item.left + delta.x)
          const top = Math.round(item.top + delta.y)
          setBoxes([
            ...boxes,
            {
              id: boxes.length + 1,
              title: item.text,
              left,
              top
            }
          ]);
        }
      }

      return undefined
    },
  });

  const moveBox = (id, left, top) => {
    setBoxes(
      update(boxes, {
        $set: ([
          ...boxes.map(box => {
            if (box.id === id) {              
              return {...box, left, top }
            }

            return box;
          }),
        ])
      }),
    )
  }
  return (
    <div ref={drop} style={styles as React.CSSProperties}>
      {boxes.map((box) => {
        const { left, top, title, Component, listId, id } = box
        
        if (Component) {
          return (
            <Box
              key={id}
              id={id}
              left={left}
              top={top}
              isList
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
          >
            {title}
          </Box>
        )
      })}
    </div>
  )
}

export default Container;