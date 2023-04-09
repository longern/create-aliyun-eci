import { Container } from "@mui/material";
import React from "react";

import ListEci from "./ListEci";
import { AccessKeyContext, RegionContext } from "./contexts";
import LoginForm from "./LoginForm";

type Region = {
  RegionId: string;
};

function App() {
  const [accessKey, setAccessKey] = React.useState({
    accessKeyId: "",
    accessKeySecret: "",
  });
  const [regionId, setRegionId] = React.useState("cn-qingdao");
  const [regions, setRegions] = React.useState<Region[]>([]);
  const [auth, setAuth] = React.useState(false);

  return (
    <div className="App">
      <AccessKeyContext.Provider value={accessKey}>
        <RegionContext.Provider value={regionId}>
          <Container component="main">
            {!auth ? (
              <LoginForm
                onLogin={(accessKeyId: string, accessKeySecret: string) => {
                  setAuth(true);
                  setAccessKey({ accessKeyId, accessKeySecret });
                }}
                onRegionsGot={(regions: Region[]) => {
                  setRegions(regions);
                }}
              ></LoginForm>
            ) : (
              <ListEci></ListEci>
            )}
          </Container>
        </RegionContext.Provider>
      </AccessKeyContext.Provider>
    </div>
  );
}

export default App;
