import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './app/styles.css'
import './app/profile-tiers.css'
import './app/home.css'
import './app/profile.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
