import React from "react";
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import PostEditor from "./views/PostEditor";
import PostDetails from "./views/PostDetails";

const router = createHashRouter([
  {
    path: "/",
    element: <PostEditor />
  },
  {
    path: "/post/:id",
    element: <PostDetails />
  },
]);

function App() {
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
}

export default App;
