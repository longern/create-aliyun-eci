import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import "./App.css";
import {
  AccessKey,
  AccessKeyContext,
  Region,
  RegionContext,
  RegionsDispatchContext,
} from "./contexts";
import { AliyunClient } from "./aliyun-client";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import { Menu } from "@mui/icons-material";

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
  const accessKey = React.useMemo(getAccessKeyFromStorage, []);
  const [regionId, setRegionId] = React.useState("cn-qingdao");
  const [regions, setRegions] = React.useState<Region[]>([]);
  const [user, setUser] = React.useState<any>(null);
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

  React.useEffect(() => {
    const client = new AliyunClient(
      accessKey.accessKeyId,
      accessKey.accessKeySecret,
      "https://ims.aliyuncs.com"
    );
    client
      .request("GetUser", {
        UserAccessKeyId: accessKey.accessKeyId,
        Version: "2019-08-15",
      })
      .then((body) => {
        setUser(body.User);
      });
  }, [accessKey]);

  return (
    <div className="App">
      <AccessKeyContext.Provider value={accessKey}>
        <RegionContext.Provider value={regionId}>
          <RegionsDispatchContext.Provider value={setRegions}>
            <AppBar position="static">
              <Toolbar
                variant="dense"
                disableGutters
                sx={{ alignItems: "center" }}
              >
                <IconButton size="large" color="inherit" aria-label="menu">
                  <Menu />
                </IconButton>
                <IconButton component={Link} to="/">
                  <img src="/logo192.png" alt="logo" width="36" height="36" />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ px: 1 }}>{user?.DisplayName}</Box>
              </Toolbar>
            </AppBar>
            <Outlet />
          </RegionsDispatchContext.Provider>
        </RegionContext.Provider>
      </AccessKeyContext.Provider>
    </div>
  );
}

export default App;
