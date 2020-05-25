import React, { useState, useCallback } from 'react'
import Box from './Box';
import update from 'immutability-helper'

const style = {
  width: 400,
}
const DEFAULT_POSITION = {
  top: 180,
  left: 20,
}


const List = () => {
  {
    const [cards, setCards] = useState([
      {
        id: 1,
        text: 'Write a cool JS library',
      },
      {
        id: 2,
        text: 'Make it generic enough',
      },
      {
        id: 3,
        text: 'Write README',
      },
      {
        id: 4,
        text: 'Create some examples',
      },
      {
        id: 6,
        text: '???',
      },
      {
        id: 7,
        text: 'PROFIT',
      },
    ])
    const moveCard = useCallback(
      (dragIndex, hoverIndex) => {
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
    const renderCard = (card, index) => {
      return (
        <Box
          key={card.id}
          index={index}
          id={card.id}
          moveCard={moveCard}
          {...DEFAULT_POSITION}
        >
          {card.text}
        </Box>
      )
    }
    return (
      <>
        <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
      </>
    )
  }
}

export default List;