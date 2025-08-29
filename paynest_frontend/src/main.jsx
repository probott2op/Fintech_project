import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import MouseTracker from './MouseTracker.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <MouseTracker> */}
      <App />
    {/* </MouseTracker> */}
  </StrictMode>
)
