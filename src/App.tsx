import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./App.css";
import ListEci from "./ListEci";
import {
  AccessKey,
  AccessKeyContext,
  Region,
  RegionContext,
  RegionsDispatchContext,
} from "./contexts";
import LoginForm from "./LoginForm";
import CreateEci from "./CreateEci";

const router = createBrowserRouter([
  {
    path: "/",
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
]);

function getAccessKeyFromStorage(): AccessKey {
  const sessionValue = sessionStorage.getItem("caeAccessKey");
  if (sessionValue) return JSON.parse(sessionValue);

  const localValue = localStorage.getItem("caeAccessKey");
  if (localValue) return JSON.parse(localValue);

  return {
    accessKeyId: "",
    accessKeySecret: "",
  };
}

function App() {
  const accessKey = getAccessKeyFromStorage();
  const [regionId, setRegionId] = React.useState("cn-qingdao");
  const [regions, setRegions] = React.useState<Region[]>([]);

  React.useEffect(() => {
    if (
      (!accessKey.accessKeyId || !accessKey.accessKeySecret) &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  });

  return (
    <div className="App">
      <AccessKeyContext.Provider value={accessKey}>
        <RegionContext.Provider value={regionId}>
          <RegionsDispatchContext.Provider value={setRegions}>
            <RouterProvider router={router} />
          </RegionsDispatchContext.Provider>
        </RegionContext.Provider>
      </AccessKeyContext.Provider>
    </div>
  );
}

export default App;
