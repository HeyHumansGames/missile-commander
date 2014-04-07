ig.module(
  'game.entities.explosion'
)
.requires(
  'impact.entity',
  'impact.entity-pool'
)
.defines(function() {
  EntityExplosion = ig.Entity.extend({
    
    type:         ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    collides:     ig.Entity.COLLIDES.NEVER,
    
    size: {
      x: 32,
      y: 32
    },

    offset: {
      x: 0,
      y: 0
    },

    animSheet: new ig.AnimationSheet('/media/entities/SS_Explosions.png', 21, 19),

    defaultRadius: 32,
    radius: 32,

    deathTimer: null,

    scoreOrCombo: true,

    init: function(x, y, settings) {
      settings.radius = settings.radius || this.defaultRadius;
      this.addAnim('player', 1, [0]);
      this.addAnim('enemy', 1, [1]);
      
      this.parent(x, y, settings);

      if (settings.type == "player")
        this.currentAnim = this.anims.player;
      else {
        this.currentAnim = this.anims.enemy;
      }

      this.size.x = this.size.y = Math.sqrt(this.radius * this.radius + this.radius * this.radius);

      this.pos.x = x - (this.size.x >> 1);
      this.pos.y = y - (this.size.y >> 1);

      this.offset.x = (21 - this.size.x) >> 1;
      this.offset.y = (19 - this.size.y) >> 1;

      this.deathTimer = new ig.Timer(0.5);
    },

    reset: function(x, y, settings) {
      settings.radius = settings.radius || this.defaultRadius;
      this.scoreOrCombo = true;
      this.parent(x, y, settings);

      if (settings.type == "player")
        this.currentAnim = this.anims.player;
      else {
        this.currentAnim = this.anims.enemy;
      }

      this.size.x = this.size.y = Math.sqrt(this.radius * this.radius + this.radius * this.radius);

      this.pos.x = x - (this.size.x >> 1);
      this.pos.y = y - (this.size.y >> 1);

      this.offset.x = (21 - this.size.x) >> 1;
      this.offset.y = (19 - this.size.y) >> 1;

      this.deathTimer = new ig.Timer(0.5);
    },

    update: function() {
      this.parent();
      if (this.deathTimer.delta() > 0) {
        this.kill();
      };
    },

    draw: function() {
      this.parent();
      this.currentAnim.alpha = this.deathTimerPercent();
    },

    check: function(other) {
      if ((other instanceof EntityCylonMissile || other instanceof EntityCylonAssassin) && this.scoreOrCombo && other.distanceTo(this) < this.radius) {
        ig.game.score += other.score;
        other.kill();
      } else if (other instanceof EntityCylonBoss) {
        other.receiveDamage(10, this);
        ig.game.spawnEntity(EntityParticleEmitter, this.pos.x + (this.size.x >> 1), this.pos.y + (this.size.y >> 1), { maxParticles: 25, startColour: [ 204, 57, 34, 1 ] });
        this.kill();
      }
    },

    deathTimerPercent: function() {
      var opacity = -this.deathTimer.delta() / this.deathTimer.target;
      // limit our opacity, otherwise we can visual artefacts if the number get too small
      // ie: "5.684341886080802e-14" gives ctx.fillStyle = "#FF0000"
      if (opacity < 0.001 || this.deathTimer.delta() > 0)
        return 0;
      return opacity;
    }

  });
  ig.EntityPool.enableFor(EntityExplosion);
});