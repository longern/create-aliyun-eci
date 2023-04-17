import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

import { AliyunClient } from "./aliyun-client";
import { AccessKeyContext, RegionContext } from "./contexts";
import { Add, Refresh } from "@mui/icons-material";
import ConfirmDialog from "./ConfirmDialog";
import { withTranslation } from "react-i18next";

interface ContainerGroup {
  ContainerGroupId: string;
  ContainerGroupName: string;
  Cpu: number;
  CreationTime: string;
  InternetIp: string;
  IntranetIp: string;
  Memory: number;
  Status:
    | "Pending"
    | "Running"
    | "Succeeded"
    | "Failed"
    | "Scheduling"
    | "ScheduleFailed"
    | "Restarting"
    | "Updating"
    | "Terminating"
    | "Expired";
}

function ListEci({ t }: { t: (key: string) => string }) {
  const accessKey = React.useContext(AccessKeyContext);
  const region = React.useContext(RegionContext);
  const [loading, setLoading] = React.useState(true);
  const [containerGroups, setContainerGroups] = React.useState(
    [] as ContainerGroup[]
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const confirmDialogRef = React.useRef<{
    show: (message?: string) => Promise<boolean>;
  }>(null);

  const fetchContainerGroups = React.useCallback(() => {
    if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
    setLoading(true);
    const client = new AliyunClient(
      accessKey.accessKeyId,
      accessKey.accessKeySecret,
      "https://" + region!.RegionEndpoint
    );
    client
      .request("DescribeContainerGroups", { RegionId: region!.RegionId })
      .then((body) => setContainerGroups(body.ContainerGroups))
      .finally(() => setLoading(false));
  }, [accessKey, region]);

  const deleteContainerGroup = React.useCallback(
    (containerGroupId: string) => {
      if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
      const client = new AliyunClient(
        accessKey.accessKeyId,
        accessKey.accessKeySecret,
        "https://" + region!.RegionEndpoint
      );
      client.request("DeleteContainerGroup", {
        ContainerGroupId: containerGroupId,
        RegionId: region!.RegionId,
      });
    },
    [accessKey, region]
  );

  const restartContainerGroup = React.useCallback(
    (containerGroupId: string) => {
      if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
      const client = new AliyunClient(
        accessKey.accessKeyId,
        accessKey.accessKeySecret,
        "https://" + region!.RegionEndpoint
      );
      client.request("RestartContainerGroup", {
        ContainerGroupId: containerGroupId,
        RegionId: region!.RegionId,
      });
    },
    [accessKey, region]
  );

  React.useEffect(() => {
    fetchContainerGroups();
  }, [fetchContainerGroups]);

  return (
    <Container component="main">
      <Stack spacing={1}>
        <Typography variant="h1" my={2} fontSize="2rem">
          {t("Elastic Container Instance")}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton component={Link} to="/templates" title={t("Create")}>
            <Add />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={fetchContainerGroups} title={t("Refresh")}>
            <Refresh />
          </IconButton>
        </Stack>
        {isMobile ? (
          <Stack spacing={2} sx={{ py: 1 }}>
            {loading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={192} />
              ))
            ) : containerGroups.length ? (
              containerGroups.map((containerGroup) => (
                <Card key={containerGroup.ContainerGroupId}>
                  <CardContent>
                    <Typography
                      variant="h2"
                      fontSize="1.5rem"
                      gutterBottom
                      noWrap
                    >
                      {containerGroup.ContainerGroupName}
                    </Typography>
                    <Box color="text.secondary">
                      {containerGroup.ContainerGroupId}
                    </Box>
                    <Box>{containerGroup.Status}</Box>
                  </CardContent>
                  <CardActions>
                    <Box sx={{ flexGrow: 1 }} />
                    <ConfirmDialog ref={confirmDialogRef} />
                    <Button
                      color="error"
                      onClick={async () => {
                        const ok = await confirmDialogRef.current!.show(
                          `Delete container group ${containerGroup.ContainerGroupName}?`
                        );
                        if (ok) {
                          deleteContainerGroup(containerGroup.ContainerGroupId);
                        }
                      }}
                    >
                      {t("Delete")}
                    </Button>
                    <Button
                      onClick={() =>
                        restartContainerGroup(containerGroup.ContainerGroupId)
                      }
                    >
                      {t("Restart")}
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Box textAlign="center" color="text.secondary">
                {t("No data")}
              </Box>
            )}
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Container Group Name</TableCell>
                <TableCell>Container Group Id</TableCell>
                <TableCell>Status</TableCell>
                <TableCell
                  sx={{
                    position: "sticky",
                    right: 0,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={99} sx={{ textAlign: "center" }}>
                    <CircularProgress></CircularProgress>
                  </TableCell>
                </TableRow>
              ) : containerGroups.length ? (
                containerGroups.map((containerGroup) => (
                  <TableRow key={containerGroup.ContainerGroupId}>
                    <TableCell>{containerGroup.ContainerGroupName}</TableCell>
                    <TableCell>{containerGroup.ContainerGroupId}</TableCell>
                    <TableCell>{containerGroup.Status}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() =>
                          deleteContainerGroup(containerGroup.ContainerGroupId)
                        }
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={99}
                    sx={{
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    No container groups
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Stack>
    </Container>
  );
}

export default withTranslation()(ListEci);
