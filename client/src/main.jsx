import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f9fafb',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    />
  </React.StrictMode>,
)
