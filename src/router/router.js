import React from "react"
import { createHashRouter } from "react-router-dom"
import App from "../App"
import Home from "../pages/Home"
import G2bBidSearch from "pages/apps/search_base/g2b/G2bBidSearch"
import NuriBidSearch from "pages/apps/search_base/nuri_g2b/NuriBidSearch"

const routes = [
  { path: "/", element: <Home /> },

  // Apps

  { path: "/search_base/g2b_bid_search", element: <G2bBidSearch /> },
  { path: "/search_base/nuri_g2b_search/", element: <NuriBidSearch /> },
  { path: "/search_base/g2b_bid_search/", element: <G2bBidSearch /> },
  { path: "/search_base/g2b_bid_search/", element: <G2bBidSearch /> },
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
