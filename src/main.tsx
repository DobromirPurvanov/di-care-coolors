import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './theme/tokens.css'
import './index.css'
import App from './App'
import { ThemeProvider } from './theme/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
)
