const newsItems = [
  {
    id: 'news-1',
    tag: '联赛格局',
    title: '英超冲刺阶段开启，争冠、欧战与保级悬念并行',
    summary: '官方梳理了 2025/26 赛季最后阶段的主要看点，阿森纳与曼城的争冠走势、欧战席位分配，以及保级竞争都进入关键阶段。',
    source: '英超官方',
    sourceType: 'official',
    mediaType: '图文',
    publishedAt: '2026-04-08',
    author: 'Premier League Editorial',
    coverLabel: '官方焦点',
    coverAccent: '#00FF85',
    coverTheme: 'official',
    sourceNote: '演示聚合条目，结构已支持后续替换为真实接口。',
    url: 'https://www.premierleague.com/en/news/4622316/whats-at-stake-for-the-rest-of-the-202526-premier-league-seasonx/',
    blocks: [
      {
        type: 'paragraph',
        text: '英超进入赛季最后冲刺阶段，争冠、欧战资格和保级三条主线同步升温。首页资讯模块需要优先呈现这种高价值赛季背景信息，而不是只堆比分结果。'
      },
      {
        type: 'paragraph',
        text: '阿森纳、曼城和利物浦的赛程强度差异，直接影响争冠走势；而第五个欧冠席位的潜在影响，也让中上游球队的积分争夺更有含金量。'
      },
      {
        type: 'quote',
        text: '这一阶段的资讯价值，在于帮助用户理解比赛背后的赛季形势。'
      }
    ]
  },
  {
    id: 'news-2',
    tag: '懂球帝热议',
    title: '懂球帝图文快讯聚焦欧战资格，英超前五竞争持续升温',
    summary: '作为聚合示例，这条内容模拟懂球帝风格的图文快讯：重点关注欧冠资格线、净胜球变化以及争四球队的近期走势。',
    source: '懂球帝',
    sourceType: 'dongqiudi',
    mediaType: '图文',
    publishedAt: '2026-04-08',
    author: 'D站快讯整理',
    coverLabel: '图文快讯',
    coverAccent: '#5B6CFF',
    coverTheme: 'dongqiudi',
    sourceNote: '当前为前端演示数据，真实接入建议通过后端聚合或已授权内容源。',
    url: '',
    blocks: [
      {
        type: 'paragraph',
        text: '图文快讯型资讯适合在小程序里快速浏览：标题、结论、关键信息点三段式，比长文更适合移动端碎片阅读。'
      },
      {
        type: 'paragraph',
        text: '如果未来接懂球帝类内容源，建议统一清洗成：标题、摘要、来源、发布时间、原文链接、正文块，这样前端渲染最稳定。'
      },
      {
        type: 'bullet',
        items: ['突出积分变化', '强调争四与保级线', '保留原文跳转入口']
      }
    ]
  },
  {
    id: 'news-3',
    tag: 'B站解读',
    title: 'B站视频解读聚焦曼联与热刺赛季走势，适合做图文摘要卡',
    summary: '这条演示数据模拟 B 站视频内容的“图文摘要版”：保留视频观点核心结论，再压缩成适合小程序阅读的卡片和详情正文。',
    source: 'B站',
    sourceType: 'bilibili',
    mediaType: '图文 + 视频摘要',
    publishedAt: '2026-04-07',
    author: '视频内容聚合示例',
    coverLabel: '视频摘要',
    coverAccent: '#FF6699',
    coverTheme: 'bilibili',
    sourceNote: 'B站类内容更适合由后端抓取标题、封面和简介，再统一转成前端可渲染结构。',
    url: '',
    blocks: [
      {
        type: 'paragraph',
        text: '对于视频平台内容，小程序前端不适合直接依赖外部页面结构。更稳的做法是后端抽取标题、封面、UP 主、发布时间和简介，再落成统一资讯模型。'
      },
      {
        type: 'paragraph',
        text: '这样首页既能展示“图文资讯”，详情页也能展示“视频核心观点”，用户体验会比直接跳外链更完整。'
      },
      {
        type: 'quote',
        text: '视频平台内容可以进首页，但必须先被“资讯化”。'
      }
    ]
  },
  {
    id: 'news-4',
    tag: '抖音热点',
    title: '抖音短视频热点适合做比赛日快讯，重点放进球、争议和热议话题',
    summary: '这条演示数据模拟抖音短视频热点资讯的聚合方式：不直接塞视频，而是提炼为可快速阅读的比赛日快讯和图文详情。',
    source: '抖音',
    sourceType: 'douyin',
    mediaType: '图文快讯',
    publishedAt: '2026-04-07',
    author: '短视频热点整理',
    coverLabel: '热点快讯',
    coverAccent: '#FE2C55',
    coverTheme: 'douyin',
    sourceNote: '短视频平台内容建议只聚合标题、封面、摘要和原始链接，避免前端直连复杂外部内容。',
    url: '',
    blocks: [
      {
        type: 'paragraph',
        text: '抖音类热点的优势是更新快、传播快，适合承接比赛日瞬时热度，比如绝杀、争议判罚、赛后采访和球迷讨论。'
      },
      {
        type: 'paragraph',
        text: '但小程序端最好不要直接把短视频流原样搬进来，而是转成“热点摘要 + 原链接”的资讯详情格式。'
      },
      {
        type: 'bullet',
        items: ['保留来源平台', '保留发布时间', '保留原始跳转', '正文只展示摘要']
      }
    ]
  },
  {
    id: 'news-5',
    tag: '商业动态',
    title: '多家英超俱乐部面临球衣赞助空缺，联赛商业版图受影响',
    summary: '随着球衣正面博彩赞助禁令临近，新赛季多家英超球队仍在寻找替代赞助商，联赛商业收入结构面临调整。',
    source: 'The Guardian',
    sourceType: 'media',
    mediaType: '图文',
    publishedAt: '2026-04-05',
    author: 'Guardian Football',
    coverLabel: '媒体报道',
    coverAccent: '#7A5CFF',
    coverTheme: 'media',
    sourceNote: '第三方媒体类内容适合保留原文链接，前端展示摘要与关键点即可。',
    url: 'https://www.theguardian.com/football/2026/apr/05/premier-league-new-season-no-shirt-sponsor-gambling-ban',
    blocks: [
      {
        type: 'paragraph',
        text: '资讯模块不一定只放赛果和转会，商业、转播、赞助和赛程规则变化同样会影响用户对联赛的理解。'
      },
      {
        type: 'paragraph',
        text: '这类内容适合在详情页里用“摘要 + 关键影响”来呈现，比直接贴整篇媒体文章更适合小程序信息密度。'
      }
    ]
  },
  {
    id: 'news-6',
    tag: '罗马诺',
    title: '罗马诺：德泽尔比仍在热刺候选名单中，维卡里奥受国米关注',
    summary: '根据 Fabrizio Romano 在 X 上的转会动态，德泽尔比仍是热刺帅位候选之一，国际米兰也将维卡里奥列入门将候选名单。',
    source: 'Fabrizio Romano / X',
    sourceType: 'romano',
    mediaType: '转会快讯',
    publishedAt: '2026-03-31',
    author: 'Fabrizio Romano',
    coverLabel: '转会快讯',
    coverAccent: '#F5C542',
    coverTheme: 'romano',
    sourceNote: '基于 Fabrizio Romano 的公开动态整理，适合放在转会资讯流里做高优先级卡片。',
    url: 'https://x.com/FabrizioRomano',
    blocks: [
      {
        type: 'paragraph',
        text: '转会类资讯在英超小程序里应该单独凸显来源，因为用户更在意消息等级和可信度。罗马诺类内容适合用“标题 + 两句摘要 + 来源链接”的快速卡片结构。'
      },
      {
        type: 'paragraph',
        text: '这条示例聚合了他公开动态中的两类英超相关信息：主帅候选和球员流向。后续如果你要做真正的罗马诺资讯流，建议按后台拉取后统一清洗。'
      },
      {
        type: 'quote',
        text: '转会资讯优先级高，应该和普通资讯区分开来。'
      }
    ]
  },
  {
    id: 'news-7',
    tag: 'X 热点',
    title: 'X 平台球员与转会动态适合做“快讯源”，首页可单独聚合展示',
    summary: '从产品结构上看，X 更适合承接球员动态、转会消息和赛后发声。前端可展示标题、来源和摘要，外链交由复制链接或后端跳转处理。',
    source: 'X',
    sourceType: 'x',
    mediaType: '图文快讯',
    publishedAt: '2026-04-09',
    author: '社媒聚合示例',
    coverLabel: '社媒快讯',
    coverAccent: '#ffffff',
    coverTheme: 'x',
    sourceNote: '真实接入 X 动态通常需要后端聚合，前端更适合展示摘要和来源。',
    url: 'https://x.com',
    blocks: [
      {
        type: 'paragraph',
        text: 'X 上的内容节奏更快，适合转会、伤病、赛后观点和球员个人动态。作为首页资讯源时，应该明显区分于长文媒体报道。'
      },
      {
        type: 'bullet',
        items: ['标题尽量短', '来源要明显', '原始链接要可复制', '详情页只保留摘要']
      }
    ]
  }
];

function getNewsList() {
  return JSON.parse(JSON.stringify(newsItems))
    .filter((item) => !['bilibili', 'douyin'].includes(item.sourceType))
    .sort((a, b) => {
    if (a.publishedAt === b.publishedAt) {
      if (a.sourceType === 'romano') return -1;
      if (b.sourceType === 'romano') return 1;
      return 0;
    }

    return a.publishedAt > b.publishedAt ? -1 : 1;
  });
}

function getNewsDetail(id) {
  return JSON.parse(JSON.stringify(newsItems.find((item) => item.id === id) || null));
}

module.exports = {
  getNewsList,
  getNewsDetail
};
