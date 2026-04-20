const { API_BASE_URL } = require('./utils/env-config');

App({
  globalData: {
    userInfo: null,
    authToken: '',
    followedTeams: [],
    apiBaseUrl: API_BASE_URL,
    backendApiBaseUrl: API_BASE_URL,
    newsApiBaseUrl: API_BASE_URL,
    cachePrefix: 'appCache:',
    lruCaches: {},
    cache: {
      standings: null,
      standingsTime: null,
      fixtures: null,
      fixturesTime: null,
      teams: null,
      teamsTime: null
    }
  },

  onLaunch() {
    console.log('App Launch');
    this.getAuthToken();
    this.loadFollowedTeams();
    this.checkUpdate();
  },

  onShow() {
    console.log('App Show');
  },

  onHide() {
    console.log('App Hide');
  },

  onError(msg) {
    console.error('App Error:', msg);
  },

  getAuthToken() {
    if (this.globalData.authToken) {
      return this.globalData.authToken;
    }

    const storageKeys = ['authToken', 'token', 'accessToken'];
    for (const key of storageKeys) {
      try {
        const value = wx.getStorageSync(key);
        if (typeof value === 'string' && value.trim()) {
          this.globalData.authToken = value.trim();
          return this.globalData.authToken;
        }
      } catch (error) {
        console.error('读取 token 失败:', error);
      }
    }

    return '';
  },

  setAuthToken(token, persist = true) {
    const nextToken = typeof token === 'string' ? token.trim() : '';
    this.globalData.authToken = nextToken;

    if (!persist) {
      return;
    }

    try {
      wx.setStorageSync('authToken', nextToken);
    } catch (error) {
      console.error('保存 token 失败:', error);
    }
  },

  clearAuthToken() {
    this.globalData.authToken = '';
    ['authToken', 'token', 'accessToken'].forEach((key) => {
      try {
        wx.removeStorageSync(key);
      } catch (error) {
        console.error('清理 token 失败:', error);
      }
    });
  },

  getCacheStorageKey(key) {
    return `${this.globalData.cachePrefix}${key}`;
  },

  getLruStorageKey(name) {
    return `${this.globalData.cachePrefix}lru:${name}`;
  },

  loadLruCache(name) {
    if (!name) {
      return [];
    }

    if (!this.globalData.lruCaches[name]) {
      let entries = [];
      try {
        const stored = wx.getStorageSync(this.getLruStorageKey(name));
        if (Array.isArray(stored)) {
          entries = stored.filter((item) => item && item.key && item.value);
        }
      } catch (error) {
        console.error('读取 LRU 缓存失败:', error);
      }

      this.globalData.lruCaches[name] = entries;
    }

    return this.globalData.lruCaches[name];
  },

  saveLruCache(name) {
    if (!name) {
      return;
    }

    try {
      wx.setStorageSync(this.getLruStorageKey(name), this.globalData.lruCaches[name] || []);
    } catch (error) {
      console.error('写入 LRU 缓存失败:', error);
    }
  },

  getLruValue(name, key, limit = 100) {
    if (!name || !key) {
      return '';
    }

    const cache = this.loadLruCache(name);
    const hitIndex = cache.findIndex((item) => item.key === key);

    if (hitIndex === -1) {
      return '';
    }

    const [hit] = cache.splice(hitIndex, 1);
    cache.unshift(hit);

    if (cache.length > limit) {
      cache.length = limit;
    }

    this.saveLruCache(name);
    return hit.value || '';
  },

  setLruValue(name, key, value, limit = 100) {
    if (!name || !key || !value) {
      return;
    }

    const cache = this.loadLruCache(name);
    const hitIndex = cache.findIndex((item) => item.key === key);

    if (hitIndex !== -1) {
      cache.splice(hitIndex, 1);
    }

    cache.unshift({
      key,
      value,
      updatedAt: Date.now()
    });

    if (cache.length > limit) {
      cache.length = limit;
    }

    this.saveLruCache(name);
  },

  loadFollowedTeams() {
    try {
      const followed = wx.getStorageSync('followedTeams');
      if (followed) {
        this.globalData.followedTeams = JSON.parse(followed);
      }
    } catch (e) {
      console.error('加载关注球队失败:', e);
    }
  },

  saveFollowedTeams() {
    try {
      wx.setStorageSync('followedTeams', JSON.stringify(this.globalData.followedTeams));
    } catch (e) {
      console.error('保存关注球队失败:', e);
    }
  },

  followTeam(team) {
    const index = this.globalData.followedTeams.findIndex((t) => t.id === team.id);
    if (index === -1) {
      this.globalData.followedTeams.push(team);
      this.saveFollowedTeams();
      return true;
    }
    return false;
  },

  unfollowTeam(teamId) {
    const index = this.globalData.followedTeams.findIndex((t) => t.id === teamId);
    if (index > -1) {
      this.globalData.followedTeams.splice(index, 1);
      this.saveFollowedTeams();
      return true;
    }
    return false;
  },

  isFollowing(teamId) {
    return this.globalData.followedTeams.some((t) => t.id === teamId);
  },

  getCache(key) {
    const cacheTimeKey = `${key}Time`;
    let data = this.globalData.cache[key];
    let time = this.globalData.cache[cacheTimeKey];

    if (!data || !time) {
      try {
        const stored = wx.getStorageSync(this.getCacheStorageKey(key));
        if (stored && stored.data && stored.time) {
          data = stored.data;
          time = stored.time;
          this.globalData.cache[key] = data;
          this.globalData.cache[cacheTimeKey] = time;
        }
      } catch (e) {
        console.error('读取缓存失败:', e);
      }
    }

    if (!data || !time) {
      return null;
    }

    const cacheDuration = this.getCacheDuration(key);
    if (Date.now() - time > cacheDuration) {
      this.globalData.cache[key] = null;
      this.globalData.cache[cacheTimeKey] = null;
      try {
        wx.removeStorageSync(this.getCacheStorageKey(key));
      } catch (e) {
        console.error('删除过期缓存失败:', e);
      }
      return null;
    }

    return {
      data,
      cachedAt: time,
      isCached: true
    };
  },

  setCache(key, data) {
    const time = Date.now();
    this.globalData.cache[key] = data;
    this.globalData.cache[`${key}Time`] = time;

    try {
      wx.setStorageSync(this.getCacheStorageKey(key), { data, time });
    } catch (e) {
      console.error('写入缓存失败:', e);
    }
  },

  isCacheFresh(key) {
    return !!this.getCache(key);
  },

  getCacheDuration(key) {
    if (key.startsWith('fixtures:')) return 60 * 1000;
    if (key.startsWith('team_')) return 10 * 60 * 1000;
    if (key.startsWith('player_')) return 10 * 60 * 1000;

    const durations = {
      standings: 5 * 60 * 1000,
      fixtures: 60 * 1000,
      teams: 60 * 60 * 1000,
      teamDetail: 10 * 60 * 1000,
      playerDetail: 10 * 60 * 1000
    };

    return durations[key] || 5 * 60 * 1000;
  },

  clearCache() {
    this.globalData.lruCaches = {};
    this.globalData.cache = {
      standings: null,
      standingsTime: null,
      fixtures: null,
      fixturesTime: null,
      teams: null,
      teamsTime: null
    };

    const storageKeys = wx.getStorageInfoSync().keys || [];
    storageKeys.forEach((key) => {
      if (key.startsWith(this.globalData.cachePrefix)) {
        wx.removeStorageSync(key);
        return;
      }

      if (key !== 'followedTeams') {
        wx.removeStorageSync(key);
      }
    });

    this.loadFollowedTeams();
  },

  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新:', res.hasUpdate);
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        console.error('热更新下载失败，请重试');
      });
    }
  }
});
