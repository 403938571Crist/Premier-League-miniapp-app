# 英超资讯微信小程序

一个专注于英超联赛的微信小程序，提供积分榜、赛程、球队和球员信息查询服务。

> ⚠️ **许可证声明**
> 
> 本项目采用自定义协议授权。**禁止未经许可的商业使用**。商用请联系作者获取书面授权。
> 
> - 个人学习 / 教育 / 非商业用途：允许免费使用
> - 商业用途（包括但不限于商业产品、商业服务、销售、再许可）：**需书面授权**
> - 联系邮箱：crist403938571@gmail.com
> - 完整协议内容请查看 [LICENSE](./LICENSE)

## 项目结构

```
premier-league-app/
├── app.js                    # 应用入口
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json             # 搜索配置
├── README.md                # 项目说明
├── utils/                   # 工具函数
│   ├── constants.js         # 常量定义
│   ├── util.js              # 通用工具函数
│   └── api.js               # API 封装
├── components/              # 可复用组件
│   ├── match-card/          # 比赛卡片组件
│   ├── team-item/           # 球队列表项组件
│   ├── player-item/         # 球员列表项组件
│   ├── follow-btn/          # 关注按钮组件
│   ├── empty-state/         # 空状态组件
│   ├── loading-state/       # 加载状态组件
│   └── error-state/         # 错误状态组件
├── pages/                   # 页面
│   ├── index/               # 首页
│   ├── standings/           # 积分榜
│   ├── fixtures/            # 赛程
│   ├── team-detail/         # 球队详情
│   ├── player-detail/       # 球员详情
│   └── profile/             # 我的
└── images/                  # 图片资源
    ├── default/             # 默认图片
    └── tabbar/              # TabBar 图标
```

## 技术栈

- 微信小程序原生开发
- WXML + WXSS + JavaScript
- football-data.org API (免费版)

## 功能特性

### 已完成
- ✅ 首页 - 焦点比赛、今日比赛列表、快捷入口
- ✅ 积分榜 - 实时英超排名，支持总榜/主场/客场切换
- ✅ 赛程 - 按日期查看比赛，支持日期切换
- ✅ 球队详情 - 球队信息、近期战绩、阵容、赛程
- ✅ 球员详情 - 球员信息、基本数据
- ✅ 我的 - 关注球队、清除缓存、关于我们、意见反馈
- ✅ 关注功能 - 关注/取消关注球队
- ✅ 数据缓存 - 减少 API 调用，提升体验
- ✅ 异常处理 - 网络错误、限流、空状态处理

### 技术特点
- API 请求队列控制（限流防护）
- 多层级数据缓存策略
- 组件化设计，可复用性高
- 完善的错误处理和空状态
- 支持实时比赛状态显示

## 使用说明

### 1. 获取 API Key

1. 访问 [football-data.org](https://www.football-data.org/)
2. 注册账号并获取免费版 API Key
3. 修改 `utils/api.js` 中的 `API_CONFIG.apiKey`：

```javascript
const API_CONFIG = {
  baseUrl: 'https://api.football-data.org/v4',
  apiKey: 'YOUR_API_KEY_HERE', // 替换为你的 API Key
  competitionId: 'PL'
};
```

### 2. 导入微信开发者工具

1. 打开微信开发者工具
2. 选择 "导入项目"
3. 选择项目目录
4. 填写 AppID（或选择测试号）
5. 点击 "确定"

### 3. 配置服务器域名

在小程序后台配置以下合法域名：
- `https://api.football-data.org`

### 4. 运行项目

点击开发者工具的 "编译" 按钮即可运行。

## API 限制说明

本项目使用 football-data.org 免费版 API，有以下限制：

- **频率限制**: 10 次/分钟
- **数据延迟**: 15-30 分钟
- **休赛期**: 可能无实时数据

项目已针对这些限制做了优化：
- 请求队列控制频率
- 本地缓存减少请求
- 缓存提示和延迟提示

## 缓存策略

| 数据类型 | 缓存时长 | 说明 |
|---------|---------|------|
| 积分榜 | 5 分钟 | 变动频率较低 |
| 赛程 | 1 分钟 | 比赛进行中需要较新数据 |
| 球队列表 | 1 小时 | 基本不变 |
| 球队详情 | 10 分钟 | 偶尔变动 |
| 球员详情 | 10 分钟 | 偶尔变动 |

## 注意事项

1. **API Key 安全**: 不要在代码中硬编码真实的 API Key，建议使用小程序的云函数或服务器中转
2. **图片资源**: 队徽等图片使用 API 提供的 URL，已配置懒加载和默认占位图
3. **网络状态**: 应用已处理各种网络异常情况，无需额外处理
4. **数据完整性**: football-data.org 免费版可能缺少部分球员统计数据

## 开发计划

- [ ] 搜索功能完善
- [ ] 比赛详情页
- [ ] 球队列表页
- [ ] 推送通知（关注球队比赛提醒）
- [ ] 历史数据查询

## 设计文档

详细的设计规范请参考项目根目录下的 `设计规范文档.md`。

## License

Custom License (Non-Commercial)

Copyright (c) 2026 Crist. All rights reserved.

个人学习 / 教育 / 非商业用途可免费使用；商业用途需联系 crist403938571@gmail.com 获取书面授权。
完整协议请查看 [LICENSE](./LICENSE)。
