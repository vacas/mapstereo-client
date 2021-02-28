import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import socketIOClient from 'socket.io-client';
import { getCursorElement, supportsMediaRecorder, isServer } from '../lib/helper';
import maxBy from 'lodash/maxBy';
import DroppableBackground from './DroppableBackground';
import DraggableItems from './DraggableItems';
import Box from './types/box';

const isProduction = process.env.NODE_ENV === 'production' && !isServer && !window.location.hostname.includes('localhost')

const socket = !isServer && socketIOClient(
  `${isProduction ? 'wss' : 'ws'}://${window.location.host}`,
  {
    secure: isProduction,
  }
);

const DEFAULT_POSITION = {
  top: 180,
  left: 20,
};

const LIST_DEFAULT_POSITION = {
  top: 20,
  left: 180,
};

const StyledApp = styled.div`
  position: relative;
  overflow: hidden;

  & .globalAddButton {
    position: absolute;
    top: 0;
    z-index: 5;
    left: 0;

    &#addList {
      left: 80px;
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

  .icons {
    transition: all 250ms;
    &:hover {
      cursor: pointer;
      opacity: 0.5;
    }
  }

  .dropzone {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    border: 1px dashed black;
    position: relative;
    transition: opacity 500ms;

    &.hovering {
      opacity: 0.5;
    }

    & .dropzoneStatus {
      background-color: rgba(0, 0, 0, 0.5);
      height: 100%;
      width: 100%;
      position: absolute;
    }
  }
`;

/*
  TODO LIST:
  - emit message on socket to block box or card if it is being recorded on another side (currently blocks all buttons)
  - display cursor (https://stackoverflow.com/questions/34162200/displaying-cursor-on-every-connected-client-in-socket-io)
*/

const App = () => {
  const mediaRecorderIsSupported = supportsMediaRecorder();
  const [fullDisable, setDisableAll] = useState(!supportsMediaRecorder);
  const [anotherUserIsRecording, setIsRecording] = useState(false);
  const [boxes, setBoxes] = useState([]);

  // if mediaRecorder is not supported, then set alert
  useEffect(() => {
    if (!mediaRecorderIsSupported) {
      alert('User Media API not supported.');
    }
  }, [mediaRecorderIsSupported]);

  // all socket responses handled here
  useEffect(() => {
    socket.on('connect', (data) => {
      console.log('WebSocket Client Connected');
    });
    socket.on('receivingChanges', (data) => {
      const res = data || { lists: [], boxes: [] };

      if (res.boxes) {
        setBoxes(res.boxes);
      }
    });
    socket.on('recordingInProgress', (data) => {
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

  const addItem = (obj) => () => {
    const maxBoxId = maxBy(boxes, 'id');
    const boxId = !maxBoxId ? 0 : maxBoxId.id + 1;
    const newBoxes = [
      ...boxes,
      {
        id: boxId,
        ...obj,
        title: `box #${boxId}`,
      },
    ];
    updateBoxes(newBoxes);
  };

  const updateBoxes = (updatedBoxes: Array<Box>): void => {
    setBoxes(updatedBoxes);
    
    socket.emit('sendingChanges', {
      boxes: updatedBoxes,
    });
  };

  return (
    <StyledApp>
      <button
        id="addCard"
        className="globalAddButton"
        disabled={fullDisable}
        onClick={addItem({
          type: 'card',
          isListItem: false,
          ...DEFAULT_POSITION,
        })}
      >
        Add Card
      </button>
      <button
        id="addList"
        className="globalAddButton"
        disabled={fullDisable}
        onClick={addItem({
          type: 'list',
          isListItem: false,
          cards: [],
          ...LIST_DEFAULT_POSITION,
        })}
      >
        Add List
      </button>
      {anotherUserIsRecording && (
        <p className="interactionMessage">Another user is recording</p>
      )}
      <DroppableBackground
        boxes={boxes}
        updateBoxes={updateBoxes}
        setDisableAll={setDisableAll}
      />
      {boxes.map((box) => (
        <DraggableItems
          key={box.id}
          setDisableAll={setDisableAll}
          fullDisable={fullDisable}
          updateBoxes={updateBoxes}
          currentBox={box}
          boxes={boxes}
          socket={socket}
        />
      ))}
    </StyledApp>
  );
};

export default App;
