import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import './index.css';
import App from './App.jsx';
import { store, persistor } from './redux/store';

const hostname = window.location.hostname;
const useHashRouter = !['localhost'].includes(hostname);

const Router = useHashRouter ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename={import.meta.env.BASE_URL}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </Router>
  </StrictMode>
);