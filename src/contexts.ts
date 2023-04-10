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
};

export const RegionContext = React.createContext("");
export const RegionsDispatchContext = React.createContext<React.Dispatch<
  React.SetStateAction<Region[]>
> | null>(null);
