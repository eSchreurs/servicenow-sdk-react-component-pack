import React from 'react';
import ReactDOM from 'react-dom/client';
import { ComponentExplorer } from './ComponentExplorer';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ComponentExplorer />
    </React.StrictMode>
  );
}
