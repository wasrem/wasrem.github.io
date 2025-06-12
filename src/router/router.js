import React from "react"
import { createHashRouter } from "react-router-dom"
import App from "../App"
import Home from "../pages/Home"
import SearchByIndstrytyCd from "../pages/apps/search_base/ByIndstrytyCd/SearchByIndstrytyCd"


const routes = [
  { path: "/", element: <Home /> },

  // Apps

  { path: "/search_base/ByIndstrytyCd", element: <SearchByIndstrytyCd /> },
  { path: "/search_base/ByIndstrytyCd/", element: <SearchByIndstrytyCd /> },
  { path: "/search_base/ByIndstrytyCd/", element: <SearchByIndstrytyCd /> },
  { path: "/search_base/ByIndstrytyCd/", element: <SearchByIndstrytyCd /> },
]

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: routes.map((route) => {
      return {
        index: route.path === "/",
        path: route.path === "/" ? undefined : route.path,
        element: route.element,
      }
    }),
  },
])

export default router
