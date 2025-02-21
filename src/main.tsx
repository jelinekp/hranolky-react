import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './style/actify-color-theme.css'
import './style/colors.css'
import './style/fonts.css'
import './style/globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
