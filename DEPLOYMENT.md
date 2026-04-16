# 前端部署文档

> 本文档记录所有为「适配微信云托管后端域名」而做的前端代码改造，以及开发/生产环境切换方式。

---

## 一、本次直接修改的文件清单

### 1. 环境配置中心（核心改动）

| 文件 | 改动说明 |
|---|---|
| `utils/env-config.js` | **新增** 环境配置中心。集中管理 `DEV_BASE_URL` 和 `PROD_BASE_URL`，支持「手动切换」和「自动判断（根据小程序 envVersion）」两种策略。所有 API 模块统一从这里读取基地址。 |

### 2. 消除前端写死的 localhost

| 文件 | 改动说明 |
|---|---|
| `app.js` | `apiBaseUrl`、`backendApiBaseUrl`、`newsApiBaseUrl` 三处地址不再写死 `http://localhost:8080/api`，改为 `require('./utils/env-config')` 后使用 `API_BASE_URL`。 |
| `utils/api.js` | 删除原来的 `const DEFAULT_API_BASE_URL = 'http://localhost:8080/api'`；改为 `require('./env-config')` 引入 `API_BASE_URL`。所有后端请求统一走后端 `/api`。 |
| `utils/news-api.js` | 同上，删除硬编码 localhost，改为从 `env-config` 读取 `API_BASE_URL`。 |

### 3. 清理 mock 数据

| 文件 | 改动说明 |
|---|---|
| `utils/mock-data.js` | **删除** 原包含 175 行 mock 数据的文件。确保生产包中不再携带任何 mock 数据，也不会在请求失败时 fallback 到 mock。 |

### 4. 其他已 push 的非部署相关改动

| 文件 | 改动说明 |
|---|---|
| `README.md` | 顶部新增许可证声明；底部 License 从 MIT 改为 Custom License。 |
| `LICENSE` | 从 MIT 改为自定义非商业协议。 |

---

## 二、未修改的业务代码

以下页面/模块保持你本地原有的开发状态，**本次没有动过**：
- `pages/index/index.js` 及相关 wxml/wxss
- `pages/standings/standings.js` 及相关文件
- `pages/fixtures/fixtures.js` 及相关文件
- `pages/team-detail/team-detail.js` 及相关文件
- `pages/player-detail/player-detail.js` 及相关文件
- `pages/profile/profile.js` 及相关文件
- `pages/news-detail/news-detail.js` 及相关文件
- `pages/search/search.js`（你本地新增）
- `pages/teams/teams.js`（你本地新增）

---

## 三、开发环境 / 正式环境切换方式

### 方式一：手动切换（最简单，首次部署验证推荐）

打开 `utils/env-config.js`：

```javascript
// 1. 把你的云托管域名填进去
const PROD_BASE_URL = 'https://xxx.cloudrun.weixin.qq.com/api';

// 2. 手动开关
const MANUAL_PROD = false;   // 本地开发用
const MANUAL_PROD = true;    // 发布正式环境时改成 true
```

### 方式二：自动判断（长期维护推荐）

```javascript
const isProduction = autoProd;
```

自动规则：
- 微信开发者工具 / 开发版 → `develop` → 使用 `DEV_BASE_URL`（localhost）
- 体验版 → `trial` → 使用 `DEV_BASE_URL`
- 正式版小程序 → `release` → 自动切到 `PROD_BASE_URL`

> 修改 `env-config.js` 后，**不需要再改任何其他文件**，所有页面的 `wx.request` 会自动跟随新地址。

---

## 四、启动方式

### 本地开发

1. 启动后端服务（确保后端跑在 `http://localhost:8080/api`）
2. 打开 **微信开发者工具**
3. 导入项目目录 `G:\Premier-League-miniapp-app`
4. 在 `utils/env-config.js` 中保持 `MANUAL_PROD = false`（或 `isProduction = autoProd`）
5. 点击「编译」即可调试

### 生产部署

1. 后端部署到微信云托管，拿到 HTTPS 域名
2. 将域名填入 `utils/env-config.js` 的 `PROD_BASE_URL`
3. 将 `MANUAL_PROD` 改为 `true`（或直接用 `autoProd`）
4. 微信开发者工具点击「上传」→ 填写版本号 → 提交审核 → 发布

### 合法域名配置

登录 [小程序后台](https://mp.weixin.qq.com) → 开发 → 开发管理 → 服务器域名：
- `request 合法域名` 中添加你的云托管域名，例如：
  ```
  https://xxx.cloudrun.weixin.qq.com
  ```
- 如果后端内部还调用了 `football-data.org`，**不需要**在前端合法域名中添加，因为这是后端去调的。

---

## 五、架构约束确认

- [x] 所有 `wx.request` 统一走后端 `/api`，没有前端直连第三方 API
- [x] 没有写死的 `localhost:8080` 散落在各个业务文件中
- [x] 已删除 `mock-data.js`，生产包不含 mock 数据
- [x] 环境切换只需改一个文件 `utils/env-config.js`
