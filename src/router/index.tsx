import {createHashRouter} from "react-router-dom";
import LazyElement from "../components/LazyElement";
import {lazy} from "react";

export const router = createHashRouter([
  {
    path: '/',
    element: <LazyElement ele={lazy(() => import('@/views/home/Home'))} />,
  },
  {
    path: '/test',
    element: <LazyElement ele={lazy(() => import('@/views/test'))} />
  },
  {
    path: '/mines',
    element: <LazyElement ele={lazy(() => import('@/views/mines'))} />
  }
])
