import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import {createSimpleDB} from "./utils/db.ts";

createSimpleDB({
  name: 'bookDB',
  stores: {
    'my-books-store': {}
  }
}).then(sDB => {
  sDB.forEach('my-books-store', it => {
    if(!it) return;
    it.continue();
  })
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
