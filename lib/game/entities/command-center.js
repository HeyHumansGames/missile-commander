ig.module(
  'game.entities.command-center'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityCommandCenter = ig.Entity.extend({

    size: {
      x: 320,
      y: 6
    },

    offset: {
      x: -5,
      y: 0
    },

    livesToAnim: ['danger', 'warning', 'okay'],

    type:         ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides:     ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet('/media/entities/WAITINGGAME_ACTEUR_base.png', 308, 6),

    init: function(x, y, settings) {
      this.addAnim('okay', 1, [0]);
      this.addAnim('warning', 1, [1]);
      this.addAnim('danger', 1, [2]);
      this.parent(x, y, settings);
    }
  });
});