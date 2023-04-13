# Create Aliyun ECI

Pure front-end implementation of Aliyun ECI creation tool, supporting creation of ECI instances from templates, as well as deletion, restart of ECI instances.

纯前端实现的阿里云ECI创建工具，支持从模板创建ECI实例，以及删除、重启ECI实例。

## Demo

Link in the repo description should be available and functional.

仓库描述中的链接应该是可用的，具备完整功能。

## Security

Access key is stored in the browser's session storage (local storage if "Remember me" is checked), and is not sent to the server. The access key is only used to call the Aliyun API.

访问密钥存储在浏览器的会话存储（如果选中“记住我”，则存储在本地存储中），并不会发送到服务器。访问密钥仅用于调用阿里云API。

## Build

```bash
npm install
npm run build
```
