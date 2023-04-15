import React from "react";

export type AccessKey = {
  accessKeyId: string;
  accessKeySecret: string;
};

export const AccessKeyContext = React.createContext({
  accessKeyId: "",
  accessKeySecret: "",
} as AccessKey);

export type Region = {
  RegionId: string;
  RegionEndpoint: string;
};

export const RegionContext = React.createContext<Region | null>(null);
