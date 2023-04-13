type BasicType = string | number | boolean;

export interface ParamsNullable {
  [key: string]:
    | BasicType
    | ParamsNullable
    | (ParamsNullable | BasicType)[]
    | null
    | undefined;
}

function walk(
  params: ParamsNullable | (ParamsNullable | BasicType)[],
  prefix: string = ""
): [string, string][] {
  if (Array.isArray(params)) {
    return params.flatMap((value, index) => {
      if (typeof value === "object")
        return walk(value, prefix + (index + 1) + ".");
      return [[prefix + (index + 1), value.toString()]];
    });
  } else if (typeof params === "object") {
    return Object.entries(params)
      .sort()
      .flatMap(([key, value]) => {
        if (value === null || value === undefined) return [];
        if (typeof value === "object") return walk(value, prefix + key + ".");
        return [[prefix + key, value.toString()]];
      });
  }
  throw new Error("Invalid params");
}

function encodeRFC3986(str: string) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function serialize(params: ParamsNullable): string {
  return walk(params)
    .map(([key, value]) => {
      return [encodeRFC3986(key), encodeRFC3986(value)].join("=");
    })
    .join("&");
}

export class AliyunClient {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;

  constructor(accessKeyId: string, accessKeySecret: string, endpoint: string) {
    this.accessKeyId = accessKeyId;
    this.accessKeySecret = accessKeySecret;
    this.endpoint = endpoint;
  }

  async request(action: string, params?: ParamsNullable) {
    const { accessKeyId, accessKeySecret, endpoint } = this;
    const requestParams: ParamsNullable = {
      ...params,
      AccessKeyId: accessKeyId,
      Action: action,
      Format: "JSON",
      SignatureMethod: "HMAC-SHA1",
      SignatureNonce: Math.random().toString(36).substring(2),
      SignatureVersion: "1.0",
      Timestamp: new Date().toISOString(),
      Version: "2018-08-08",
    };

    const query = serialize(requestParams);
    const method = "GET";
    const stringToSign = `${method}&%2F&${encodeRFC3986(query)}`;

    const textEncoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(accessKeySecret + "&"),
      { name: "HMAC", hash: { name: "SHA-1" } },
      false,
      ["sign", "verify"]
    );
    const signBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      textEncoder.encode(stringToSign)
    );
    const signature = btoa(String.fromCharCode(...new Uint8Array(signBuffer)));

    const url = `${endpoint}?${query}&Signature=${encodeRFC3986(signature)}`;
    const response = await fetch(url);
    if (!response.ok) return Promise.reject(response);
    return response.json();
  }
}
