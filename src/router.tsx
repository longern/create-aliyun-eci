import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import CreateEci from "./CreateEci";
import ListEci from "./ListEci";
import LoginForm from "./LoginForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <ListEci />,
      },
      {
        path: "/login",
        element: <LoginForm />,
      },
      {
        path: "/create",
        element: <CreateEci />,
      },
    ],
  },
]);

export default router;
