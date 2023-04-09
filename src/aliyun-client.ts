interface Params {
  [key: string]: string | number | boolean | Params | Params[];
}

interface ParamsNullable {
  [key: string]:
    | string
    | number
    | boolean
    | ParamsNullable
    | ParamsNullable[]
    | null
    | undefined;
}

function walk(
  params: ParamsNullable | ParamsNullable[],
  prefix: string = ""
): [string, string][] {
  if (Array.isArray(params)) {
    return params.flatMap((value, index) => walk(value, prefix + index + "."));
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

function serialize(params: Params): string {
  return walk(params)
    .map(([key, value]) => {
      return [encodeURIComponent(key), encodeURIComponent(value)].join("=");
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

  async request(action: string, params?: Params) {
    const { accessKeyId, accessKeySecret, endpoint } = this;
    const requestParams: Params = {
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
    const stringToSign = `${method}&%2F&${encodeURIComponent(query)}`;

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

    const url = `${endpoint}?${query}&Signature=${encodeURIComponent(
      signature
    )}`;
    const response = await fetch(url);
    if (!response.ok) return Promise.reject(response);
    return response.json();
  }
}
