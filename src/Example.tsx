import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';
import * as helper from './helper';
import maxBy from 'lodash/maxBy';
import Container from './BackgroundContainer';
import Box from './Box';
import List from './List';
import Recorder from './Recorder';
import socketIOClient from "socket.io-client";

const socket = socketIOClient('ws://127.0.0.1:4001');

const DEFAULT_POSITION = {
  top: 180,
  left: 20,
};

const LIST_DEFAULT_POSITION = {
  top: 20,
  left: 180,
};

const StyledExample = styled.div`
  position: relative;
  overflow: hidden;

  & .globalAddButton {
    position: absolute;
    top: 0;
    z-index: 5;
    left: 0;

    &#addList {
      left: 100px;
    }
  }
`;


const Example = () => {
  const supportsMediaRecorder = helper.supportsMediaRecorder();
  const [fullDisable, setDisableAll] = useState(!supportsMediaRecorder);
  const [boxes, setBoxes] = useState([]);
  const [lists, setLists] = useState([]);
  
  useEffect(() => {
    if (!supportsMediaRecorder) {
      alert('User Media API not supported.');
    }
  }, [supportsMediaRecorder]);
  
  useEffect(() => {
    socket.on('connect', () => {
      console.log('WebSocket Client Connected');
      socket.send('Hello');
     });
     socket.on('receivingChanges', data => {
       const receivedData = data && JSON.parse(data) || { lists: [], boxes: [] };

       const equalLists = helper.isArrayEqual(receivedData.lists, lists);
       const equalBoxes = helper.isArrayEqual(receivedData.boxes, boxes);

       if (!equalLists) {
         setLists(receivedData.lists);
       }

       if (!equalBoxes) {
         setBoxes(receivedData.boxes);
       }
     })
  }, []);

  useEffect(() => {
    socket.emit('sendingChanges', JSON.stringify({
      lists,
      boxes,
    }));
  }, [lists, boxes])


  const moveCard = useCallback(
    (
      dragIndex: number,
      hoverIndex: number,
      listId: number,
      lists: Array<any>
    ) => {
      const listData =
        lists && lists.length > 0 && lists.find((list) => list.id === listId);
      const dragCard = listData.listItems[dragIndex];

      const newList = lists.map((list) => {
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

      setLists(newList);
    },
    [lists]
  );

  const addList = () => {
    const maxBoxId = maxBy(boxes, 'id');
    const maxListId = maxBy(lists, 'id');
    const boxId = !maxBoxId ? 0 : maxBoxId.id + 1;
    const listId = !maxListId ? 0 : maxListId.id + 1;

    setLists([
      ...lists,
      {
        id: listId,
        boxId,
        listItems: [],
      },
    ]);

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
    ]);

    return;
  };

  const addBox = () => {
    const maxBoxId = maxBy(boxes, 'id');
    const boxId = !maxBoxId ? 0 : maxBoxId.id + 1;
    setBoxes([
      ...boxes,
      {
        id: boxId,
        title: `box #${boxId}`,
        ...DEFAULT_POSITION,
      },
    ]);
  };

  return (
    <StyledExample>
      <button
        id="addBox"
        className="globalAddButton"
        disabled={fullDisable}
        onClick={addBox}
      >
        Add Box Item
      </button>
      <button
        id="addList"
        className="globalAddButton"
        disabled={fullDisable}
        onClick={addList}
      >
        Add List
      </button>
      <Container
        boxes={boxes}
        setBoxes={setBoxes}
        fullDisable={fullDisable}
        setDisableAll={setDisableAll}
      />
      {boxes.map((box) => {
        const {
          left,
          top,
          title,
          Component,
          listId,
          id,
          moveCard,
          blobUrl,
        } = box;

        const onStop = (url) => {
          const updatedBox = boxes.map((box) => {
            if (box.id === id) {
              return {
                ...box,
                blobUrl: url,
              };
            }

            return box;
          });

          setBoxes(updatedBox);
        };

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
              fullDisable={fullDisable}
            >
              <React.Fragment>
                {title}
                <Component
                  setDisableAll={setDisableAll}
                  fullDisable={fullDisable}
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
          );
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
            blobUrl={blobUrl}
            fullDisable={fullDisable}
          >
            <React.Fragment>
              {title}
              <Recorder
                fullDisable={fullDisable}
                setDisableAll={setDisableAll}
                onStop={onStop}
                blobUrl={blobUrl}
              />
            </React.Fragment>
          </Box>
        );
      })}
    </StyledExample>
  );
};

export default Example;
