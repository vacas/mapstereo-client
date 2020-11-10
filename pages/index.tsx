import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from '../components/App';

const HomePage = () => (
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);

export default HomePage;