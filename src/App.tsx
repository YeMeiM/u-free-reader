import './App.scss'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from "./views/home/Home.tsx";
import useTheme from "./hooks/useTheme.tsx";

export default function App(){
  useTheme();

  return (<BrowserRouter>
    <Routes>
      <Route path={'/'} element={<HomePage />} />
    </Routes>
  </BrowserRouter>)
}
