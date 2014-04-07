ig.module( 
	'game.main' 
  )
.requires(
  'impact.game',
	// 'impact.debug.debug',
	'impact.font',
  'plugins.joncom.font-sugar.font',
  'plugins.screenshaker',
  'game.entities.missile',
  'game.entities.supa-missile',
  'game.entities.cylon-missile',
  'game.entities.cylon-assassin',
  'game.entities.cylon-destroyer',
  'game.entities.cylon-boss',
  'game.entities.explosion',
  'game.entities.radar',
  'game.entities.command-center',
  'game.entities.canon',
	'game.entities.particle-emitter'
  )
.defines(function(){

  MyGame = ig.Game.extend({

  	// Load a font
    titleFontBold: new ig.Font( '/media/pixel_arial_bold_16.png', { fontColor: "#00ff66" } ),
    font: new ig.Font( '/media/pixel_arial_11.png', { fontColor: "#00ff66" } ),
    smallFont: new ig.Font( '/media/pixel_arial_8.png', { fontColor: "#00ff66" } ),
    smallFontWhite: new ig.Font( '/media/pixel_arial_8.png'),
    creditFont: new ig.Font( '/media/04b03.font.png'),
    // Not used, but avoids Firefox loading bug with Font Sugar
    titleFontBoldWhite: new ig.Font( '/media/pixel_arial_bold_16.png', { fontColor: "#FFF" }),
    smallFontRed: new ig.Font( '/media/pixel_arial_8.png', { fontColor: "#F00" } ),
    smallFontYellow: new ig.Font( '/media/pixel_arial_8.png', { fontColor: "#FF0" } ),
    creditFontYellow: new ig.Font( '/media/04b03.font.png', { fontColor: "#FF0" } ),
  	
    // Our ship hull thickness
    lives: 2,

    // How fast ennemies attack
    cylonTimer: null,
    cylonEnemyWaves:   [
                          1, 2, 2, 3, 3,
                          4, 5, 6, 7, 8,
                          8, 9, 9, 9, 10, 
                          10, 11, 12, 14, 15
                        ],
    cylonTimerValues:   [
                          1.5, 2, 2.1, 2.3, 2.5, 
                          2.5, 2.4, 2.2, 2.1, 2,
                          1.8, 1.7, 1.7, 1.6, 1.5, 
                          1.4, 1.4, 1.5, 1.6, 1.7
                        ],
    cylonDestroyerOdds: [
                          0.2, 0.19, 0.17, 0.16, 0.17, 
                          0.2, 0.21, 0.22, 0.23, 0.24, 
                          0.35, 0.36, 0.37, 0.38, 0.39, 
                          0.4, 0.4, 0.4, 0.4, 0.4
                        ],
    circlerCylonDestroyerOdds: [
                          0, 0, 0, 0, 0, 
                          0.12, 0.15, 0.18, 0.21, 0.24, 
                          0.35, 0.36, 0.37, 0.38, 0.39, 
                          0.4, 0.4, 0.4, 0.4, 0.4
                        ],
    cylonMissileOdds:   [
                          0.95, 0.95, 0.93, 0.83, 0.84, 
                          0.85, 0.86, 0.87, 0.88, 0.89, 
                          0.9, 0.91, 0.92, 0.93, 0.94, 
                          0.95, 0.95, 0.95, 0.95, 0.95
                        ],
    cylonAssassinOdds:   [
                          0, 0, 0, 0, 0, 
                          0, 0, 0, 0, 0, 
                          0.2, 0.21, 0.22, 0.23, 0.24, 
                          0.24, 0.24, 0.24, 0.24, 0.24
                        ],
    _spawnedBoss: false,
    _killedBoss: false,
    level: 0,

    // So we can do whatever we want in draw()
    clearColor: null,
    // Dark green
    customClearColor: "#001c00",

    // Score
    score: 0,

    // Where Michael Bay makes his magic happen
    effectCanvas: null,

    // We pseudo animate our background ourselves
    backgroundStars:    new ig.Image('/media/WAITINGGAME_BCKGRND_stars_320X1200.png'),
    backgroundTerminal: new ig.Image('/media/WAITINGGAME_BCKGRND_interferences2_320X1200.png'),
    admiral: new ig.AnimationSheet('/media/entities/WAITINGGAME_admiral.png', 96, 216),
    admiralAnim: null,
    colonel: new ig.AnimationSheet('/media/entities/WAITINGGAME_colonel.png', 310, 37),
    coloneAnim: null,
    sendButton: new ig.Image('/media/send-button.png'),
    starsY: 960,
    starsVel: -5,
    terminalFlicker: new ig.Timer(0.15),
    terminalY: 0,

    mcLogo: new ig.Image('/media/WAITINGGAME_LOGO.png'),

    // Timer to display colonel messages
    _colonelTimer: null,
    _colonelMessage: null,

    // Timing to display messages
    // Check if we said a nice message at half level
    _halfObjective: false,
    _fullObjective: false,
    _bossWarning: false,
    _firstDestroyer: true,
    _firstCircler: true,
    _firstAssassin: true,

    _randomMessages: [
      "New enemy signature detected Commander.",
      "Commander, new enemies on the radar!",
      "Commander, we should be extra careful.",
      "Keep it up Commander, you can do it!",
      "For queen and country, Commander.",
      "The galaxy needs you Commander.",
      "Earth needs you Commander.",
      "I wish we had bacon for breakfast.",
      "Let's show them what Mankind is up to!",
      "Holy crucial moment, Commander!",
      "Let's show them what we got Commander!",
      "Commander, the toilets have been hit!",
      "Commander, what a fiesta last night!",
      "Harder, Better, Faster, Stronger.",
      "I don't want all that anymore.",
      "Mankind will never surrender!",
      "Click here if you want to make 50K.",
      "Click here to date mature women near you.",
      "They shall not pass!",
      "Commander, it's a trap!",
      "To infinity... and beyond!",
      "Where we go, we don't need roads!",
      "Use the force Commander!",
      "Commander, Red-5 are going in!",
      "The galaxy is like a chocolate box.",
      "I love chocolate.",
      "Those Stark missiles are totally worth it.",
      "Commander, we're OVER NINE THOUSANDS!",
      "Do forget to beam me up tonight!",
      "Hope we live long and prosper Commander.",
      "Alrighty then!",
      "Missile power on 11 Commander.",
      "I know kung fu.",
      "Commander, we have a problem.",
      "Why so serious Commander?",
      "I’m sorry, Commander. I’m afraid I can’t do that.",
      "With great power... Commander.",
      "Try not. Do, or do not. There is no try Commander.",
      "These aren’t the humans you’re looking for.",
      "All their bases are captured.",
      "Mathematical!",
      "This is Sparta!!!",
      "Holy here we go again, Commander!"  
    ],

    // Current game state:
    // 0 not started > start screen
    // 1 started > under attack!
    // 2 dead > game over screen
    // 3 WON > sector won, fill name screen
    // 4 WON > congrats bf startscreen
    _state: 0,

    // Timer to animate a bit text screens
    _menuTimer: null,
    _blinkingTimer: null,
    screenShaker: null,

    // Sound
    sounds: {
      lifeLost: new ig.Sound( '/media/sound/ExplosionScreen.*' ),
      destroyerExplosion: new ig.Sound( '/media/sound/BossExplode.*' ),
      cylonMissileExplosion: new ig.Sound( '/media/sound/EnemyExplode.*' ),
      supaMissile: new ig.Sound( '/media/sound/MissileLaunch.*' ), 
      missile: new ig.Sound( '/media/sound/Laser.*' )
    },

  	init: function() {
      // Get random sector
      this.getNewSector();

      // The enemy attack plan
      this.cylonTimer = new ig.Timer(this.cylonTimerValues[this.level]);

      // Our vessel command panel
      this.htmlPanel = document.getElementById("panel");
      this.htmlTextarea = $("#playerName");

      // Create a new dimension for effects
      ig.system.effectCanvas = this.effectCanvas = ig.$new('canvas');
      this.effectCanvas.width = ig.system.canvas.width;
      this.effectCanvas.height = ig.system.canvas.height;
      ig.system.effectContext = this.effectCanvas.getContext('2d');

  		// Bind keys
      ig.input.bind(ig.KEY.MOUSE1, 'leftClick');
      ig.input.bind(ig.KEY.CTRL, 'control');
      ig.input.initMouse()

      // Our displayed base
      this.commandCenter = ig.game.spawnEntity(EntityCommandCenter, 0, ig.system.height - 6);
      
      // Our cool admiral
      this.admiralAnim = new ig.Animation(this.admiral, 0.3, [0, 1]);
      // And our lovely colonel
      this.colonelAnim = new ig.Animation(this.colonel, 0.3, [0, 1, 2]);
      this.colonelAnim.alpha = 0.7;

      // Our mighty canon
      cX = (ig.system.width >> 1) - 10;
      cY = ig.system.height - 21;
      this.canon = ig.game.spawnEntity(EntityCanon, cX, cY);

      // Our new 2000 improved radar display
      ig.game.spawnEntity(EntityRadar, 0, 0);

      // And... some space atmosphere.
      ig.music.add('/media/sound/music/Menu.*', 'menu');
      ig.music.add('/media/sound/music/3UP.*', '3up');
      ig.music.add('/media/sound/music/2UP.*', '2up');
      ig.music.add('/media/sound/music/1UP.*', '1up');
      ig.music.add('/media/sound/music/GameOver.*', 'gameover');
      ig.music.add('/media/sound/music/FinalBoss.*', 'boss');
      ig.music.loop = true;
      ig.music.play('menu');

      this._menuTimer = new ig.Timer(0);
      this.screenShaker = new ScreenShaker();
    },

    update: function() {
  		// Update all entities and backgroundMaps
  		this.parent();

      // Start screen
      if (this._state === 0) {
        // Click and play
        if (ig.input.released("control")) {
          this._state = 1;
          ig.music.play('3up');
        }
      } else if (this._state === 1) {
        // Playin'
        this.manageLevel();

        // Spawn the BOSS when we meet the objective
        if (this.score > this.sector.objective && !this._spawnedBoss) {
        //if (!this._spawnedBoss) {
          ig.game.spawnEntity(EntityCylonBoss, (ig.system.width >> 1) - 25, -90);
          ig.music.play('boss');
          this._spawnedBoss = true;
        }

        // Display message to hearten player
        if (!this._halfObjective && this.score > (this.sector.objective >> 1)) {
          this._colonelMessage = "Keep up Commander, you're halfway!";
          this._halfObjective = true;
        }

        // Boss warning
        if (!this._bossWarning && this.score > this.sector.objective) {
          this._colonelMessage = "Holy Final Boss Man, Commander!";
          this._bossWarning = true;
        }

        // GG player
        if (!this._fullObjective && this.score > this.sector.objective && this._killedBoss) {
          this._colonelMessage = "You've done it Commander!!!";
          this._fullObjective = true;
        }
        
    		// Spawn our missile
    		if (ig.input.released("leftClick")) {
          this.sounds.missile.play();
    			this.canon.fire(ig.input.mouse.x, ig.input.mouse.y);
        }

        // Enemy spawn cycle
        if (this.cylonTimer.delta() > 0) {
          // Enemy missiles?
          this.spawnEnemyMissiles(this.cylonEnemyWaves[this.level] - 1);
          // Should we spawn a bad bad destroyer?
          this.spawnDestroyer();
          // Reset spawn cycle
          this.cylonTimer.reset(this.cylonTimerValues[this.level]);
        }

        // Say something
        if (!this._colonelMessage && Math.random() > 0.999)
          this._colonelMessage = this._randomMessages.random();

      } else if (this._state === 2) { 
        // Game over, show score
        // and pray to evacuate before the last wave!
        if (this.score > this.sector.objective && this._killedBoss) {
          // Game over, we won, let's celebrate!
          if (this.cylonTimer.delta() > 0) {
            for (var i = 10; i >= 0; i--)
              ig.game.spawnEntity(EntityParticleEmitter, ((ig.system.width - 140) * Math.random()) + 70, 60);
            this.cylonTimer.reset(this.cylonTimerValues[this.level]);
          }
        } else {
          if (this.cylonTimer.delta() > 0) {
            this.spawnEnemyMissiles(10);
            this.cylonTimer.reset(this.cylonTimerValues[this.level]);
          }
        }
        
        // Click and back to start screen or transmission screen
        if (ig.input.released("control")) {
          if (this.score > this.sector.objective && this._killedBoss && this.score > this.sector.highscore) {
            this.wonGame();
          } else {
            this.startGame();
            this._menuTimer = new ig.Timer(0);
          }
        }
      } else if (this._state === 3) { 
        // Game over, we won, let's celebrate!
        if (this.cylonTimer.delta() > 0) {
          for (var i = 10; i >= 0; i--)
            ig.game.spawnEntity(EntityParticleEmitter, ((ig.system.width - 140) * Math.random()) + 70, 60);
          this.cylonTimer.reset(this.cylonTimerValues[this.level]);
        }
        // Click and back to start screen or transmission screen
        if (ig.input.released("leftClick")) {
          if (!this.sendButtonPressed)
            if (ig.input.mouse.x > 270 && ig.input.mouse.y > 190 &&
              ig.input.mouse.x < 270 + 47 && ig.input.mouse.y < 190 + 23)
              this.sectorWon();
        }
        this.admiralAnim.update();
      } else {
        if (ig.input.released("control")) {
          this.startGame();
          this._menuTimer = new ig.Timer(0);
        }
        this.admiralAnim.update();
      }

      // Update our background
      this.starsY = this.starsY + this.starsVel * ig.system.tick;
      if (this.starsY < 0) {
        this.starsY = 960;
      }
      if (this.terminalFlicker.delta() > 0) {
        var rdmSourceY = (Math.random() * 960) >> 0;
        var mod = rdmSourceY % 8;
        this.terminalY = mod ? rdmSourceY + (8 - mod) : rdmSourceY;
        this.terminalFlicker.reset();
      }
      this.screenShaker.update();
  	},
  	
  	draw: function() {
      // Clear ourselves
      ig.system.clear(this.customClearColor);
      // Will always clear the right space
      ig.system.effectContext.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);
      // Display our stars
      this.backgroundStars.draw(0, 0, 0, this.starsY, ig.system.width, ig.system.height)
  		// Draw all entities and backgroundMaps
      if (this._state === 0) {
        this.drawStartScreen();
      } else if (this._state === 1) {
  		  this.parent();
        this.font.draw(this.score, 10, ig.system.height - 14);
      } else if (this._state === 2) {
        this.parent();
        this.drawScoreScreen();
      } else if (this._state === 3) {
        this.parent();
        this.drawTransmissionScreen();
      } else if (this._state === 4) {
        this.parent();
        this.drawCongratsScreen();
      }
      if (this._colonelMessage)
        this.displayMessage();

      // And our terminal
      this.backgroundTerminal.draw(0, 0, 0, this.terminalY, ig.system.width, ig.system.height)
  	},

    displayMessage: function() {
      this._colonelTimer = this._colonelTimer || new ig.Timer(3);
      if (this._colonelTimer.delta() < 0) {
        this.colonelAnim.draw(5, 5);
        this.smallFontWhite.alpha = 0.7;
        this.smallFontWhite.draw(this._colonelMessage, 48, 10);
        this.smallFontWhite.alpha = 1;
        this.colonelAnim.update();
      } else {
        this._colonelTimer = null;
        this._colonelMessage = null;
      }
    },

    removeLife: function() {
      if (this.lives > 0) {
        // remove life
        this.lives -= 1;
        // update command center visual
        this.commandCenter.currentAnim = this.commandCenter.anims[this.commandCenter.livesToAnim[this.lives]];
        this.sounds.lifeLost.play();
        switch(this.lives){
          case 1: this.htmlPanel.className = 'hit1'; ig.music.stop(); ig.music.play('2up'); break;
          case 0: this.htmlPanel.className = 'hit2'; ig.music.stop(); ig.music.play('1up'); break;
        }
      } else {
        // everybody to the rescue pods!
        if (this._state < 2 ) {
          this.sounds.lifeLost.play();
          ig.game.gameOver();
        }
      }
    },

    gameOver: function() {
      this._state = 2;
      ig.music.play('gameover');
      this._menuTimer.reset();
    },

    wonGame: function() {
      this._state = 3;
      this.htmlTextarea.show();
      ig.music.play('menu');
    },

    startGame: function() {
      // Button pressed
      this.htmlTextarea.val("");
      this.sendButtonPressed = false;
      // Hide name textarea
      this.htmlTextarea.hide();
      // Get random sector
      this.getNewSector();
      // Kill everything
      var m = ig.game.getEntitiesByType(EntityCylonMissile);
      for (var i = m.length - 1; i >= 0; i--) {
        m[i].kill();
      };
      var m = ig.game.getEntitiesByType(EntityCylonDestroyer);
      for (var i = m.length - 1; i >= 0; i--) {
        m[i].kill();
      };
      var m = ig.game.getEntitiesByType(EntityMissile);
      for (var i = m.length - 1; i >= 0; i--) {
        m[i].kill();
      };
      var m = ig.game.getEntitiesByType(EntityCylonAssassin);
      for (var i = m.length - 1; i >= 0; i--) {
        m[i].kill();
      };
      var m = ig.game.getEntitiesByType(EntityCylonBoss);
      for (var i = m.length - 1; i >= 0; i--) {
        m[i].kill();
      };

      this._state = 0;
      this.score = 0;
      this.lives = 2;
      this.level = 0;
      this._spawnedBoss = false;
      this._killedBoss = false;
      this._halfObjective = false;
      this.htmlPanel.className = 'hit0';

      this._halfObjective = false;
      this._fullObjective = false;
      this._bossWarning = false;
      this._firstDestroyer = true;
      this._firstCircler = true;
      this._firstAssassin = true;

      ig.music.play('menu');
      // update command center visual
      this.commandCenter.currentAnim = this.commandCenter.anims[this.commandCenter.livesToAnim[this.lives]];
    },

    congratsPlayer: function(sector) {
      this.sector = sector;
      this.htmlTextarea.hide();
      this._state = 4;
    },

    manageLevel: function(level) {
      var level = ~~(this.score/150);
      level = level > this.cylonMissileOdds.length-1 ? this.cylonMissileOdds.length-1 : level
      level = level < 0 ? 0 : level
      // Despite our score, never go back with the difficulty
      if (level > this.level)
        this.level = level
    },

    spawnEnemyMissiles: function(number) {
      // Maybe spawn assassins?
      // Aside from Game Over screen
      if (this._state == 1)
        // 3 times less chances to spawn enemies when the boss is here
        var r = this._spawnedBoss ? 5 * Math.random() : Math.random();
        if (Math.random() <= this.cylonAssassinOdds[this.level]) {
          // Display message to help player
          if (this._firstAssassin) {
            this._colonelMessage = "Warning, assassins are super fast!";
            this._firstAssassin = false;
          }
          var rdmX = ((ig.system.width - 40) * Math.random()) + 20;
          var rdmGoalX = ig.system.width * Math.random();
          ig.game.spawnEntity(EntityCylonAssassin, rdmX, 0, {
            goal: {
              x: rdmGoalX,
              y: ig.system.height
            }
          });
        }

      for (var i = number; i >= 0; i--) {
        var randomMissile = this._spawnedBoss ? 5 * Math.random() : Math.random();
        if (randomMissile <= this.cylonMissileOdds[this.level]) {
          var rdmX = ((ig.system.width - 40) * Math.random()) + 20;
          var rdmGoalX = ig.system.width * Math.random();
          ig.game.spawnEntity(EntityCylonMissile, rdmX, 0, {
            goal: {
              x: rdmGoalX,
              y: ig.system.height
            }
          });
        }
      };
    },

    spawnDestroyer: function () {
      var randomDeath = this._spawnedBoss ? 5 * Math.random() : Math.random();
      if (randomDeath <= this.cylonDestroyerOdds[this.level]) {
        var destX = ((ig.system.width - 60) * Math.random()) + 30;
        if (Math.random() <= this.circlerCylonDestroyerOdds[this.level]) {
          ig.game.spawnEntity(EntityCylonDestroyer, destX, 60, { circler: true });
          // Display message to help player
          if (this._firstCircler) {
            this._colonelMessage = "Some destoyers have mutated, pay attention!";
            this._firstCircler = false;
          }
        }
        else {
          ig.game.spawnEntity(EntityCylonDestroyer, destX, 60);
          // Display message to help player
          if (this._firstDestroyer) {
            this._colonelMessage = "Attention Commander, those are kamikazes!";
            this._firstDestroyer = false;
          }
        }
      }
    },

    setSector: function(sector) {
      this.sector = sector;
    },

    // Get a sector
    // Fixed, random, from a DB, it's up to you :)
    getNewSector: function() {
      this.setSector({
        // Displayed name
        "name":"OSS-Opensource",
        // Position on the universe map
        "x": 284,
        "y": 514,
        // The sector score objective
        "objective": 2000
      });
    },

    sectorWon: function() {
      this.sendButtonPressed = true;
      this.congratsPlayer({
        "name":"OSS-Opensource",
        "x": 284,
        "y": 514,
        "objective": 2000,
        "highscore": 2001,
        "player_name": "r0xx0r"
      });
    },

    drawStartScreen: function() {
      this.mcLogo.draw(0, 10);
      
      this.smallFont.draw("sector: ...", 40, 70);
      if(this._menuTimer.delta() > 1)
        if (this.sector)
          this.smallFont.draw("[#FF0 " + this.sector.name + "]", 190, 70);
        else
          this.smallFont.draw("[#FF0 undefined]", 190, 70);

      this.smallFont.draw("objective: ...", 40, 90);
      if(this._menuTimer.delta() > 1)
        if (this.sector)
          this.smallFont.draw("[#F00 " + this.sector.objective + "]", 190, 90);
        else
          this.smallFont.draw("[#FF0 undefined]", 190, 90);

      this.smallFont.draw("enemy contact: ...", 40, 110);
      if(this._menuTimer.delta() > 1)
        this.smallFont.draw("[#FF0 detected]", 190, 110);
      
      if(this._menuTimer.delta() > 1.5)
        this.smallFont.draw("enemy status: ...", 40, 130);
      if(this._menuTimer.delta() > 2.5)
        this.smallFont.draw("[#F00 aggressive]", 190, 130);

      if(this._menuTimer.delta() > 3 && !this._blinkingTimer)
        this._blinkingTimer = new ig.Timer(1.4);

      if(this._menuTimer.delta() > 3)
        if(this._blinkingTimer.delta() < -0.7)
          this.smallFont.draw("###### DEFCON [#F00 8] mode [#FF0 engaged] ######", 40, 150);

      if(this._menuTimer.delta() > 4)
        this.smallFont.draw("weapons status: ...", 40, 170);
      if(this._menuTimer.delta() > 5)
        this.smallFont.draw("[#F00 ready to blast]", 190, 170);        

      if(this._menuTimer.delta() > 6)
        if(this._blinkingTimer.delta() < -0.7)
          this.titleFontBold.draw("- press [#FFF ctrl] to start -", ig.system.width >> 1, 196, ig.Font.ALIGN.CENTER);

      if (this._blinkingTimer && this._blinkingTimer.delta() > 0)
        this._blinkingTimer.reset();

      this.creditFont.draw("Pixels: [#FF0 @christianung] | Sound: [#FF0 @matias_lizana] | Code: [#FF0 @heyhumansgames]", 160, 230, ig.Font.ALIGN.CENTER);      
    },

    drawScoreScreen: function() {
      ig.system.context.beginPath();
      ig.system.context.fillStyle = 'rgba(0,0,0,0.4)';
      ig.system.context.fillRect(0, 0, ig.system.realWidth, ig.system.realHeight);
      ig.system.context.fill();
      ig.system.context.closePath();

      this.smallFont.draw("enemy scored: ...", 40, 70);
      if(this._menuTimer.delta() > 1)
        this.smallFont.draw("[#FF0 " + this.score + "]", 190, 70);
      
      if(this._menuTimer.delta() > 3)
        this.smallFont.draw("hull breach: ...", 40, 90);
      if(this._menuTimer.delta() > 4)
        if (this.score >= this.sector.objective && this._killedBoss)
          this.smallFont.draw("satisfying", 190, 90);
        else
          this.smallFont.draw("[#F00 global]", 190, 90);
      
      if(this._menuTimer.delta() > 5)
        this.smallFont.draw("sector: ...", 40, 110);
      if(this._menuTimer.delta() > 6)
        if (this.score >= this.sector.objective && this._killedBoss)
          this.smallFont.draw("ACQUIRED", 190, 110);
        else
          this.smallFont.draw("[#F00 lost]", 190, 110);


      if(this._menuTimer.delta() > 7 && !this._blinkingTimer)
        this._blinkingTimer = new ig.Timer(1.4);

      if(this._menuTimer.delta() > 7)
        if(this._blinkingTimer.delta() < -0.7)
          if (this.score >= this.sector.objective && this._killedBoss)
            this.smallFont.draw("#### [#FF0 Incoming transmission] from [#FF0 Earth] ####", 40, 130);
          else
            this.smallFont.draw("#### [#FF0 Safety pods] launch seq. [#FF0 engaged] ####", 40, 130);

      if(this._menuTimer.delta() > 8)
        this.smallFont.draw("system: ...", 40, 150);
      if(this._menuTimer.delta() > 9)
        if (this.score >= this.sector.objective && this._killedBoss)
          this.smallFont.draw("[#F00 calculating beers]", 190, 150);
        else
          this.smallFont.draw("[#F00 shut down]", 190, 150);

      if(this._menuTimer.delta() > 7)
        if(this._blinkingTimer.delta() < -0.7)
          if (this.score >= this.sector.objective && this._killedBoss)
            this.titleFontBold.draw("- [#FFF ctrl] start transmission -", ig.system.width >> 1, 196, ig.Font.ALIGN.CENTER);
          else
            this.titleFontBold.draw("- [#FFF ctrl] to abandon ship -", ig.system.width >> 1, 196, ig.Font.ALIGN.CENTER);

      if (this._blinkingTimer && this._blinkingTimer.delta() > 0)
        this._blinkingTimer.reset();
    },

    drawTransmissionScreen: function() {
      this.admiralAnim.draw(10, 10);

      this.sendButton.draw(270, 190);
      if (this._blinkingTimer && this._blinkingTimer.delta() < -0.7)
        this.smallFont.draw("[#FF0 Send]", 270 +  24, 190 + 6, ig.Font.ALIGN.CENTER);      
      else
        this.smallFont.draw("Send", 270 +  24, 190 + 6, ig.Font.ALIGN.CENTER);      

      this.smallFont.draw("Commander,", 120, 30);
    
      this.smallFont.draw("[#FF0 Congratulations] from all [#FF0 Earth]", 120, 50);
      this.smallFont.draw("headquarters. The war is not", 120, 70);
      this.smallFont.draw("over but you bring [#FF0 hope] to the", 120, 90);
      this.smallFont.draw("galaxy.", 120, 110);
      this.smallFont.draw("As a [#FF0 reward] for your service", 120, 130);
      this.smallFont.draw("please rename sector [#FF0 " + this.sector.name + "]:", 120, 150);

      if (this._blinkingTimer && this._blinkingTimer.delta() > 0)
        this._blinkingTimer.reset(1.4);
    },

    drawCongratsScreen: function() {
      this.admiralAnim.draw(10, 10);     

      this.smallFont.draw("Congratulations Commander,", 120, 30);
      this.smallFont.draw("[#FF0 " + this.sector.name + "] will now be called", 120, 50);
      this.smallFont.draw("[#FF0 " + this.sector.player_name + "]", 120, 70);
      this.smallFont.draw("That way [#FF0 Earth] will remember", 120, 90);
      this.smallFont.draw("your courage.", 120, 110);
      this.smallFont.draw("Thank you, Commander.", 120, 130);
      this.smallFont.draw("You may now proceed to your", 120, 150);
      this.smallFont.draw("next sector.", 120, 170);

      if(this._blinkingTimer.delta() < -0.7)
        this.titleFontBold.draw("- [#FFF ctrl] to start -", 125, 196);

      if (this._blinkingTimer && this._blinkingTimer.delta() > 0)
        this._blinkingTimer.reset(1.4);
    }

  });

  // Start the Game with 60fps, a resolution of 320x240, scaled
  // up by a factor of 2
  ig.Sound.enabled = true;
  ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});
