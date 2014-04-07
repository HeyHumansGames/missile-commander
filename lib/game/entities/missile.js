ig.module(
  'game.entities.missile'
)
.requires(
  'impact.entity',
  'impact.entity-pool'
)
.defines(function() {
  EntityMissile = ig.Entity.extend({

    size: {
      x: 4,
      y: 7
    },

    type:         ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides:     ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet('/media/entities/WAITINGGAME_ACTEUR_canon_missile.png', 4, 7),

    score: -2,

    // Where should I go Boss?
    goal: {
      x: 0,
      y: 0
    },

    init: function(x, y, settings) {
      this.addAnim('idle', 0.2, [0, 1]);
      this.parent(x, y, settings);
      this.goal.x = settings.goal.x;
      this.goal.y = settings.goal.y;
      this.calculateVelocity();
      ig.game.score += this.score;
    },

    reset: function(x, y, settings) {
      this.parent(x, y, settings);
      this.goal.x = settings.goal.x;
      this.goal.y = settings.goal.y;
      this.calculateVelocity();
      ig.game.score += this.score;
    },

    update: function() {
      this.parent();
      if ((this.goal.x * ig.system.scale > ig.system.scale * this.pos.x) && 
          (this.goal.x * ig.system.scale < ig.system.scale * (this.pos.x + this.size.x)) && 
          (this.goal.y * ig.system.scale > ig.system.scale * this.pos.y) && 
          (this.goal.y * ig.system.scale < ig.system.scale * (this.pos.y + this.size.y))) {
        ig.game.spawnEntity(EntityExplosion, this.goal.x, this.goal.y, { type: "player" });
        this.kill();
      }
    },

    draw: function() {
      this.parent();
    },

    calculateVelocity: function() {
      var angle = this.angleTo(this.goal.x * ig.system.scale, this.goal.y * ig.system.scale);
      this.currentAnim.angle = angle + Math.PI/2;
      this.vel.x = 75 * Math.cos(angle);
      this.vel.y = 75 * Math.sin(angle);
    },

    angleTo: function(x, y) {
      return Math.atan2(
        y - ig.system.scale * (this.pos.y + (this.size.y >> 1)),
        x - ig.system.scale * (this.pos.x + (this.size.x >> 1))
      );
    }
  
  });
  ig.EntityPool.enableFor(EntityMissile);
});