Component({
  properties: {
    title: {
      type: String,
      value: '网络开小差了'
    },
    description: {
      type: String,
      value: '请检查网络连接后重试'
    },
    showRetry: {
      type: Boolean,
      value: true
    },
    retryText: {
      type: String,
      value: '重新加载'
    }
  },

  methods: {
    onRetry() {
      this.triggerEvent('retry');
    }
  }
});
