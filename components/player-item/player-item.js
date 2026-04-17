const { calculateAge } = require('../../utils/util');

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
      const displayName = player.name || `${player.firstName || ''} ${player.lastName || ''}`.trim();
      const age = calculateAge(player.dateOfBirth);

      this.setData({
        name: displayName,
        photo: player.photo || player.photoUrl || '/images/default/player.png',
        position: player.positionLabel || player.chinesePosition || player.position || '未知',
        nationality: player.nationalityLabel || player.chineseNationality || player.nationality || '',
        age,
        number: player.shirtNumber || ''
      });
    },

    onTap() {
      this.triggerEvent('tap', { player: this.properties.player });
    }
  }
});
