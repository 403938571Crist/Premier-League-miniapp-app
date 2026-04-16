const { getPlayerPosition, calculateAge } = require('../../utils/util');

Component({
  properties: {
    player: {
      type: Object,
      value: {},
      observer(newVal) {
        if (newVal) {
          this.processPlayerData(newVal);
        }
      }
    }
  },

  data: {
    name: '',
    photo: '',
    position: '',
    nationality: '',
    age: 0,
    number: ''
  },

  methods: {
    processPlayerData(player) {
      const { name, firstName, lastName, position, nationality, dateOfBirth, shirtNumber } = player;
      
      // 处理姓名
      const displayName = name || `${firstName || ''} ${lastName || ''}`.trim();
      
      // 计算年龄
      const age = calculateAge(dateOfBirth);
      
      this.setData({
        name: displayName,
        photo: '/images/default/player.png', // API可能不直接提供照片
        position: getPlayerPosition(position) || '未知',
        nationality: nationality || '',
        age,
        number: shirtNumber || ''
      });
    },

    onTap() {
      this.triggerEvent('tap', { player: this.properties.player });
    }
  }
});
