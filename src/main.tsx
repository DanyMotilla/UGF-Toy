import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/features/core/styles/index.css'
import App from '@/features/core/components/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
