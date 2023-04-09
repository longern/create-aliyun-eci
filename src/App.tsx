import { Button, Container, Stack, TextField } from "@mui/material";
import { AliyunClient } from "./aliyun-client";
import React from "react";

function App() {
  const [accessKeyId, setAccessKeyId] = React.useState("");
  const [accessKeySecret, setAccessKeySecret] = React.useState("");

  function handleList(event: React.FormEvent<HTMLFormElement>) {
    const client = new AliyunClient(
      accessKeyId,
      accessKeySecret,
      "https://eci.cn-qingdao.aliyuncs.com"
    );
    client.request("DescribeContainerGroups", {
      RegionId: "cn-qingdao",
    });
    event.preventDefault();
  }

  return (
    <div className="App">
      <Container>
        <form onSubmit={handleList}>
          <Stack spacing={2}>
            <TextField
              label="Access Key ID"
              autoComplete="username"
              onChange={(e) => setAccessKeyId(e.target.value)}
            ></TextField>
            <TextField
              label="Access Key Secret"
              type="password"
              autoComplete="current-password"
              onChange={(e) => setAccessKeySecret(e.target.value)}
            ></TextField>
            <Button variant="contained" type="submit">
              List
            </Button>
          </Stack>
        </form>
      </Container>
    </div>
  );
}

export default App;
