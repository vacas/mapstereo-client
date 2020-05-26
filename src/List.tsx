import React, { useState, useCallback, Dispatch, SetStateAction, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Card } from './Card';
import update from 'immutability-helper';
import { ItemTypes } from './ItemTypes';

const style = {
  width: 400,
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
  boxId?: number;
  setBoxes?: Dispatch<SetStateAction<Array<any>>>;
  boxes?: Array<any>
}

const List: React.FC = ({ children, lists, listId, setLists, boxId, boxes, setBoxes }: Props) => {
    const listData = lists && lists.length > 0 && lists.find(list => list.id === listId);
    const { list } = listData || {};
    const [cards, setCards] = useState(list || []);

    // console.log('cards', cards);
    

    const [, dropBox] = useDrop({
      accept: ItemTypes.BOX,
      drop(item: any, monitor) {
        console.log(item);
        
        if (!item.Component) {
          setCards([
            ...cards,
            {
              id: cards.length + 1,
              text: `box #${item.id}`,
              boxId
            }
          ]);
  
          setBoxes([
            ...boxes.filter(box => box.id !== item.id)
          ]);
        }

        return undefined
      },
    });

    useEffect(() => {
      if (!lists || lists.length === 0) {        
        setLists([
          {
            id: listId,
            boxId,
            list: cards
          }
        ]);
      }

      if (!listData || !list || list.length !== cards.length || (listData.id === listId && JSON.stringify(list.map(l => l.id)) !== JSON.stringify(cards.map(c => c.id)))) {
        const newList = lists.map(listItem => {
          if (listItem.id === listId) {
            return {
              ...listItem,
              list: cards
            }
          }

          return listItem;
        });

        setLists(newList);
      }
      
    }, [cards]);

    const moveCard = useCallback(
      (dragIndex: number, hoverIndex: number) => {
        const dragCard = cards[dragIndex]
        setCards(
          update(cards, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard],
            ],
          }),
        )
      },
      [cards],
    )

    const renderCard = (card: { id: number; text: string }, index: number) => {
      return (
        <Card
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
        />
      )
    }

    return (
      <div ref={dropBox}>
        <button onClick={() => {
          const id = cards.length + 1;
          setCards([
            ...cards,
            {
              id,
              text: `Card Item #${id}`,
              boxId
            }
          ])
        }}>Add list item</button>
        <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
        <div>{children}</div>
      </div>
    )
}

export default List;