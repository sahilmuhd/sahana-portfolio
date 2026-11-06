import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Scroll animations start hidden only when motion is welcome, so content can never get stuck invisible.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion')

createRoot(document.getElementById('root')).render(<App />)
