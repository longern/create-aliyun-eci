import { NavigateBefore } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

function CreateEci() {
  const [billingMethod, setBillingMethod] = React.useState("pay-as-you-go");

  return (
    <Stack>
      <AppBar component="nav" position="static">
        <Toolbar disableGutters>
          <IconButton component={Link} to="/" color="inherit" aria-label="back">
            <NavigateBefore />
          </IconButton>
          <Box sx={{ flexGrow: 1, textAlign: "center" }}>
            <h1 style={{ margin: 0 }}>Create</h1>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main">
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
      </Container>
    </Stack>
  );
}

export default CreateEci;
