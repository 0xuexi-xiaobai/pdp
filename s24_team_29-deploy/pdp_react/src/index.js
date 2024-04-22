import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './contexts/UserContext';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider locale={enUS}>
    <UserProvider>
      <App />
    </UserProvider>
  </ConfigProvider>
);

reportWebVitals();