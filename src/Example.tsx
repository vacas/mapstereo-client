import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';
import { getCursorElement, supportsMediaRecorder } from './helper';
import maxBy from 'lodash/maxBy';
import Container from './BackgroundContainer';
import Box from './Box';
import List from './List';
import Recorder from './Recorder';
import socketIOClient from "socket.io-client";

const socket = socketIOClient(`${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}://${window.location.host}`, {
  secure: process.env.NODE_ENV === 'production'
});

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

  .interactionMessage {
    position: absolute;
    top: 20px;
    z-index: 5;
    left: 10px;
    font-size: 11px;
    color: red;
  }
`;


/*
  TODO LIST:
  - Make custom state for setBoxes and setLists to clean up socket.emit (https://dev.to/filippofilip95/i-replaced-usestate-hook-with-custom-one-3dn1)
  - Enhance move card experience
  - emit message on socket to block box or card if it is being recorded on another side (currently blocks all buttons)
  - display cursor (https://stackoverflow.com/questions/34162200/displaying-cursor-on-every-connected-client-in-socket-io)
*/

const Example = () => {
  const mediaRecorderIsSupported = supportsMediaRecorder();
  const [fullDisable, setDisableAll] = useState(!supportsMediaRecorder);
  const [anotherUserIsRecording, setIsRecording] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [lists, setLists] = useState([]);
  
  useEffect(() => {
    if (!mediaRecorderIsSupported) {
      alert('User Media API not supported.');
    }
  }, [mediaRecorderIsSupported]);
  
  useEffect(() => {
    socket.on('connect', (data) => {
      console.log('WebSocket Client Connected');
     });
     socket.on('receivingChanges', data => {
       const res = data || { lists: [], boxes: [] };

       if (res.lists) {
        setLists(res.lists);
       }

       if (res.boxes) {
        setBoxes(res.boxes);
       }
     });
     socket.on('recordingInProgress', data => {
       const res = data || { recording: false };

       console.log('res', res);
       

       setDisableAll(res.recording);
       setIsRecording(res.recording);
     });
     socket.on('draw_cursor', (data) => {
      const res = data;
      const el = getCursorElement(res.id) as HTMLElement;
      el.style.top = res.line[0].x;
      el.style.left = res.line[0].y;
    });
  }, []);


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

      const newLists = lists.map((list) => {
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

      setLists(newLists);
      socket.emit('sendingChanges', {
        lists: newLists,
      });
    },
    [lists]
  );

  const addList = () => {
    const maxBoxId = maxBy(boxes, 'id');
    const maxListId = maxBy(lists, 'id');
    const boxId = !maxBoxId ? 0 : maxBoxId.id + 1;
    const listId = !maxListId ? 0 : maxListId.id + 1;
    const newLists = [
      ...lists,
      {
        id: listId,
        boxId,
        listItems: [],
      },
    ];
    const newBoxes = [
      ...boxes,
      {
        id: boxId,
        title: `box #${boxId}`,
        ...LIST_DEFAULT_POSITION,
        listId,
      },
    ];

    setLists(newLists);
    setBoxes(newBoxes);

    socket.emit('sendingChanges', {
      lists: newLists,
      boxes: newBoxes,
    });
    return;
  };

  const addBox = () => {
    const maxBoxId = maxBy(boxes, 'id');
    const boxId = !maxBoxId ? 0 : maxBoxId.id + 1;
    const newBoxes = [
      ...boxes,
      {
        id: boxId,
        title: `box #${boxId}`,
        ...DEFAULT_POSITION,
      },
    ];
    setBoxes(newBoxes);
    socket.emit('sendingChanges', {
      boxes: newBoxes,
    });
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
      {anotherUserIsRecording && <p className="interactionMessage">Another user is recording</p>}
      <Container
        boxes={boxes}
        setBoxes={setBoxes}
        fullDisable={fullDisable}
        setDisableAll={setDisableAll}
        socket={socket}
      />
      {boxes.map((box) => {
        const {
          left,
          top,
          title,
          listId,
          id,
          blobUrl,
        } = box;

        const onStop = (url) => {
          const updatedBoxes = boxes.map((box) => {
            if (box.id === id) {
              return {
                ...box,
                blobUrl: url,
              };
            }

            return box;
          });

          setBoxes(updatedBoxes);
          socket.emit('sendingChanges', {
            boxes: updatedBoxes,
          });
        };

        if (listId || listId === 0) {
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
              socket={socket}
            >
              <React.Fragment>
                {title}
                <List
                  setDisableAll={setDisableAll}
                  fullDisable={fullDisable}
                  setLists={setLists}
                  lists={lists}
                  listId={listId}
                  left={left}
                  top={top}
                  setBoxes={setBoxes}
                  boxes={boxes}
                  moveCard={moveCard}
                  socket={socket}
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
                socket={socket}
              />
            </React.Fragment>
          </Box>
        );
      })}
    </StyledExample>
  );
};

export default Example;
