import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ThemeProvider from './components/shared/ThemeProvider'
import ThemeSwitcher from './components/shared/ThemeSwitcher'
import './styles/global.css'
import './styles/tidal.css'
// import './styles/boundary.css'
import './styles/products.css'
import './styles/voice.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <ThemeSwitcher />
    </ThemeProvider>
  </React.StrictMode>,
)
