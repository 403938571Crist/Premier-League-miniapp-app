Component({
  properties: {
    teamId: {
      type: null,
      value: ''
    },
    teamInfo: {
      type: Object,
      value: {}
    },
    size: {
      type: String,
      value: 'normal' // normal, small
    }
  },

  data: {
    isFollowing: false,
    loading: false
  },

  lifetimes: {
    attached() {
      this.checkFollowStatus();
    }
  },

  methods: {
    checkFollowStatus() {
      const app = getApp();
      const isFollowing = app.isFollowing(this.properties.teamId);
      this.setData({ isFollowing });
    },

    async onTap() {
      if (this.data.loading) return;
      
      const app = getApp();
      const { teamId, teamInfo } = this.properties;
      
      this.setData({ loading: true });
      
      try {
        if (this.data.isFollowing) {
          // 取消关注
          const confirmed = await this.showUnfollowConfirm();
          if (confirmed) {
            app.unfollowTeam(teamId);
            this.setData({ isFollowing: false });
            wx.showToast({ title: '已取消关注', icon: 'none' });
            this.triggerEvent('change', {
              isFollowing: false,
              teamId
            });
          }
        } else {
          // 关注
          app.followTeam({
            id: teamId,
            name: teamInfo.name,
            logo: teamInfo.logo
          });
          this.setData({ isFollowing: true });
          wx.showToast({ title: '关注成功', icon: 'success' });
          this.triggerEvent('change', {
            isFollowing: true,
            teamId
          });
        }
      } catch (error) {
        console.error('Follow action error:', error);
      } finally {
        this.setData({ loading: false });
      }
    },

    showUnfollowConfirm() {
      return new Promise((resolve) => {
        wx.showModal({
          title: '取消关注',
          content: '确定不再关注这支球队吗？',
          confirmColor: '#FF5252',
          success: (res) => {
            resolve(res.confirm);
          }
        });
      });
    }
  }
});
