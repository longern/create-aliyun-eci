import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import CreateEci from "./CreateEci";
import ListEci from "./ListEci";
import ListTemplates from "./ListTemplates";
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
      {
        path: "/templates",
        element: <ListTemplates />,
      },
    ],
  },
]);

export default router;
