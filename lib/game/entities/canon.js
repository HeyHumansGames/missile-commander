ig.module(
  'game.entities.canon'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityCanon = ig.Entity.extend({

    size: {
      x: 20,
      y: 20
    },

    center: {
      x: 0,
      y: 0
    },

    zIndex: 9999,

    type:         ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides:     ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet('/media/entities/WAITINGGAME_ACTEUR_canon.png', 20, 20),

    init: function(x, y, settings) {
      this.addAnim('idle', 0.3, [0, 1]);
      this.parent(x, y, settings);
      this.center.x = ig.system.scale * (this.pos.x + 10);
      this.center.y = ig.system.scale * (this.pos.y + 10);
    },

    // update: function() {
    //   this.currentAnim.angle = this.angleTo(ig.input.mouse.x, ig.input.mouse.y) + Math.PI/2
    // },

    fire: function(targetX, targetY) {
      ig.game.spawnEntity(EntityMissile, this.pos.x + 10, this.pos.y + 10, {
        goal: {
          x: targetX,
          y: targetY
        }
      });
    }

    // angleTo: function(x, y) {
    //   return Math.atan2(
    //     y - (this.pos.y + (this.size.y >> 1)),
    //     x - (this.pos.x + (this.size.x >> 1))
    //   );
    // }

  });
});