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
