Component({
  properties: {
    title: {
      type: String,
      value: '暂无数据'
    },
    description: {
      type: String,
      value: ''
    },
    showIcon: {
      type: Boolean,
      value: true
    },
    showAction: {
      type: Boolean,
      value: false
    },
    actionText: {
      type: String,
      value: '刷新'
    }
  },

  methods: {
    onAction() {
      this.triggerEvent('action');
    }
  }
});
