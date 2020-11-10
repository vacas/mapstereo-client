import { useState, useEffect, useRef } from 'react';
import _ from 'lodash';

export const isServer = typeof window === 'undefined';

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
  !isServer && window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

const getHeight = () =>
  !isServer && window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

export const useCurrentWidth = () => {
  if (isServer) return;
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
  if (isServer) return;
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

export const getRecorderId = (
  listId?: number,
  cardId?: number,
  blobUrl?: string
) =>
  `${listId || listId === 0 ? `listId-${listId}-` : ''}${
    cardId || cardId === 0 ? `_cardId-${cardId}-` : ''
  }${blobUrl}`;

  export const supportsMediaRecorder = () => {
    if (isServer) return;
    const navigator = <any>window.navigator;

    return navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }

  export const isArrayEqual = (x, y) => {
    const diff = _(x).differenceWith(y, _.isEqual);
    
    return diff.isEmpty();
  };

  export const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  export const randomColor = () => Math.floor(Math.random()*16777215).toString(16);

  export const getCursorElement = (id) => {
    const elementId = 'cursor-' + id;
    let element = document.getElementById(elementId);
    if(element == null) {
      element = document.createElement('div');
      element.id = elementId;
      element.className = 'cursor';
      element.style.backgroundColor = randomColor();
      // Perhaps you want to attach these elements another parent than document
      document.appendChild(element);
    }
    return element;
  }