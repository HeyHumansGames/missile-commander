ig.module( 
  'game.entities.particle-emitter'
)
.requires(
  'impact.entity'
  // Uses (without extending) 'impact.entity-pool'
)
.defines(function(){
  EntityParticleEmitter = function (x, y, settings) {
    var obj = this.staticInstantiate.apply(this, arguments);
    if(obj) 
      return obj;

    // Basic Impact stuff
    this.id = ++ig.Entity._lastId;
    this.pos = {x: 0, y: 0};
    this.pos.x = x;
    this.pos.y = y;

    this._maxParticles = 10;
    if (settings.maxParticles)
      this._maxParticles = settings.maxParticles;
    this._particles = [];
    this._active = true;

    this._particleCount = 0;

    this.startColour = [ 255, 255, 0, 1 ];
    if (settings.startColour)
      this.startColour = settings.startColour.slice(0);
    
    this.canvas = ig.system.canvas;
    this.ctx = this.canvas.getContext('2d');
    
    this.effectCanvas = ig.system.effectCanvas;
    this.effectCtx = this.effectCanvas.getContext('2d');

    this._killed = false;
  };
  
  EntityParticleEmitter.classId = "EntityParticleEmitter";
  EntityParticleEmitter.prototype = {
    classId: "EntityParticleEmitter",

    size: { x: 1, y: 1 },
    vel: {x: 0, y: 0},

    // Particle Properties
    positionRandom: { x: 8, y: 8 },
    sizeRandom: 2,
    speed: 150,
    speedRandom: 30,
    lifeSpan: 0.8,
    lifeSpanRandom: 0.5,
    angle: -90,
    angleRandom: 360,
    endColour: [ 255, 255, 0, 0 ],

    // EntityPool
    staticInstantiate: function( x, y, settings ) {
      return ig.EntityPool.getFromPool( this.classId, x, y, settings );
    },
    // EntityPool
    erase: function() {
      ig.EntityPool.putInPool(this);
    },

    touches: function (other) {},

    reset: function (x, y, settings) {
      // Basic Impact stuff
      this.id = ++ig.Entity._lastId;
      this.pos = {x: 0, y: 0};
      this.pos.x = x;
      this.pos.y = y;

      this._maxParticles = 15;
      if (settings.maxParticles)
        this._maxParticles = settings.maxParticles;
      this._particles = [];
      this._active = true;

      this._particleCount = 0;

      this.startColour = [ 255, 255, 0, 1 ];
      if (settings.startColour)
        this.startColour = settings.startColour.slice(0);
      
      this.canvas = ig.system.canvas;
      this.ctx = this.canvas.getContext('2d');
      
      this.effectCanvas = ig.system.effectCanvas;
      this.effectCtx = this.effectCanvas.getContext('2d');

      this._killed = false;
    },

    addParticle: function(x, y) {
      if(this._particleCount == this._maxParticles) {
        return false;
      }
      // Take the next particle out of the particle pool we have created and initialize it
      var particle = ig.game.spawnEntity(EntityParticle, x, y, { spawner: this });
      this._particles[ this._particleCount ] = particle;
      // Increment the particle count
      this._particleCount++;
      
      return true;
    },

    update: function() {
      var delta = ig.system.tick;
      while( this._particleCount < this._maxParticles){
        this.addParticle(this.pos.x, this.pos.y);
      }
      var kill = true;
      for (var i = this._particles.length - 1; i >= 0; i--) {
        if (this._particles[i]._killed === false) {
          kill = false;
          break;
        }
      }
      if (kill === true)
        this.kill();
    },
    
    draw: function(){        
      for(i = 0; i < this._particles.length; i++){
        if (!this._particles[i]._killed) {
          this._particles[i]._draw();
        }
      }
      this.ctx.drawImage(this.effectCanvas, 0, 0);
    },

    kill: function() {
      ig.game.removeEntity(this);
    }
  };

  EntityParticle = function(x, y, settings) {    
    var obj = this.staticInstantiate.apply(this, arguments);
    if(obj)
      return obj;
    this.spawner = settings.spawner;

    x = ~~(x + this.spawner.positionRandom.x * this.RANDM1TO1());
    y = ~~(y + this.spawner.positionRandom.y * this.RANDM1TO1());
    
    // Basic Impact stuff
    this.id = ++ig.Entity._lastId;
    this.pos = {x: 0, y: 0};
    this.pos.x = x;
    this.pos.y = y;
    this.vel = { x: 0, y: 0 };
    this.size = { x: 2, y: 2 };

    var newAngle = (this.spawner.angle + this.spawner.angleRandom * this.RANDM1TO1() ) * ( Math.PI / 180 );
  
    this.vel.x = Math.cos(newAngle) * this.spawner.speed + this.spawner.speedRandom * this.RANDM1TO1();
    this.vel.y = Math.sin(newAngle) * this.spawner.speed + this.spawner.speedRandom * this.RANDM1TO1();
    
    size = this.spawner.size.x + (this.spawner.sizeRandom * Math.random());
    size = size < 0 ? 0 : ~~size;
    this.size.x = size;
    this.size.y = size;
    
    this.timeToLive = this.spawner.lifeSpan + this.spawner.lifeSpanRandom * Math.random();
    
    this.colour = this.spawner.startColour.slice(0);
    this.drawColour = "";
    this.deltaColour = [];
    this.deltaColour[ 0 ] = ( this.spawner.endColour[ 0 ] - this.spawner.startColour[ 0 ] ) / this.timeToLive;
    this.deltaColour[ 1 ] = ( this.spawner.endColour[ 1 ] - this.spawner.startColour[ 1 ] ) / this.timeToLive;
    this.deltaColour[ 2 ] = ( this.spawner.endColour[ 2 ] - this.spawner.startColour[ 2 ] ) / this.timeToLive;
    this.deltaColour[ 3 ] = ( this.spawner.endColour[ 3 ] - this.spawner.startColour[ 3 ] ) / this.timeToLive;
    
    this._killed = false;
  };

  EntityParticle.classId = "EntityParticle";
  EntityParticle.prototype = {
    classId: "EntityParticle",

    maxVel: { x: 500, y: 500},

    RANDM1TO1: function(){ return Math.random() * 2 - 1; },

    reset: function(x, y, settings) {
      this.spawner = settings.spawner;

      x = ~~(x + this.spawner.positionRandom.x * this.RANDM1TO1());
      y = ~~(y + this.spawner.positionRandom.y * this.RANDM1TO1());
      
      // Basic Impact stuff
      this.id = ++ig.Entity._lastId;
      this.pos = {x: 0, y: 0};
      this.pos.x = x;
      this.pos.y = y;
      this.vel = { x: 0, y: 0 };
      this.size = { x: 2, y: 2 };

      var newAngle = (this.spawner.angle + this.spawner.angleRandom * this.RANDM1TO1() ) * ( Math.PI / 180 );
    
      this.vel.x = Math.cos(newAngle) * this.spawner.speed + this.spawner.speedRandom * this.RANDM1TO1();
      this.vel.y = Math.sin(newAngle) * this.spawner.speed + this.spawner.speedRandom * this.RANDM1TO1();
      
      size = this.spawner.size.x + (this.spawner.sizeRandom * Math.random());
      size = size < 0 ? 0 : ~~size;
      this.size.x = size;
      this.size.y = size;
      
      this.timeToLive = this.spawner.lifeSpan + this.spawner.lifeSpanRandom * Math.random();
      
      this.colour = this.spawner.startColour.slice(0);
      this.drawColour = "";
      this.deltaColour = [];
      this.deltaColour[ 0 ] = ( this.spawner.endColour[ 0 ] - this.spawner.startColour[ 0 ] ) / this.timeToLive;
      this.deltaColour[ 1 ] = ( this.spawner.endColour[ 1 ] - this.spawner.startColour[ 1 ] ) / this.timeToLive;
      this.deltaColour[ 2 ] = ( this.spawner.endColour[ 2 ] - this.spawner.startColour[ 2 ] ) / this.timeToLive;
      this.deltaColour[ 3 ] = ( this.spawner.endColour[ 3 ] - this.spawner.startColour[ 3 ] ) / this.timeToLive;
      
      this._killed = false;
    },

    // EntityPool
    staticInstantiate: function( x, y, settings ) {
      return ig.EntityPool.getFromPool( this.classId, x, y, settings );
    },
    // EntityPool
    erase: function() {
      ig.EntityPool.putInPool(this);
    },

    touches: function (other) {},

    update: function(){
      // If the current particle is alive then update it
      if (this.size.x == 0)
        this.kill();
      else {
        if (this.timeToLive > 0){
          var delta = ig.system.tick;
          this.timeToLive -= delta;
          // Still have my old transforms
          var r = this.colour[ 0 ] += ( this.deltaColour[ 0 ] * delta );
          var g = this.colour[ 1 ] += ( this.deltaColour[ 1 ] * delta );
          var b = this.colour[ 2 ] += ( this.deltaColour[ 2 ] * delta );
          var a = this.colour[ 3 ] += ( this.deltaColour[ 3 ] * delta );
          // Calculate the rgba string to draw.
          var draw = [];
          draw.push("rgba(" + ( r > 255 ? 255 : r < 0 ? 0 : ~~r ) );
          draw.push( g > 255 ? 255 : g < 0 ? 0 : ~~g );
          draw.push( b > 255 ? 255 : b < 0 ? 0 : ~~b );
          draw.push( (a > 1 ? 1 : a < 0 ? 0 : a.toFixed( 2 ) ) + ")");
          this.drawColour = draw.join( "," );
        } else {
          this.kill();
        }
        this.pos.x += this.vel.x * ig.system.tick;
        this.pos.y += this.vel.y * ig.system.tick;
      }
    },

    draw: function() {},

    _draw: function(){
      var halfSize = this.size.x >> 1;
      var x = ~~this.pos.x + ig.game.screen.x;
      var y = ~~this.pos.y + ig.game.screen.y;
      var radgrad = this.spawner.effectCtx.createRadialGradient( x + halfSize*ig.system.scale, y + halfSize*ig.system.scale, this.size.x*ig.system.scale, x + halfSize*ig.system.scale, y + halfSize*ig.system.scale, halfSize*ig.system.scale);
      radgrad.addColorStop( 0, this.drawColour);
      this.spawner.effectCtx.fillStyle = radgrad;
      this.spawner.effectCtx.fillRect(x * ig.system.scale, y * ig.system.scale, this.size.x * ig.system.scale, this.size.x * ig.system.scale);
    },

    kill: function() {
      ig.game.removeEntity(this);
    }
  };
});
