import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";

import { AliyunClient } from "./aliyun-client";
import { AccessKey, RegionsDispatchContext } from "./contexts";

function saveAccessKey(
  accessKey: AccessKey,
  storage: Storage = sessionStorage
) {
  storage.setItem("caeAccessKey", JSON.stringify(accessKey));
}

function LoginForm() {
  const setRegions = React.useContext(RegionsDispatchContext);
  const [accessKeyId, setAccessKeyId] = React.useState("");
  const [accessKeySecret, setAccessKeySecret] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const navigate = useNavigate();

  function handleLogIn(event: React.FormEvent<HTMLFormElement>) {
    const client = new AliyunClient(
      accessKeyId,
      accessKeySecret,
      `https://eci.aliyuncs.com`
    );
    client.request("DescribeRegions").then((body) => {
      saveAccessKey(
        { accessKeyId, accessKeySecret },
        remember ? localStorage : sessionStorage
      );
      setRegions?.(body.Regions);
      navigate("/");
    });
    event.preventDefault();
  }

  return (
    <Container component="main">
      <form onSubmit={handleLogIn}>
        <Stack
          spacing={2}
          justifyContent="center"
          sx={{ height: "90vh", maxWidth: "400px", margin: "0 auto" }}
        >
          <TextField
            value={accessKeyId}
            label="Access Key ID"
            autoComplete="username"
            onChange={(e) => setAccessKeyId(e.target.value)}
          ></TextField>
          <TextField
            value={accessKeySecret}
            label="Access Key Secret"
            type="password"
            autoComplete="current-password"
            onChange={(e) => setAccessKeySecret(e.target.value)}
          ></TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            }
            label="Remember me"
          />
          <Button type="submit" variant="contained" size="large">
            Log in
          </Button>
        </Stack>
      </form>
    </Container>
  );
}

export default LoginForm;
