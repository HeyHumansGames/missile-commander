ig.module(
  'game.entities.cylon-boss'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityCylonBoss = ig.Entity.extend({

    type:         ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides:     ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet('/media/entities/WAITINGGAME_ACTEUR_boss.png', 51, 45),

    size: {
      x: 51,
      y: 45
    },

    attackTimer: null,
    spawnedMissiles: false,
    circleTimer: null,
    _inPosition: false,

    marked: false,
    missiles: [],

    score: 500,
    health: 1000,

    init: function(x, y, settings) {
      this.addAnim('move', 0.2, [2, 3, 4, 5]);
      this.addAnim('attack', 0.2, [0, 0, 1, 0, 0], true);
      this.addAnim('kamikaze', 0.2, [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], true);
      this.parent(x, y, settings);
      this.origin = { x: x, y: y };
      this.attackTimer = new ig.Timer(2.5);
    },

    update: function() {
      this.parent();

      // When in kamikaze mode
      if (!this.marked && ig.input.released('leftClick') && this.currentAnim === this.anims.kamikaze) {
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

      // Kill and/or remove life
      if (this.pos.y > ig.system.height) {
        if(!this.marked) {
          ig.game.removeLife();
          ig.game.screenShaker.applyImpulse(80, 50);
        }
        this.kill();
      }

      // Attack every 3 move loop
      if(this.currentAnim === this.anims.move && this.currentAnim.loopCount > 3) {
        if (this.currentAnim === this.anims.move)
          this.currentAnim = this.anims.attack.rewind();
      }

      // Spawn the missiles at the right time
      if (this._inPosition && this.currentAnim === this.anims.attack && this.currentAnim.frame == 2 && !this.spawnedMissiles) {
        this.spawnedMissiles = true;
        ig.game.spawnEntity(EntityCylonAssassin, this.pos.x + 18, this.pos.y + 32, {
          goal: {
            x: ig.system.width * Math.random(),
            y: ig.system.height
          }
        });
        ig.game.spawnEntity(EntityCylonAssassin, this.pos.x + 33, this.pos.y + 32, {
          goal: {
            x: ig.system.width * Math.random(),
            y: ig.system.height
          }
        });
      }

      // Back to move after attack
      if (this.currentAnim === this.anims.attack && this.currentAnim.loopCount > 0) {
        this.spawnedMissiles = false;
        this.currentAnim = this.anims.move.rewind();
      }

      // Move for real
      if (this.currentAnim !== this.anims.kamikaze) {
        if (this._inPosition) {
          this.pos.x = this.origin.x +      ( 4 * 18 * ( Math.cos( (this.circleTimer.delta() + Math.PI/2) ) ) );
          this.pos.y = this.origin.y + (18 * ( Math.sin( (this.circleTimer.delta() + Math.PI/2) * 2 ) ));
        } else {
          if (this.pos.y > 60) {
            this._inPosition = true;
            this.vel.y = 0;            
            this.circleTimer = new ig.Timer();
            this.origin = { x: this.pos.x, y: this.pos.y };
          };
          this.vel.y = 20;
        }
      }
    },

    draw: function() {
      this.parent();
      if (this.currentAnim !== this.anims.kamikaze) {
        ig.system.context.beginPath();
        ig.system.context.arc((this.pos.x + (this.size.x >> 1)) * ig.system.scale, (this.pos.y + (this.size.y >> 1) - 3) * ig.system.scale, (25 + this.health/25) * ig.system.scale, 0, 2 * Math.PI);
        ig.system.context.arc((this.pos.x + (this.size.x >> 1)) * ig.system.scale, (this.pos.y + (this.size.y >> 1) - 3) * ig.system.scale, 25 * ig.system.scale, 0, 2 * Math.PI, true);
        ig.system.context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ig.system.context.fill();
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

    receiveDamage: function( amount, from ) {
      if (this._inPosition) {
        this.health -= amount;
        if( this.health <= 0 && this.currentAnim !== this.anims.kamikaze ) {
          this.currentAnim = this.anims.kamikaze.rewind();
          this.vel.y = 60;
        }
      }
    },
  
    kill: function() {
      ig.game.spawnEntity(EntityExplosion, this.pos.x + (this.size.x >> 1), this.pos.y + (this.size.y >> 1), { radius: 16 });
      ig.game.sounds.destroyerExplosion.play();
      ig.game.spawnEntity(EntityParticleEmitter, this.pos.x + (this.size.x >> 1), this.pos.y + (this.size.y >> 1), { maxParticles: 25, startColour: [ 255, 153, 0, 1 ] });
      for (var i = this.missiles.length - 1; i >= 0; i--) {
        ig.game.spawnEntity(EntityExplosion, this.missiles[i].pos.x, this.missiles[i].pos.y, { type: "player" });
        this.missiles[i].kill();
      };
      ig.game._killedBoss = true;
      this.parent();
    }
  });
});