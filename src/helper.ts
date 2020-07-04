import { useState, useEffect } from 'react';

export const sortById = (a, b) => {
  if (a.id > b.id) {
    return 1;
  }

  return -1;
};

export const debounce = (callback: any, timeout: number) => {
  return setTimeout(() => callback(), timeout);
};

const getWidth = () =>
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

const getHeight = () =>
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

export const useCurrentWidth = () => {
  const [width, setWidth] = useState(getWidth());

  useEffect(() => {
    let timeoutId = null;
    const resizeListener = () => {
      clearTimeout(timeoutId);
      timeoutId = debounce(() => setWidth(getWidth()), 150);
    };
    // set resize listener
    window.addEventListener('resize', resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  return width;
};

export const useCurrentHeight = () => {
  const [height, setheight] = useState(getHeight());

  useEffect(() => {
    let timeoutId = null;
    const resizeListener = () => {
      clearTimeout(timeoutId);
      timeoutId = debounce(() => setheight(getHeight()), 150);
    };
    // set resize listener
    window.addEventListener('resize', resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  return height;
};

export const getRecorderId = (listId?: number, cardId?: number, blobUrl?: string) => `${listId || listId === 0? `listId-${listId}-` : ''}${
  cardId || cardId === 0 ? `_cardId-${cardId}-` : ''
}${blobUrl}`;
