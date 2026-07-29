import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider }     from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import App from './App';
import './assets/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition:   true,
        v7_relativeSplatPath: true,
      }}
    >
      <SettingsProvider>
        <CartProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 2000,
              style: {
                fontFamily:   'Poppins, sans-serif',
                fontSize:     '0.875rem',
                borderRadius: '12px',
                marginBottom: '16px',
              },
              success: {
                style:     { background: '#2D5016', color: '#fff' },
                iconTheme: { primary: '#E8C56A', secondary: '#2D5016' },
              },
              error: {
                style: { background: '#7f1d1d', color: '#fff' },
              },
            }}
          />
        </CartProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
