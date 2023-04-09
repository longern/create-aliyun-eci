import { NavigateBefore } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@mui/material";
import React from "react";

function CreateEci() {
  const [billingMethod, setBillingMethod] = React.useState("pay-as-you-go");
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
      <Box component="form">
        <Stack spacing={2}>
          <ToggleButtonGroup
            color="primary"
            value={billingMethod}
            exclusive
            onChange={(_ev, value) => setBillingMethod(value)}
            aria-label="Billing Method"
          >
            <ToggleButton value="pay-as-you-go">Pay-as-you-go</ToggleButton>
            <ToggleButton value="preemptible">Preemptible</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>
    </Stack>
  );
}

export default CreateEci;
