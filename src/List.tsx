import React, { useState, useCallback, Dispatch, SetStateAction, useEffect } from 'react'
import { Card } from './Card'
import update from 'immutability-helper'

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
}

const List: React.FC = ({ drop, children, lists, listId, setLists, boxId }: Props) => {
    const listData = lists && lists.length > 0 && lists.find(list => list.id === listId);
    const { list } = listData || {};
    const [cards, setCards] = useState(list || []);

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

      console.log(listData);
      

      if (!listData || !list || list.length !== cards.length || (listData.id === listId && JSON.stringify(list.map(l => l.id)) !== JSON.stringify(cards.map(c => c.id)))) {
        const newList = lists.map(listItem => {
          if (listItem.id && listId) {
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
      <div ref={drop}>
        <button onClick={() => {
          const id = cards.length + 1;
          setCards([
            ...cards,
            {
              id,
              text: `Card Item #${id}`
            }
          ])
        }}>Add list item</button>
        <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
        <div>{children}</div>
      </div>
    )
}

export default List;