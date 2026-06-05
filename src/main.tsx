import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/context/AuthContext'
import { LocaleProvider } from '@/context/LocaleContext'
import { ToastProvider } from '@/context/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </LocaleProvider>
  </StrictMode>,
)
