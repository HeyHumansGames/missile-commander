ig.module(
  'game.entities.radar'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityRadar = ig.Entity.extend({

    size: {
      x: 320,
      y: 240
    },

    type:         ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides:     ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet('/media/WAITINGGAME_BCKGRND_radar5_spread_320X1200.png', 320, 240),

    init: function(x, y, settings) {
      this.addAnim('idle', 0.1, [0, 1, 2, 3, 4]);
      this.parent(x, y, settings);
    }
  });
});