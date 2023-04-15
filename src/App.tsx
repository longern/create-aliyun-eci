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
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Toolbar,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import { withTranslation } from "react-i18next";

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

function deleteAccessKeyFromStorage() {
  sessionStorage.removeItem("caeAccessKey");
  localStorage.removeItem("caeAccessKey");
}

function App() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
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

  const DrawerList = withTranslation()(function ({
    t,
  }: {
    t: (key: string) => string;
  }) {
    return (
      <List>
        <ListItem>
          <ListItemButton component={Link} to="/">
            {t("Container Groups")}
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton component={Link} to="/templates">
            {t("Launch Templates")}
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemButton
            onClick={() => {
              deleteAccessKeyFromStorage();
              navigate("/login");
            }}
          >
            {t("Logout")}
          </ListItemButton>
        </ListItem>
      </List>
    );
  });

  return (
    <div className="App">
      <AccessKeyContext.Provider value={accessKey}>
        <RegionContext.Provider value={regionId}>
          <RegionsDispatchContext.Provider value={setRegions}>
            <AppBar position="static" color="transparent">
              <Toolbar
                variant="dense"
                disableGutters
                sx={{ alignItems: "center" }}
              >
                <IconButton
                  size="large"
                  color="inherit"
                  aria-label="menu"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Menu />
                </IconButton>
                <IconButton component={Link} to="/">
                  <img src="/logo192.png" alt="logo" width="36" height="36" />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ px: 1 }}>{user?.DisplayName}</Box>
              </Toolbar>
            </AppBar>
            <Drawer
              variant="temporary"
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              <Box
                sx={{ width: 250 }}
                role="presentation"
                onClick={() => setDrawerOpen(false)}
                onKeyDown={() => setDrawerOpen(false)}
              >
                <DrawerList />
              </Box>
            </Drawer>
            <Outlet />
          </RegionsDispatchContext.Provider>
        </RegionContext.Provider>
      </AccessKeyContext.Provider>
    </div>
  );
}

export default App;
