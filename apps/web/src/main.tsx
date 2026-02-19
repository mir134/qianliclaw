import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
  if (e.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
handleThemeChange(darkModeQuery);
darkModeQuery.addEventListener('change', handleThemeChange);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
