import { Button, Container, Stack, TextField } from "@mui/material";
import React from "react";

import { AliyunClient } from "./aliyun-client";
import ListEci from "./ListEci";
import { AccessKeyContext, RegionContext } from "./contexts";

type Region = {
  RegionId: string;
};

function LoginForm({
  onLogin,
  onRegionsGot,
}: {
  onLogin: (accessKeyId: string, accessKeySecret: string) => void;
  onRegionsGot?: (regions: Region[]) => void;
}) {
  const [accessKeyId, setAccessKeyId] = React.useState("");
  const [accessKeySecret, setAccessKeySecret] = React.useState("");

  function handleLogIn(event: React.FormEvent<HTMLFormElement>) {
    const client = new AliyunClient(
      accessKeyId,
      accessKeySecret,
      `https://eci.aliyuncs.com`
    );
    client.request("DescribeRegions").then((body) => {
      onLogin(accessKeyId, accessKeySecret);
      onRegionsGot?.(body.Regions);
    });
    event.preventDefault();
  }

  return (
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
        <Button variant="contained" type="submit">
          Log in
        </Button>
      </Stack>
    </form>
  );
}

function App() {
  const [accessKey, setAccessKey] = React.useState({
    accessKeyId: "",
    accessKeySecret: "",
  });
  const [regionId, setRegionId] = React.useState("cn-qingdao");
  const [regions, setRegions] = React.useState<Region[]>([]);
  const [auth, setAuth] = React.useState(false);

  return (
    <div className="App">
      <AccessKeyContext.Provider value={accessKey}>
        <RegionContext.Provider value={regionId}>
          <Container component="main">
            {!auth ? (
              <LoginForm
                onLogin={(accessKeyId: string, accessKeySecret: string) => {
                  setAuth(true);
                  setAccessKey({ accessKeyId, accessKeySecret });
                }}
                onRegionsGot={(regions: Region[]) => {
                  setRegions(regions);
                }}
              ></LoginForm>
            ) : (
              <ListEci></ListEci>
            )}
          </Container>
        </RegionContext.Provider>
      </AccessKeyContext.Provider>
    </div>
  );
}

export default App;
