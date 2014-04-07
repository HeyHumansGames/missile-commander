ig.module(
  'game.entities.cylon-destroyer'
)
.requires(
  'impact.entity',
  'impact.entity-pool'
)
.defines(function() {
  EntityCylonDestroyer = ig.Entity.extend({

    type:         ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides:     ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet('/media/entities/WAITINGGAME_ACTEUR_ennemi.png', 23, 21),

    size: {
      x: 23,
      y: 21
    },

    marked: false,
    // Special enemy type doing circles
    circler: false,

    missiles: [],

    score: 50,

    init: function(x, y, settings) {
      this.addAnim('teleporting', 0.2, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], true);
      this.addAnim('attacking', 0.2, [19, 20]);
      this.parent(x, y, settings);
      this.origin = { x: x, y: y };
    },

    reset: function(x, y, settings) {
      this.circler = false;
      this.marked = false;
      this.parent(x, y, settings);
      this.origin = { x: x, y: y };
      this.missiles = [];
      this.currentAnim = this.anims.teleporting.rewind();
    },

    update: function() {
      this.parent();
      if (!this.marked && ig.input.released('leftClick') && this.currentAnim.frame > 7 && this.currentAnim.frame < 19 && this.inFocus()) {
        ig.input.clearPressed();
        ig.game.score += this.score;
        this.marked = true;
        ig.game.sounds.supaMissile.play();

        var sm = ig.game.spawnEntity(EntitySupaMissile, this.pos.x, ig.game.canon.pos.y + 10);
        sm.goal = this;
        sm.vel = { x: 40, y: -100 };
        this.missiles.push(sm);

        var sm2 = ig.game.spawnEntity(EntitySupaMissile, this.pos.x, ig.game.canon.pos.y + 10);
        sm2.goal = this;
        sm2.vel = { x: -40, y: -100 };
        this.missiles.push(sm2);

        var sm3 = ig.game.spawnEntity(EntitySupaMissile, this.pos.x, ig.game.canon.pos.y + 10);
        sm3.goal = this;
        sm3.vel = { x: 80, y: -130 };
        this.missiles.push(sm3);

        var sm4 = ig.game.spawnEntity(EntitySupaMissile, this.pos.x, ig.game.canon.pos.y + 10);
        sm4.goal = this;
        sm4.vel = { x: -80, y: -130 };
        this.missiles.push(sm4);
      }
      if (this.pos.y > ig.system.height) {
        ig.game.removeLife();
        ig.game.screenShaker.applyImpulse(80, 50);
        this.kill();
      }
      if (this.currentAnim === this.anims.teleporting && this.currentAnim.loopCount == 1) {
        this.currentAnim = this.anims.attacking.rewind();
        this.vel.y = 30;
      }
      if (this.circler && this.currentAnim === this.anims.teleporting && this.currentAnim.frame == 8) {
        this.circleTimer = new ig.Timer();
        this.mod = Math.random() >= 0.5 ? -1 : 1
      }
      if (this.circler && this.currentAnim === this.anims.teleporting && this.currentAnim.frame > 7) {
        this.pos.x = this.origin.x +      ( 18 * ( Math.cos( this.mod * this.circleTimer.delta() + Math.PI/2 ) ) );
        this.pos.y = this.origin.y - 18 + ( 18 * ( Math.sin( this.circleTimer.delta() + Math.PI/2 ) ) );
      }
    },

    inFocus: function() {
      return (
         (this.pos.x <= (ig.input.mouse.x + ig.game.screen.x)) &&
         ((ig.input.mouse.x + ig.game.screen.x) <= this.pos.x + this.size.x) &&
         (this.pos.y <= (ig.input.mouse.y + ig.game.screen.y)) &&
         ((ig.input.mouse.y + ig.game.screen.y) <= this.pos.y + this.size.y)
      );
     },

    kill: function() {
      ig.game.spawnEntity(EntityExplosion, this.pos.x + (this.size.x >> 1), this.pos.y + (this.size.y >> 1), { radius: 16 });
      ig.game.sounds.destroyerExplosion.play();
      ig.game.spawnEntity(EntityParticleEmitter, this.pos.x + (this.size.x >> 1), this.pos.y + (this.size.y >> 1), { maxParticles: 25, startColour: [ 255, 153, 0, 1 ] });
      for (var i = this.missiles.length - 1; i >= 0; i--) {
        ig.game.spawnEntity(EntityExplosion, this.missiles[i].pos.x, this.missiles[i].pos.y, { type: "player" });
        this.missiles[i].kill();
      };
      this.parent();
    }
  
  });
  ig.EntityPool.enableFor(EntityCylonDestroyer);
});