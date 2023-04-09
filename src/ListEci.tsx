import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

import { AliyunClient } from "./aliyun-client";
import { AccessKeyContext, RegionContext } from "./contexts";
import { Refresh } from "@mui/icons-material";

export default function ListEci() {
  const accessKey = React.useContext(AccessKeyContext);
  const region = React.useContext(RegionContext);
  const [loading, setLoading] = React.useState(true);
  const [containerGroups, setContainerGroups] = React.useState<any[]>([]);

  const fetchContainerGroups = React.useCallback(() => {
    if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
    setLoading(true);
    const client = new AliyunClient(
      accessKey.accessKeyId,
      accessKey.accessKeySecret,
      `https://eci.${region}.aliyuncs.com`
    );
    client
      .request("DescribeContainerGroups", { RegionId: region })
      .then((body) => setContainerGroups(body.ContainerGroups))
      .finally(() => setLoading(false));
  }, [accessKey, region]);

  const deleteContainerGroup = React.useCallback(
    (containerGroupId: string) => {
      if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
      const client = new AliyunClient(
        accessKey.accessKeyId,
        accessKey.accessKeySecret,
        `https://eci.${region}.aliyuncs.com`
      );
      client.request("DeleteContainerGroup", {
        ContainerGroupId: containerGroupId,
        RegionId: region,
      });
    },
    [accessKey, region]
  );

  React.useEffect(() => {
    fetchContainerGroups();
  }, [fetchContainerGroups]);

  return (
    <Stack spacing={1}>
      <Typography variant="h1" my={2} fontSize="2rem">
        Elastic Container Instance
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" component={Link} to="/create">
          Create
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={fetchContainerGroups}>
          <Refresh />
        </IconButton>
      </Stack>
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
    </Stack>
  );
}
