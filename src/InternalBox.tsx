import React, { useState, Dispatch, SetStateAction } from 'react';
import { Check, Edit } from 'react-feather';
import List, { ListItem } from './List';
import Card from './Card';
import Recorder from './Recorder';
import BoxType from './types/box';

interface Props {
  boxes: Array<BoxType>;
  setBoxes: Dispatch<SetStateAction<Array<BoxType>>>;
  setDisableAll: Dispatch<SetStateAction<boolean>>;
  fullDisable?: boolean;
  socket?: SocketIOClient.Socket;
  moveCard?: (
    dragIndex: number,
    hoverIndex: number,
    listId: number,
    lists: Array<any>
  ) => void;
  lists?: any;
  setLists?: Dispatch<SetStateAction<Array<any>>>;

  // current box
  box: BoxType;
}

const InternalBox = ({
  setBoxes,
  boxes,
  setDisableAll,
  fullDisable,
  setLists,
  lists,
  box,
  moveCard,
  socket,
}: Props) => {
  const [edit, setEdit] = useState(false);
  const [playingList, setPlayList] = useState(false);
  const { left, top, title, listId, id, blobUrl } = box;
  const [editedTitle, setEditedTitle] = useState(title);

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
    const listData: { listItems: Array<ListItem> } =
      lists && lists.length > 0 && lists.find((list) => list.id === listId);
    const { listItems } = listData || { listItem: [{ id: 0 }] };

    return (
      <React.Fragment>
        {title}
        <List
          setDisableAll={setDisableAll}
          fullDisable={fullDisable}
          setLists={setLists}
          lists={lists}
          listId={listId}
          setBoxes={setBoxes}
          boxes={boxes}
          socket={socket}
          listItems={listItems}
          setPlayList={setPlayList}
          playingList={playingList}
        >
          <div className="cardWrapper">
            {listItems.length === 0 ? (
              <div className="dropzone">Drop box here</div>
            ) : (
              listItems.map((listItem, i) => {
                return (
                  <Card
                    playList={playingList}
                    left={left}
                    top={top}
                    key={listItem.id}
                    index={i}
                    id={listItem.id}
                    title={listItem.title}
                    blobUrl={listItem.blobUrl}
                    moveCard={moveCard}
                    listId={listId}
                    lists={lists}
                    setLists={setLists}
                    setDisableAll={setDisableAll}
                    fullDisable={fullDisable}
                    socket={socket}
                  />
                );
              })
            )}
          </div>
        </List>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {!edit ? (
        <React.Fragment>
          {title}{' '}
          <span className="icons" onClick={() => setEdit(true)}>
            <Edit size={12} />
          </span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />{' '}
          <span className="icons" onClick={() => setEdit(false)}>
            <Check size={12} />
          </span>
        </React.Fragment>
      )}
      <Recorder
        fullDisable={fullDisable}
        setDisableAll={setDisableAll}
        onStop={onStop}
        blobUrl={blobUrl}
        socket={socket}
        title={title}
      />
    </React.Fragment>
  );
};

export default InternalBox;
