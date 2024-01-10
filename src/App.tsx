import './App.scss'
import {RouterProvider} from 'react-router-dom'
import useTheme from "./hooks/useTheme.tsx";
import {router} from "./router";

export default function App(){
  useTheme();

  return <RouterProvider router={router} />
}
