import React, { Dispatch, SetStateAction } from 'react';
import { useDrop } from 'react-dnd';
import { Card } from './Card';
import { ItemTypes } from './ItemTypes';
import maxBy from 'lodash/maxBy';

const style = {
  width: 400,
  zIndex: 3,
  margin: '10px 0',
}

export interface ListItem {
  id?: number
  title?: string,
  listId?: number,
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
  moveCard?: (dragIndex: number, hoverIndex: number, listId: number, lists: Array<any>) => void;
}

const List = ({ lists, listId, setLists, boxes, setBoxes, left, top, moveCard }: Props) => {
    const listData: { listItems: Array<ListItem> } = lists && lists.length > 0 && lists.find(list => list.id === listId);
    const { listItems } = listData || { listItem: [{ id: 0 }] };

    const [, drop] = useDrop({
      accept: [ItemTypes.BOX, ItemTypes.CARD],
      drop: (item: any) => {
        if (item.type === 'box' && !item.Component) {
          const highestID = maxBy(listItems, 'id');
          
          const newId = !highestID ? 0 : highestID.id + 1;

          const newList = lists.map(list => {
            if (list.id === listId) {
              return {
                ...list,
                listItems: [
                  ...list.listItems,
                  {
                    id: newId,
                    title: item.title,
                    listId
                  }
                ],
              }
            }

            return list;
          })

          setLists(newList);
  
          setBoxes([
            ...boxes.filter(box => box.id !== item.id)
          ]);

          return { type: 'list' };
        }

        return undefined
      },
    });

    const renderCard = (card: ListItem, index: number) => {      
      return (
        <Card
          left={left}
          top={top}
          key={card.id}
          index={index}
          id={card.id}
          title={card.title}
          moveCard={moveCard}
          listId={listId}
          lists={lists}
          setLists={setLists}
        />
      )
    }

    return (
      <div ref={drop}>
        <button onClick={() => {
          const highestID = maxBy(listItems, 'id');
          
          const newId = !highestID ? 0 : highestID.id + 1;

          const newList = lists.map(list => {
            if (list.id === listId) {
              console.log('before push', list.listItems);
              const newList = [
                ...list.listItems,
                {
                  id: newId,
                  title: `Card Item #${newId}`,
                  listId
                }
              ];

              return {
                ...list,
                listItems: newList
              }
            }

            return list;
          })
          console.log(newList);
          
          setLists(newList)
        }}>Add list item</button>
        <div style={style}>
          {listItems.length === 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 50,
              border: '1px dashed black'
            }}>
              Drop box here
            </div>
          )}
          {listItems.length > 0 && listItems.map((listItem, i) => renderCard(listItem, i))}
        </div>
      </div>
    )
}

export default List;