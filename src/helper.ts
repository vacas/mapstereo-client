import { useState, useEffect } from 'react';

export const sortById = (a, b) => {
  if (a.id > b.id) {
    return 1;
  }

  return -1;
}