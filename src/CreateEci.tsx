import { NavigateBefore } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@mui/material";
import React from "react";

import { AccessKeyContext, RegionContext } from "./contexts";
import { AliyunClient } from "./aliyun-client";

function CreateEci() {
  const accessKey = React.useContext(AccessKeyContext);
  const region = React.useContext(RegionContext);
  const [billingMethod, setBillingMethod] = React.useState("pay-as-you-go");

  const createContainerGroups = React.useCallback(() => {
    if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
    const client = new AliyunClient(
      accessKey.accessKeyId,
      accessKey.accessKeySecret,
      `https://eci.${region}.aliyuncs.com`
    );
    client.request("CreateContainerGroups", {
      RegionId: region,
    });
  }, [accessKey, region]);

  return (
    <Stack>
      <Toolbar disableGutters>
        <Button>
          <NavigateBefore />
        </Button>
        <Box sx={{ flexGrow: 1, textAlign: "center" }}>
          <h1 style={{ margin: 0 }}>Create</h1>
        </Box>
      </Toolbar>
      <Container component="main">
        <Box component="form">
          <Stack spacing={2}>
            <ToggleButtonGroup
              color="primary"
              value={billingMethod}
              exclusive
              size="small"
              onChange={(_ev, value) => setBillingMethod(value)}
              aria-label="Billing Method"
            >
              <ToggleButton value="pay-as-you-go">Pay-as-you-go</ToggleButton>
              <ToggleButton value="preemptible">Preemptible</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" onClick={createContainerGroups}>
              Create
            </Button>
          </Stack>
        </Box>
      </Container>
    </Stack>
  );
}

export default CreateEci;
