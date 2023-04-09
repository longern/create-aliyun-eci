import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

import { AliyunClient } from "./aliyun-client";
import { AccessKeyContext, RegionContext } from "./contexts";

export default function ListEci() {
  const accessKey = React.useContext(AccessKeyContext);
  const region = React.useContext(RegionContext);
  const [containerGroups, setContainerGroups] = React.useState<any[]>([]);

  const fetchContainerGroups = React.useCallback(() => {
    if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
    const client = new AliyunClient(
      accessKey.accessKeyId,
      accessKey.accessKeySecret,
      `https://eci.${region}.aliyuncs.com`
    );
    client
      .request("DescribeContainerGroups", {
        RegionId: region,
      })
      .then((body) => setContainerGroups(body.ContainerGroups));
  }, [accessKey, region]);

  React.useEffect(() => {
    fetchContainerGroups();
  }, [fetchContainerGroups]);

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Button variant="contained">Create Container Group</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={fetchContainerGroups}>
          Refresh
        </Button>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Container Group Name</TableCell>
            <TableCell>Container Group Id</TableCell>
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
          {containerGroups.length ? (
            containerGroups.map((containerGroup) => (
              <TableRow key={containerGroup.ContainerGroupId}>
                <TableCell>{containerGroup.ContainerGroupName}</TableCell>
                <TableCell>{containerGroup.ContainerGroupId}</TableCell>
                <TableCell>
                  <Button>Stop</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={3}
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
