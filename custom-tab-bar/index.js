const ICONS = {
  'nav/home': `<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M5.5 10.2V19a1.2 1.2 0 0 0 1.2 1.2H10V14.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5.7h3.3A1.2 1.2 0 0 0 18.5 19v-8.8"/><path d="M15.5 6.3V4.8a.4.4 0 0 1 .4-.4h1.2a.4.4 0 0 1 .4.4v3.1"/>`,
  'nav/home-filled': `<path d="M3.5 11.5 12 4l8.5 7.5v8.4a1.2 1.2 0 0 1-1.2 1.2H14.2V14.8a1 1 0 0 0-1-1h-2.4a1 1 0 0 0-1 1v6.3H4.7a1.2 1.2 0 0 1-1.2-1.2z" fill="currentColor" stroke="none"/>`,
  'nav/table': `<rect x="3.5" y="13" width="4" height="7.5" rx="1"/><rect x="10" y="8" width="4" height="12.5" rx="1"/><rect x="16.5" y="4" width="4" height="16.5" rx="1"/>`,
  'nav/schedule': `<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M8 3.5v4"/><path d="M16 3.5v4"/><circle cx="8" cy="14" r=".8" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r=".8" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r=".8" fill="currentColor" stroke="none"/>`,
  'nav/profile': `<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c.5-3.8 3.7-6.5 7.5-6.5s7 2.7 7.5 6.5"/>`,
};

function toDataUri(name, color, strokeWidth) {
  const paths = ICONS[name] || '';
  if (!paths) return '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="${color}" color="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const TABS = [
  { pagePath: '/pages/index/index',         text: '首页',   icon: 'nav/home',     iconActive: 'nav/home-filled' },
  { pagePath: '/pages/standings/standings', text: '积分榜', icon: 'nav/table',    iconActive: 'nav/table' },
  { pagePath: '/pages/fixtures/fixtures',   text: '赛程',   icon: 'nav/schedule', iconActive: 'nav/schedule' },
  { pagePath: '/pages/profile/profile',     text: '我的',   icon: 'nav/profile',  iconActive: 'nav/profile' },
];

const COLOR       = '#8E8E93';
const SELECTED_COLOR = '#38003C';

function buildList(selectedIndex) {
  return TABS.map((t, i) => {
    const active = i === selectedIndex;
    const color = active ? SELECTED_COLOR : COLOR;
    const strokeWidth = active && t.icon === 'nav/home' ? 1.8 : 1.6;
    const iconName = active ? t.iconActive : t.icon;
    return {
      pagePath: t.pagePath,
      text: t.text,
      color,
      iconSrc: toDataUri(iconName, color, strokeWidth),
      active
    };
  });
}

Component({
  data: {
    selected: 0,
    list: buildList(0)
  },
  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      wx.switchTab({ url: path });
      this.setData({ selected: index, list: buildList(index) });
    }
  },
  lifetimes: {
    attached() {
      this.setData({ list: buildList(this.data.selected) });
    }
  },
  observers: {
    selected(v) {
      this.setData({ list: buildList(v) });
    }
  }
});
