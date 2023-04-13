import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";

import { AliyunClient, ParamsNullable } from "./aliyun-client";
import { AccessKeyContext, RegionContext } from "./contexts";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
      <Typography variant="h1" my={2} fontSize="2rem">
        Launch Templates
      </Typography>
      {loading ? (
        <CircularProgress></CircularProgress>
      ) : templates.length > 0 ? (
        <Stack spacing={2} sx={{ py: 1 }}>
          {" "}
          {templates.map((template) => (
            <Card key={template.LaunchTemplateId}>
              <CardContent>
                <Typography variant="h2" fontSize="1.5rem">
                  {template.LaunchTemplateName}
                </Typography>
                <Typography color="text.secondary">
                  {template.Description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  onClick={async () => {
                    await createFromTemplate(
                      accessKey,
                      region,
                      template.LaunchTemplateId
                    );
                    navigate("/");
                  }}
                >
                  Create From Template
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      ) : (
        <>No launch templates</>
      )}
    </Container>
  );
}
