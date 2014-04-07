ig.module(
  'game.entities.cylon-missile'
)
.requires(
  'impact.entity',
  'impact.entity-pool'
)
.defines(function() {
  EntityCylonMissile = ig.Entity.extend({

    type:         ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides:     ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet('/media/entities/WAITINGGAME_ACTEUR_ennemimissile2.png', 7, 5),

    size: {
      x: 7,
      y: 5
    },

    score: 10,

    // Where should I go Leader?
    goal: {
      x: 0,
      y: 0
    },

    // Avoid base explosions to combo missiles
    scoreOrCombo: true,

    // Where do I come from Leader?
    initialPosX: 0,

    init: function(x, y, settings) {
      this.addAnim('idle', 0.2, [0, 1]);
      this.parent(x, y, settings);
      this.initialPosX = x;
      this.goal.x = settings.goal.x;
      this.goal.y = settings.goal.y;
      this.calculateVelocity();
    },

    reset: function(x, y, settings) {
      this.scoreOrCombo = true;
      this.parent(x, y, settings);
      this.initialPosX = x;
      this.goal.x = settings.goal.x;
      this.goal.y = settings.goal.y;
      this.calculateVelocity();
    },

    update: function() {
      this.parent();
      if (this.pos.y > ig.system.height) {
        ig.game.removeLife();
        this.scoreOrCombo = false;
        if (ig.game._state == 1) {
          ig.game.screenShaker.applyImpulse(80, 50);
        } else {
          ig.game.screenShaker.applyImpulse(10, 10);
        }
        this.kill();
      }
    },

    draw: function() {
      this.parent();
    },

    calculateVelocity: function() {
      var angle = this.angleTo(this.goal.x, this.goal.y);
      this.currentAnim.angle = angle + 3 * Math.PI/2;
      this.vel.x = 20 * Math.cos(angle);
      this.vel.y = 20 * Math.sin(angle);
    },

    angleTo: function(x, y) {
      return Math.atan2(
        y - (this.pos.y + (this.size.y >> 1)),
        x - (this.pos.x + (this.size.x >> 1))
      );
    },

    kill: function() {
      ig.game.spawnEntity(EntityExplosion, this.pos.x + (this.size.x >> 1), this.pos.y + (this.size.y >> 1), { radius: 16, scoreOrCombo: this.scoreOrCombo });
      if (ig.game._state == 1) {
        ig.game.sounds.cylonMissileExplosion.play();
        ig.game.spawnEntity(EntityParticleEmitter, this.pos.x + (this.size.x >> 1), this.pos.y + (this.size.y >> 1));
      }
      this.parent();
    }
  
  });
  ig.EntityPool.enableFor(EntityCylonMissile);
});