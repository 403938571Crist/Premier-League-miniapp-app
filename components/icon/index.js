// SVG path data for each icon. viewBox is always "0 0 24 24".
// Stroke icons use stroke="currentColor"; filled parts use fill="currentColor" stroke="none".
const ICONS = {
  // Navigation
  'nav/home': `<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M5.5 10.2V19a1.2 1.2 0 0 0 1.2 1.2H10V14.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5.7h3.3A1.2 1.2 0 0 0 18.5 19v-8.8"/><path d="M15.5 6.3V4.8a.4.4 0 0 1 .4-.4h1.2a.4.4 0 0 1 .4.4v3.1"/>`,
  'nav/home-filled': `<path d="M3.5 11.5 12 4l8.5 7.5v8.4a1.2 1.2 0 0 1-1.2 1.2H14.2V14.8a1 1 0 0 0-1-1h-2.4a1 1 0 0 0-1 1v6.3H4.7a1.2 1.2 0 0 1-1.2-1.2z" fill="currentColor" stroke="none"/>`,
  'nav/table': `<rect x="3.5" y="13" width="4" height="7.5" rx="1"/><rect x="10" y="8" width="4" height="12.5" rx="1"/><rect x="16.5" y="4" width="4" height="16.5" rx="1"/>`,
  'nav/schedule': `<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M8 3.5v4"/><path d="M16 3.5v4"/><circle cx="8" cy="14" r=".8" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r=".8" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r=".8" fill="currentColor" stroke="none"/>`,
  'nav/profile': `<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c.5-3.8 3.7-6.5 7.5-6.5s7 2.7 7.5 6.5"/>`,

  // Football
  'fb/ball': `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.3l3.5 2.6-1.3 4.1h-4.4L8.5 9.9z"/><path d="M12 7.3V3.5"/><path d="M15.5 9.9l3.6-1.2"/><path d="M14.2 14l2.2 3"/><path d="M9.8 14l-2.2 3"/><path d="M8.5 9.9 4.9 8.7"/>`,
  'fb/trophy': `<path d="M7 3.5h10v5.2a5 5 0 0 1-10 0z"/><path d="M7 5.5H4v2.2a3 3 0 0 0 3 3"/><path d="M17 5.5h3v2.2a3 3 0 0 1-3 3"/><path d="M10 13.8v2.4h4v-2.4"/><path d="M8.5 20.5h7"/><path d="M8.5 20.5v-2.2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2.2"/>`,
  'fb/whistle': `<path d="M9 9h10.5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H15.5"/><path d="M18 9V6.5a1 1 0 0 0-1.4-.9l-4.6 2"/><path d="M9 9a5.5 5.5 0 1 0 3.8 9.6A5.5 5.5 0 0 0 9 9z"/><circle cx="9.5" cy="14.5" r="1"/>`,
  'fb/jersey': `<path d="M4 7.5 8 4h2.5a2 2 0 0 0 3 0H16l4 3.5-1.8 3.5-2.2-.8V20H8v-9.8l-2.2.8z"/><path d="M10.5 4c0 1.3 .7 2 1.5 2s1.5-.7 1.5-2"/><path d="M11 13h2"/><path d="M11 16h2"/>`,
  'fb/club': `<path d="M12 3.5 4.5 5.5v6.3c0 4.4 3 8.2 7.5 9.2 4.5-1 7.5-4.8 7.5-9.2V5.5z"/><path d="M9 12l2.3 2.3L15.5 10"/>`,
  'fb/boot': `<path d="M3.5 17.5V10a1 1 0 0 1 1-1h3.8l2.2 2.8h7.3a3.7 3.7 0 0 1 3.7 3.7v1a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z"/><path d="M7 9.5V7.5"/><path d="M10.5 9.5V5"/><circle cx="6" cy="17" r=".6" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r=".6" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r=".6" fill="currentColor" stroke="none"/><circle cx="18" cy="17" r=".6" fill="currentColor" stroke="none"/>`,
  'fb/pitch': `<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M12 5.5v13"/><circle cx="12" cy="12" r="2.3"/><path d="M3 9v6"/><path d="M21 9v6"/><path d="M3 10.5h2v3H3"/><path d="M21 10.5h-2v3h2"/>`,
  'fb/goal': `<path d="M3 9h18v10H3z"/><path d="M3 9l1.8 2V19"/><path d="M21 9l-1.8 2V19"/><path d="M4.8 14h14.4"/><path d="M8.5 11v8"/><path d="M15.5 11v8"/><path d="M6 6.5c1.5-1.5 3.7-2 6-2s4.5 .5 6 2"/>`,
  'fb/player': `<circle cx="12" cy="5" r="2.3"/><path d="M9 8l-2.5 4L9 13.5V20"/><path d="M15 8l2.5 4L15 13.5V20"/><path d="M9 13.5h6"/><path d="M10.5 20h3"/>`,
  'fb/card': `<rect x="4.5" y="3.5" width="10" height="14" rx="1" transform="rotate(-8 9.5 10.5)"/><rect x="9.5" y="6.5" width="10" height="14" rx="1" transform="rotate(8 14.5 13.5)"/>`,
  'fb/sub': `<path d="M4 8h14"/><path d="M14 4l4 4-4 4"/><path d="M20 16H6"/><path d="M10 12l-4 4 4 4"/>`,
  'fb/flag': `<path d="M6.5 20.5V3.5"/><path d="M6.5 4.5h10.2a.6.6 0 0 1 .5 1L14.5 9l2.7 3.5a.6.6 0 0 1-.5 1H6.5"/>`,

  // Content
  'ct/article': `<path d="M5.5 3.5h9.2L19 7.8V19a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V5a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M14.5 3.5V8h4.5"/><path d="M8 12h7"/><path d="M8 15h7"/><path d="M8 18h4"/>`,
  'ct/video': `<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M10.2 9.3v5.4a.5.5 0 0 0 .76.42l4.3-2.7a.5.5 0 0 0 0-.84l-4.3-2.7a.5.5 0 0 0-.76.42z" fill="currentColor" stroke="none"/>`,
  'ct/gallery': `<rect x="3" y="5.5" width="18" height="13" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 16.5 16 11.5l-7.5 7"/>`,
  'ct/bookmark': `<path d="M6 3.5h12a.5.5 0 0 1 .5.5v16.2a.3.3 0 0 1-.48.24L12 16.5l-6.02 3.94A.3.3 0 0 1 5.5 20.2V4a.5.5 0 0 1 .5-.5z"/>`,
  'ct/like': `<path d="M12 20.5 4.3 13a4.6 4.6 0 0 1 6.5-6.5l1.2 1.2 1.2-1.2a4.6 4.6 0 0 1 6.5 6.5z"/>`,
  'ct/comment': `<path d="M20.5 11.5c0 3.6-3.8 6.5-8.5 6.5-1.2 0-2.4-.2-3.4-.6L4 19.5l1.4-3.8C4 14.6 3.5 13.1 3.5 11.5 3.5 7.9 7.3 5 12 5s8.5 2.9 8.5 6.5z"/><circle cx="8.5" cy="11.5" r=".8" fill="currentColor" stroke="none"/><circle cx="12" cy="11.5" r=".8" fill="currentColor" stroke="none"/><circle cx="15.5" cy="11.5" r=".8" fill="currentColor" stroke="none"/>`,
  'ct/share': `<circle cx="18" cy="5.5" r="2.3"/><circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="18.5" r="2.3"/><path d="M7.9 13.2l8.2 4.1"/><path d="M16.1 6.7 7.9 10.8"/>`,
  'ct/link': `<path d="M10.5 13.5a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-3.3 3.3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>`,

  // Actions
  'ac/search': `<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8 20 20"/>`,
  'ac/filter': `<path d="M4 6.5h16"/><path d="M7 12h10"/><path d="M10 17.5h4"/>`,
  'ac/back': `<path d="M14.5 5.5 8 12l6.5 6.5"/>`,
  'ac/next': `<path d="M9.5 5.5 16 12l-6.5 6.5"/>`,
  'ac/close': `<path d="M6 6l12 12"/><path d="M18 6 6 18"/>`,
  'ac/add': `<path d="M12 5v14"/><path d="M5 12h14"/>`,
  'ac/refresh': `<path d="M3.5 4.5v5.3h5.3"/><path d="M4 9.8A8 8 0 1 1 4 14.2"/>`,
  'ac/more': `<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>`,

  // System
  'sys/success': `<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3 10.8 15.2 16.2 9.5"/>`,
  'sys/warn': `<path d="M12 3.5 21.4 19.7a1 1 0 0 1-.87 1.5H3.47a1 1 0 0 1-.87-1.5z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.5" r=".7" fill="currentColor" stroke="none"/>`,
  'sys/error': `<circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5"/><circle cx="12" cy="15.5" r=".7" fill="currentColor" stroke="none"/>`,
  'sys/info': `<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="8" r=".7" fill="currentColor" stroke="none"/>`,
  'sys/bell': `<path d="M17.5 16v-4.5a5.5 5.5 0 1 0-11 0V16l-1.8 2.2a.5.5 0 0 0 .4.8h13.8a.5.5 0 0 0 .4-.8z"/><path d="M10 21a2 2 0 0 0 4 0"/>`,
  'sys/time': `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`,
  'sys/pin': `<path d="M12 3.5c3.6 0 6.5 2.8 6.5 6.3 0 4.8-6.5 10.7-6.5 10.7S5.5 14.6 5.5 9.8c0-3.5 2.9-6.3 6.5-6.3z"/><circle cx="12" cy="10" r="2.3"/>`,
  'sys/settings': `<circle cx="12" cy="12" r="2.7"/><path d="M19.5 12a7.5 7.5 0 0 0-.2-1.6l1.9-1.4-1.9-3.3-2.2 1a7.5 7.5 0 0 0-2.8-1.6l-.4-2.4h-3.8l-.4 2.4a7.5 7.5 0 0 0-2.8 1.6l-2.2-1-1.9 3.3 1.9 1.4a7.5 7.5 0 0 0 0 3.2l-1.9 1.4 1.9 3.3 2.2-1a7.5 7.5 0 0 0 2.8 1.6l.4 2.4h3.8l.4-2.4a7.5 7.5 0 0 0 2.8-1.6l2.2 1 1.9-3.3-1.9-1.4a7.5 7.5 0 0 0 .2-1.6z"/>`,
};

function makeSvgDataUri(paths, color, strokeWidth) {
  const c = encodeURIComponent(color);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/%20/g, ' ');
}

Component({
  properties: {
    name: { type: String, value: '' },
    size: { type: Number, value: 24 },
    color: { type: String, value: '#38003C' },
    strokeWidth: { type: Number, value: 1.6 },
  },
  computed: {
    src() {
      const paths = ICONS[this.data.name] || '';
      if (!paths) return '';
      return makeSvgDataUri(paths, this.data.color, this.data.strokeWidth);
    },
  },
  data: {
    src: '',
  },
  observers: {
    'name, color, size, strokeWidth'() {
      const paths = ICONS[this.data.name] || '';
      if (!paths) { this.setData({ src: '' }); return; }
      this.setData({ src: makeSvgDataUri(paths, this.data.color, this.data.strokeWidth) });
    },
  },
  lifetimes: {
    attached() {
      const paths = ICONS[this.data.name] || '';
      if (!paths) return;
      this.setData({ src: makeSvgDataUri(paths, this.data.color, this.data.strokeWidth) });
    },
  },
});
