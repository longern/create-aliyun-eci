import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import "./App.css";
import {
  AccessKey,
  AccessKeyContext,
  Region,
  RegionContext,
  RegionsDispatchContext,
} from "./contexts";

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
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (
      (!accessKey.accessKeyId || !accessKey.accessKeySecret) &&
      location.pathname !== "/login"
    ) {
      navigate("/login");
    }
  });

  return (
    <div className="App">
      <AccessKeyContext.Provider value={accessKey}>
        <RegionContext.Provider value={regionId}>
          <RegionsDispatchContext.Provider value={setRegions}>
            <Outlet />
          </RegionsDispatchContext.Provider>
        </RegionContext.Provider>
      </AccessKeyContext.Provider>
    </div>
  );
}

export default App;
