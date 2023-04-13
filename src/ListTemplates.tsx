import {
  Button,
  CircularProgress,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

import { AliyunClient, ParamsNullable } from "./aliyun-client";
import { AccessKeyContext, RegionContext } from "./contexts";

function walkCapitalize(params: ParamsNullable) {
  const result: ParamsNullable = {};
  for (let [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value = value.map((v) => {
        if (typeof v === "object" && v !== null) return walkCapitalize(v);
        return v;
      });
    } else if (typeof value === "object" && value !== null) {
      value = walkCapitalize(value);
    }
    result[key.replace(/^./, (s) => s.toUpperCase())] = value;
  }
  return result;
}

async function createFromTemplate(
  accessKey: any,
  region: any,
  templateId: string
) {
  if (!accessKey.accessKeyId || !accessKey.accessKeySecret) {
    return Promise.reject("AccessKey is not set");
  }

  const client = new AliyunClient(
    accessKey.accessKeyId,
    accessKey.accessKeySecret,
    `https://eci.${region}.aliyuncs.com`
  );
  const describeBody = await client.request("DescribeLaunchTemplates", {
    RegionId: region,
    LaunchTemplateId: [templateId],
    DetailFlag: true,
  });

  const detail = JSON.parse(
    describeBody.LaunchTemplates[0].LaunchTemplateDetail
  );

  const params = walkCapitalize(detail);
  delete Object.assign(params, { Container: params.Containers }).Containers;
  delete Object.assign(params, { Memory: params.Mem }).Mem;
  delete Object.assign(params, {
    VSwitchId: (params.UserVSwitchIds as any[])[0],
  }).UserVSwitchIds;
  delete Object.assign(params, {
    SecurityGroupId: params.LinkedSecurityGroupId,
  }).LinkedSecurityGroupId;
  delete Object.assign(params, {
    ImageRegistryCredential: params.ImageRegistryCredentials,
  }).ImageRegistryCredentials;
  (params.Container as any[]).forEach((container: any) => {
    delete Object.assign(container, { Arg: container.Args }).Args;
    delete Object.assign(container, { EnvironmentVar: container.Env }).Env;
  });
  delete params.ProductOnEciMode;

  const createBody = await client.request("CreateContainerGroup", {
    RegionId: region,
    ...params,
  });

  const containerGroupId: string = createBody.ContainerGroupId;
  return containerGroupId;
}

export default function ListTemplates() {
  const accessKey = React.useContext(AccessKeyContext);
  const region = React.useContext(RegionContext);
  const [loading, setLoading] = React.useState(true);
  const [templates, setTemplates] = React.useState<any[]>([]);

  const fetchTemplates = React.useCallback(() => {
    if (!accessKey.accessKeyId || !accessKey.accessKeySecret) return;
    setLoading(true);
    const client = new AliyunClient(
      accessKey.accessKeyId,
      accessKey.accessKeySecret,
      `https://eci.${region}.aliyuncs.com`
    );
    client
      .request("DescribeLaunchTemplates", { RegionId: region })
      .then((body) => setTemplates(body.LaunchTemplates))
      .finally(() => setLoading(false));
  }, [accessKey, region]);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <Container component="main">
      <Stack spacing={1}>
        <Typography variant="h1" my={2} fontSize="2rem">
          Launch Templates
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Template Name</TableCell>
              <TableCell>Template Id</TableCell>
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
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <TableRow key={template.LaunchTemplateId}>
                  <TableCell>{template.LaunchTemplateName}</TableCell>
                  <TableCell>{template.LaunchTemplateId}</TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      right: 0,
                    }}
                  >
                    <Button
                      onClick={() =>
                        createFromTemplate(
                          accessKey,
                          region,
                          template.LaunchTemplateId
                        )
                      }
                    >
                      Create From Template
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
                  No launch templates
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Stack>
    </Container>
  );
}
