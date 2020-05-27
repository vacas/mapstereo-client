import React, { useState, useCallback, Dispatch, SetStateAction, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Card } from './Card';
import { ItemTypes } from './ItemTypes';
import { sortById } from './helper';

const style = {
  width: 400,
  zIndex: 3,
}

export interface Item {
  id: number
  text: string
}

export interface ListState {
  cards: Item[]
}

export interface Props {
  drop?: any;
  children?: React.ReactChild;
  setLists?: Dispatch<SetStateAction<Array<any>>>;
  lists?: Array<any>;
  listId?: number;
  setBoxes?: Dispatch<SetStateAction<Array<any>>>;
  boxes?: Array<any>;
  left?: number;
  top?: number;
  moveCard?: (dragIndex: number, hoverIndex: number, listId: number, lists: Array<any>) => void;
}

const List: React.FC = ({ children, lists, listId, setLists, boxes, setBoxes, left, top, moveCard }: Props) => {
    const listData = lists && lists.length > 0 && lists.find(list => list.id === listId);
    const { list = [] } = listData || {};
    console.log('list right when I get the list: ', list);
    
    // const [cards, setCards] = useState(list || []);

    const [, dropBox] = useDrop({
      accept: ItemTypes.BOX,
      drop(item: any, monitor) {
        if (!item.Component) {
          const newId = list.length === 0 ? 0 : list.sort(sortById).reverse()[0].id + 1;
          const newList = lists.map(list => {
            if (list.id === listId) {
              return {
                // this naming convesion (lists, lists.list, lists.list.list) is confusing, need to rename to listItems, instead
                ...list,
                list: [
                  ...list.list,
                  {
                    id: newId,
                    text: `Card Item #${newId}`,
                    listId
                  }
                ],
              }
            }

            return list;
          })

          console.log('newList in dropBox', newList);
          

          setLists(newList);
  
          setBoxes([
            ...boxes.filter(box => box.id !== item.id)
          ]);
        }

        return undefined
      },
    });

    // useEffect(() => {
    //   if (!lists || lists.length === 0) {        
    //     setLists([
    //       {
    //         id: listId,
    //         boxId,
    //         list: cards
    //       }
    //     ]);
    //   }

    //   if (!listData || !list || list.length !== cards.length || (listData.id === listId && JSON.stringify(list.map(l => l.id)) !== JSON.stringify(cards.map(c => c.id)))) {
    //     const newList = lists.map(listItem => {
    //       if (listItem.id === listId) {
    //         return {
    //           ...listItem,
    //           list: cards
    //         }
    //       }

    //       return listItem;
    //     });

    //     setLists(newList);
    //   }
      
    // }, [cards]);

    // const moveCard = useCallback(
    //   (dragIndex: number, hoverIndex: number) => {
    //     const dragCard = cards[dragIndex]
    //     setCards(
    //       update(cards, {
    //         $splice: [
    //           [dragIndex, 1],
    //           [hoverIndex, 0, dragCard],
    //         ],
    //       }),
    //     )
    //   },
    //   [cards],
    // )

    const renderCard = (card: { id: number; text: string, listId: number }, index: number) => {
      console.log(card);
      
      return (
        <Card
          left={left}
          top={top}
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
          listId={listId}
          lists={lists}
        />
      )
    }

    return (
      <div ref={dropBox}>
        <button onClick={() => {
          const newId = list.length === 0 ? 0 : list.sort(sortById).reverse()[0].id + 1;
          const newList = lists.map(list => {
            if (list.id === listId) {
              return {
                // this naming convesion (lists, lists.list, lists.list.list) is confusing, need to rename to listItems, instead
                ...list,
                list: [
                  ...list.list,
                  {
                    id: newId,
                    text: `Card Item #${newId}`,
                    listId
                  }
                ],
              }
            }

            return list;
          })
          setLists(newList)
        }}>Add list item</button>
        <div style={style}>{list.map((listItem, i) => renderCard(listItem, i))}</div>
        <div>{children}</div>
      </div>
    )
}

export default List;