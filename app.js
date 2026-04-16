App({
  globalData: {
    userInfo: null,
    followedTeams: [],
    // ============================================
    // 部署配置：后端 API 基地址
    // 本地开发：'http://localhost:8080/api'
    // 微信云托管生产环境：'https://你的云托管域名/api'
    // ============================================
    apiBaseUrl: 'http://localhost:8080/api',
    backendApiBaseUrl: 'http://localhost:8080/api',
    newsApiBaseUrl: 'http://localhost:8080/api',
    cachePrefix: 'appCache:',
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

  getCacheStorageKey(key) {
    return `${this.globalData.cachePrefix}${key}`;
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
        console.error('新版本下载失败');
      });
    }
  }
});
