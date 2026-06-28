import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChatProvider } from './context/ChatContext'
import { ThemeProvider } from './hooks/ThemeContext.tsx'
import './hooks/Theme.css'   // ← global tokens, loaded before anything renders
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </ThemeProvider>
  </StrictMode>,
)