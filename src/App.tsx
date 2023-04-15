import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Radio,
  RadioGroup,
  Stack,
  Toolbar,
} from "@mui/material";
import React from "react";
import { withTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { AliyunClient } from "./aliyun-client";
import "./App.css";
import { AccessKey, AccessKeyContext, Region, RegionContext } from "./contexts";

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

const RegionDialog = withTranslation()(function ({
  open,
  onClose,
  cloudAccessKey,
  region,
  onRegionChange,
  t,
}: {
  open: boolean;
  onClose: () => void;
  cloudAccessKey: AccessKey;
  region: Region;
  onRegionChange: (region: Region) => void;
  t: (key: string) => string;
}) {
  const [currentRegion, setCurrentRegion] = React.useState(region.RegionId);
  const [regions, setRegions] = React.useState<Region[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (!cloudAccessKey.accessKeyId || !cloudAccessKey.accessKeySecret) return;
    if (regions.length) return;
    setLoading(true);
    const client = new AliyunClient(
      cloudAccessKey.accessKeyId,
      cloudAccessKey.accessKeySecret,
      `https://eci.aliyuncs.com`
    );
    client
      .request("DescribeRegions", {})
      .then((body) => {
        setRegions(body.Regions);
      })
      .finally(() => setLoading(false));
  }, [open, cloudAccessKey, regions]);

  function handleOk() {
    const newRegion = regions.find((r) => r.RegionId === currentRegion);
    if (newRegion) onRegionChange(newRegion);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t("Regions")}</DialogTitle>
      <DialogContent>
        {loading && (
          <Stack alignItems="center">
            <CircularProgress />
          </Stack>
        )}
        <RadioGroup
          value={currentRegion}
          onChange={(event) => {
            setCurrentRegion(event.target.value);
          }}
          name="regions-group"
        >
          {regions.map((region) => (
            <FormControlLabel
              key={region.RegionId}
              value={region.RegionId}
              control={<Radio />}
              label={region.RegionId}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOk}>{t("OK")}</Button>
        <Button onClick={onClose}>{t("Cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
});

function App() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const accessKey = React.useMemo(getAccessKeyFromStorage, []);
  const [region, setRegion] = React.useState({
    RegionId: "cn-qingdao",
    RegionEndpoint: "eci.cn-qingdao.aliyuncs.com",
  });
  const [regionDialogOpen, setRegionDialogOpen] = React.useState(false);
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
    if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
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
      })
      .catch(() => {});
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
        <RegionContext.Provider value={region}>
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
              <Box flexGrow="1" />
              <RegionDialog
                open={regionDialogOpen}
                onClose={() => setRegionDialogOpen(false)}
                cloudAccessKey={accessKey}
                region={region}
                onRegionChange={setRegion}
              ></RegionDialog>
              <Button onClick={() => setRegionDialogOpen(true)}>
                {region.RegionId}
              </Button>
              {user && <Box px={1}>{user.DisplayName}</Box>}
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
        </RegionContext.Provider>
      </AccessKeyContext.Provider>
    </div>
  );
}

export default App;
