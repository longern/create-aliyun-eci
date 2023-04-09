import { Button, Stack } from "@mui/material";
import { useLocalStorage } from "./hooks";

function LaunchTemplates() {
  const [launchTemplates, setLaunchTemplates] = useLocalStorage(
    "caeLaunchTemplates",
    []
  );
  return (
    <Stack>
      <Button variant="contained">Import</Button>
    </Stack>
  );
}

export default LaunchTemplates;
