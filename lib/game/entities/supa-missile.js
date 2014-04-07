ig.module(
  'game.entities.supa-missile'
)
.requires(
  'impact.entity',
  'impact.entity-pool'
)
.defines(function() {
  EntitySupaMissile = ig.Entity.extend({

    size: {
      x: 4,
      y: 5
    },

    offset: {
      x: 3,
      y: 1
    },

    type:         ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides:     ig.Entity.COLLIDES.NEVER,

    maxVel: {
      x: 1000,
      y: 1000
    },

    // Display trail
    trails: [],
    trailTimer: null,
    trailTime: 0.15,

    animSheet: new ig.AnimationSheet('/media/entities/WAITINGGAME_ACTEUR_canon_GROS_missile.png', 10, 7),
    trailAnimSheet: new ig.AnimationSheet('/media/entities/WAITINGGAME_ACTEUR_canon_GROS_missile_traine.png', 10, 7),
    trailAnim: null,

    // Enter. Direction.
    goal: null,

    // Max. Steering. Angle.
    maxSteeringAngle: 3,

    // Time before steering towards goal
    timerToGoalTime: 0.5,
    timerToGoal: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 0.2, [0, 1]);
      this.trailAnim = new ig.Animation(this.trailAnimSheet, 0.1, [0], true);
      this.timerToGoal = new ig.Timer(this.timerToGoalTime);
      this.trailTimer = new ig.Timer(this.trailTime);
    },

    reset: function(x, y, settings) {
      this.parent(x, y, settings);
      this.timerToGoal = new ig.Timer(this.timerToGoalTime);
      this.trailTimer = new ig.Timer(this.trailTime);
      this.trails = [];
    },

    update: function() {
      this.parent();
      // Add a trail
      if (this.trailTimer.delta() > 0) {
        this.trails.push([this.pos.x, this.pos.y, Math.atan2(this.vel.y, this.vel.x) + Math.PI/2])
        this.trailTimer.reset();
      }
      // Time to chase the enemy
      if (this.timerToGoal.delta() > 0) {
        this.calculateVelocity();
      }
      // Are we on target?
      outerX = this.goal.pos.x;// - (this.goal.size.x >> 1);
      outerY = this.goal.pos.y;// - (this.goal.size.y >> 1);
      if ((this.pos.x >= outerX) && (this.pos.x <= outerX + (this.goal.size.x)) &&
          (this.pos.y >= outerY) && (this.pos.y <= outerY + (this.goal.size.y))) {
        this.goal.kill();
        ig.game.screenShaker.applyImpulse(30, 30);
      }
      this.currentAnim.angle = Math.atan2(this.vel.y, this.vel.x) + Math.PI/2;
    },

    kill: function() {
      this.goal = null;
      this.parent();
    },

    draw: function() {
      this.parent();
      var alpha = 0.75;
      for (var i = this.trails.length - 1; i >= 0; i--) {
        if(alpha > 0) {
          var t = this.trails[i];
          this.trailAnim.alpha = alpha;
          alpha = alpha - 0.15
          this.trailAnim.angle = t[2];
          this.trailAnim.draw(t[0], t[1]);
        }
      };
    },

    calculateVelocity: function() {
      var cur_angle = Math.atan2(this.vel.y, this.vel.x);
      var angle = this.angleTo(this.goal.pos.x * ig.system.scale, this.goal.pos.y * ig.system.scale);

      angleDelta = cur_angle - angle;
      var new_angle;
      if (angleDelta > 0) {
        if (angleDelta > this.maxSteeringAngle.toRad())
          new_angle = cur_angle - this.maxSteeringAngle.toRad()
        else
          new_angle = angle
      } else {
        if (angleDelta < -1 * this.maxSteeringAngle.toRad())
          new_angle = cur_angle + this.maxSteeringAngle.toRad()
        else
          new_angle = angle
      }
      
      this.vel.x = 100 * Math.cos(new_angle);
      this.vel.y = 100 * Math.sin(new_angle);
    },

    angleTo: function(x, y) {
      return Math.atan2(
        y - ig.system.scale * (this.pos.y + (this.size.y >> 1)),
        x - ig.system.scale * (this.pos.x + (this.size.x >> 1))
      );
    }
  
  });
  ig.EntityPool.enableFor(EntitySupaMissile);
});