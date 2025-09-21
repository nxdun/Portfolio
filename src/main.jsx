import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

// Check if running on localhost
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1'

// Use StrictMode only on localhost
if (isLocalhost) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  root.render(<App />)
}

// Add Google Tag Manager script to the head
const gtmScript = document.createElement('script');
gtmScript.async = true;
gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-54K4GF5J';
document.head.appendChild(gtmScript);

// Add Google Tag Manager noscript to the body
const gtmNoscript = document.createElement('noscript');
gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-54K4GF5J" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
document.body.insertBefore(gtmNoscript, document.body.firstChild);
