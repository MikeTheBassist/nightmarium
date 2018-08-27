/**
 * Code by Michael Langley
 * With special thanks to No Tears Guide to HTML Games
 * https://www.html5rocks.com/en/tutorials/canvas/notearsgame/
 * which helped me figure out canvas element manipulation
 * after I wasted a day trying to make a game with HTML elements...
 * 
 * The following code is not complete, this is an ongoing project that I've used as an opportunity to get more familiar
 * with Javascript and JQuery.  The first 700 lines or so were created as the final project for a JavaScript class
 * I took while pursuing an App Dev degree.
 * 
 * Thanks Wendy!
 * 
 * All artwork is copyright Michael Langley 2018
 */


$(document).ready(function () {

  //Canvas height and width should not change, use CAPITALS to INDICATE IMPORTANCE
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 800;
  //Store an array of appropriate hex color values to act as randomly generated background colors
  const backgroundColors = ["#385789", "#526584", "#375b3b", "#14471a", "#4c4a30",
  "#54534e","#4b374f","#441823","#282828","#424434"];


  // set up key bindings to ACSII values representing WASD and arrow keys, allow for change through options later
  const upMoveKey = 87;
  const downMoveKey = 83;
  const leftMoveKey = 65;
  const rightMoveKey = 68;
  const upShootKey = 38;
  const downShootKey = 40;
  const leftShootKey = 37;
  const rightShootKey = 39;
  const pauseKey = 32;

  //create canvas element using height and width
  const canvasElement = $("<canvas width='" + CANVAS_WIDTH +
    "' height='" + CANVAS_HEIGHT + "'></canvas>");
  //get context of new canvas element
  const canvas = canvasElement.get(0).getContext("2d");

  //place new canvas element in body
  canvasElement.appendTo('#gameBox');

  /**
   * UTILITY FUNCTIONS
   */
  //function found on Mozilla tutorial site for generating ints easily
  function getRandomInt(max) {
    return Math.round(Math.random() * Math.floor(max));
  }

  //helper function to make a two dimentional array that takes a number and the dimentions of the array
  function createArray(num, dimensions) {
    let array = [];
    for (let i = 0; i < dimensions; i++) {
      array.push([]);
      for (let j = 0; j < dimensions; j++) {
        array[i].push(num);
      }
    }
    return array;
  }


  /**
   * OBJECT CONSTRUCTORS W/ METHODS
   * AND SPRITE INITIALIZATION
   */
  /**
   * The player sprite and door sprite will not be changing, so just initialize them now
   * and forever hold your peace
   */
  playerSprite = new Image();
  playerSprite.src = "game2sprites/player.png";
  doorSprite = new Image();
  doorSprite.src = "game2sprites/door.png";

  exp = 0;
  spawnerCount = 4;
  // create a player object with height, width and position
  //functions: draw, shoot, midpoint, inBounds, placePlayer, upgrade purchasing functions
  player = {
    //color: "#00A",  // no longer used after sprite creation
    prevX: 0,
    prevY: 0,
    yVelocity: 0,
    xVelocity: 0,
    lastx: 0,
    lasty: 0,
    x: 220,
    y: 270,
    hMove: 0,
    vMove: 0,
    speed: 40,
    width: 40,
    height: 40,
    health: 10,
    maxHealth: 10,
    maxBullets: 4,
    level: 1,
    update: function () {
      //Store the previous location of the player so that if a move isn't valid, player can be moved back
      this.prevX = this.x;
      this.prevY = this.y;

      this.xVelocity = this.hMove * this.speed;
      this.yVelocity = this.vMove * this.speed;

      this.x += this.xVelocity;
      this.y += this.yVelocity;

      //if you attempt to move out of bounds, you will be placed back at your previous position,
      //effectively keeping you in bounds
      if (!(this.inBounds())) {
        this.x = this.prevX;
        this.y = this.prevY;
        console.log("moved back into bounds");
      }
      if (collides(this, door)) {
        nextLevel();
      }
      // this.prevX -= this.xVelocity;
      // this.prevY -= this.yVelocity;

      //stop moving player
      this.xVelocity = 0;
      this.yVelocity = 0;
      this.vMove = 0;
      this.hMove = 0;

    },
    /**
     * The draw function will render the player on the canvas objects based on current position
     */
    draw: function () {

      canvas.drawImage(playerSprite, this.x, this.y, this.width, this.height);
      //canvas.fillRect(this.x,this.y,this.width,this.height);
    },

    //The shoot function creates a new Bullet object and places it in the playerBullets array
    //the direction of the bullet created is based on the directional arrow key pressed
    shoot: function () {

      // start position: player midpoint
      let bulletPosition = this.midpoint();
      let random = Math.round(Math.random()*100);
      console.log(random);

if(playerBullets.length < this.maxBullets){
      //push a new bullet into the playerBullets array based on the direction key pressed



      if (random < piercingUpgrade ) {
        playerBullets.push(Bullet({
          speed: bulletSpeed,
          x: bulletPosition.x,
          y: bulletPosition.y,
          piercing: true,
          bursting: false,
          shotDamage: 1
        }));
        console.log("shooting piercing round");

      }else if(random < burstingUpgrade+piercingUpgrade && random >= piercingUpgrade){
        playerBullets.push(Bullet({
          speed: bulletSpeed,
          x: bulletPosition.x,
          y: bulletPosition.y,
          piercing: false,
          bursting: true,
          shotDamage: 1
        }));
        console.log("shooting bursting round");
      }
      else if(random > burstingUpgrade+piercingUpgrade){
        playerBullets.push(Bullet({
          speed: bulletSpeed,
          x: bulletPosition.x,
          y: bulletPosition.y,
          piercing: false,
          bursting: false,
          shotDamage: 1
        }));
        console.log("shooting normal round");

      }
    }

    },
    // midpoint gets the midpoint of the player object
    midpoint: function () {
      return {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2
      }
    },
    /**
     * placePlayer will set the player's position at the given X, Y coordinates
     * and log the movement in the console
     */
    placePlayer: function (placeX, placeY) {
      this.x = placeX;
      this.y = placeY;
      console.log("player placed at x: " + this.x + " y: " + this.y);
    },
    /**
     * explode destroys the player and restarts the level
     */
    explode: function () {
    //destroy the player object, restart the game
      this.active = false;
      restart();

    },
    inBounds: function () {
      //determine if the player's current coordinates are outside the bounds of the canvas
      return this.x >= 0 && this.x <= CANVAS_WIDTH - player.width &&
        this.y >= 0 && this.y <= CANVAS_HEIGHT - player.height;
    },

    //buyGunUpgrade is used to upgrade the maxBullets stat which determines how many bullets can be on the screen at once
    buyGunUpgrade: function(){
      if(exp >= upgradeCost){
        exp -=upgradeCost;
        upgradeCost = Math.round(Math.pow(upgradeCost, 1.11));
        this.maxBullets++;
       this.maxHealth++;
        this.health = this.maxHealth;
      
        //console.log("max bullet limit upgraded to "+this.maxBullets);
        this.level++;
        return true;
      } 
      return false;
    },

    //buyHealthUpgrade is used to upgrade the maxHealth stat by 2
    buyHealthUpgrade: function(){
      if(exp >= upgradeCost){
        exp -=upgradeCost;
        upgradeCost = Math.round(Math.pow(upgradeCost, 1.11));
        this.maxHealth+=3;
        this.health = this.maxHealth;
        this.level++;
        //console.log("max health limit upgraded to "+this.maxHealth);
        return true;
      }
      return false;
    },

    buyPiercingUpgrade: function(){
      if(exp >= upgradeCost && this.level >= 5){
        exp -=upgradeCost;
        upgradeCost = Math.round(Math.pow(upgradeCost, 1.11));
        piercingUpgrade += 3;
        this.maxHealth++;
        this.health = this.maxHealth;
        //console.log("shots now have a chance to pierce targets");
        this.level++;
        return true;
      }
      return false;},

      buyBurstingUpgrade: function(){
        if(exp >= upgradeCost && this.level >= 5){
          exp -=upgradeCost;
          upgradeCost = Math.pow(upgradeCost, 1.11).toFixed(0);
          burstingUpgrade += 3;
          this.maxHealth++;
          this.health = this.maxHealth;
          //console.log("shots now have a chance to pierce targets");
          this.level++;
          return true;
        }
        return false;}
  };



  //create array to hold all active bullets
  playerBullets = [];

  var shotVelocityX = 0;
  var shotVelocityY = 0;
  var shotSize = 10;
  var shotColor = "red";
  var bulletSpeed = 6;
  var piercingUpgrade = 0;
  var burstingUpgrade = 0;

  // bullet object is spawned at the player origin 
  function Bullet(I) {
    //speed is passed in at construction along with positionx and positiony
    I.active = true;
    //use shotVelocity variables to determine bullet velocity at construction
    I.xVelocity = shotVelocityX * I.speed;
    I.yVelocity = shotVelocityY * I.speed;
    I.width = shotSize;
    I.height = shotSize;
    I.color = shotColor;
    I.shotDamage;
    I.piercing;
    I.bursting;
    I.blast = false;

    I.inBounds = function () {
      return I.x >= 0 && I.x <= CANVAS_WIDTH &&
        I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };

    I.draw = function () {
      canvas.fillStyle = this.color;
      canvas.fillRect(this.x, this.y, this.width, this.height);
    };

    I.update = function () {
      I.x += I.xVelocity;
      I.y += I.yVelocity;
      I.active = I.active && I.inBounds();
    };

    return I;
  }

  function BlastArea(I){

    I.active = true;
    I.width = 60;
    I.height = 60;
    I.color = "black";
    I.blastDamage = 2;
    I.age = 0;
    I.blast = true;

    I.inBounds = function () {
      return I.x >= 0 && I.x <= CANVAS_WIDTH &&
        I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };

    I.draw = function () {
      canvas.fillStyle = this.color;
      canvas.fillRect(this.x, this.y, this.width, this.height);
    };

    I.update = function () {
      
      I.age++;
      if(I.age > 15){
        I.color = "gray";
        
      }
      if (I.age > 30){
        I.active = false;
      }

      I.active = I.active && I.inBounds();

    };

    return I;
  }

  //create array to hold active enemy spawners
  spawners = [];

  /**
   * The spawner object is a stationary enemy spawner.  It will continue spawning enemies forever
   * @param {*} I 
   */
  function Spawner(I) {
    I = I || {};
    I.hp = 10;
    I.active = true;
    I.width = 40;
    I.height = 40;
    I.color = "#FFFFFF";

    I.spawn = function () {
      if (Math.random() < 0.025) {
        enemies.push(Enemy({
          x: this.x,
          y: this.y
        }));
      }
    };

    I.draw = function () {
      canvas.fillStyle = this.color;
      canvas.fillRect(this.x, this.y, this.width, this.height);
    };

    I.update = function () {
      I.x += I.xVelocity;
      I.y += I.yVelocity;
      I.age++;
      I.active = I.active && I.inBounds();
    };
    return I;
  }

  pickups = [];

  //health pickups have a healthValue randomly assigned to them and are sized based on this value
  function HealthPickUp(I) {
    I = I || {};
    I.active = true;
    I.healthValue = Math.round((Math.random()*10+1),0);
    I.width = 4 * I.healthValue;
    I.height = 4 * I.healthValue;
    I.color = "#5af4a3";
    I.age = 0;
    I.draw = function () {
      
      
      if(this.age > 600){
      
        canvas.fillStyle = "orange";
       canvas.fillRect(this.x+this.width*.1,this.y+this.height*.1,this.width*.8,this.height*.8);
        return;
      }

      canvas.fillStyle = this.color;
      canvas.fillRect(this.x, this.y, this.width, this.height);
    };

    I.update = function () {
      this.age++;

      //console.log("pickup placed at x:"+this.x+", y: "+this.y+", health value: "+this.healthValue);
      if(this.age > 1000){
        this.active = false;
      }
      
    };
    return I;
  }


  //create array to hold all active enemies
  enemies = [];

  /** Create and initialize the sprites to be used with Enemy objects, then place them into an array
   */
  enemySprite1 = new Image();
  enemySprite1.src = "game2sprites/demonsprite1.png";
  enemySprite2 = new Image();
  enemySprite2.src = "game2sprites/demonsprite2.png";
  enemySprite3 = new Image();
  enemySprite3.src = "game2sprites/demonsprite3.png";
  enemySprite4 = new Image();
  enemySprite4.src = "game2sprites/demonsprite4.png";
  enemySprites = [enemySprite1, enemySprite2, enemySprite3, enemySprite4];

  /**
   * Enemy Constructor
   * @param {*} I 
   * Enemies will meander about the screen and damage the player if they collide with them
   */
  function Enemy(I) {
    I = I || {};

    I.active = true;
    I.age = Math.floor(Math.random() * 128);

    //assign the sprite to a random sprite from the enemySprites array
    I.sprite = enemySprites[getRandomInt(enemySprites.length - 1)];
    I.health = 1;
    I.xVelocity = 0;
    I.yVelocity = 0;

    I.width = 40;
    I.height = 40;

    I.inBounds = function () {
      return I.x >= 0 && I.x <= CANVAS_WIDTH &&
        I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };

    
    I.draw = function () {
      canvas.drawImage(I.sprite, I.x, I.y, I.width, I.height);

    };

    I.update = function () {
      I.x += I.xVelocity;
      I.y += I.yVelocity;


      I.move();
      // The enemies just kind of shake around randomly, which is horrifying
      // the enemy's deviation speed will increase as you progress in level
      // I.xVelocity = ((Math.random() * (5*currentLevel)) - (5*currentLevel/2));
      // I.yVelocity = ((Math.random() * (5*currentLevel)) - (5*currentLevel/2));

      I.age++;

      I.active = I.active && I.inBounds();

      if(I.health <= 0){
        I.explode();
      }

    };

    // the explode function will delete an object from the canvas, as well as animate it
    I.explode = function () {
      //increment the enemies killed variable every time an enemy is killed...
      exp++;
//drop pickup with low probability
      if (Math.random() < .03) {
        let newPickup = HealthPickUp({
          x: this.x + this.width/2,
          y: this.y + this.height/2,
        });
        pickups.push(newPickup);
      }
      this.active = false;
    },

    I.move = function(){
      I.xVelocity = ((Math.random() * (5*currentLevel)) - (5*currentLevel/2));
      I.yVelocity = ((Math.random() * (5*currentLevel)) - (5*currentLevel/2));
    }
    return I;
  };





  tankerSprite1 = new Image();
  tankerSprite1.src = "game2sprites/tankersprite1.png";
  tankerSprite2 = new Image();
  tankerSprite2.src = "game2sprites/tankersprite2.png";
  tankerSprites = [tankerSprite1,tankerSprite2];

  /**
   * Enemy Constructor
   * @param {*} I 
   * Enemies will meander about the screen and damage the player if they collide with them
   */
  function Tanker(I) {
    I = I || {};

    I.active = true;
    I.age = Math.floor(Math.random() * 128);

    //assign the sprite to a random sprite from the enemySprites array
    I.sprite = tankerSprites[getRandomInt(tankerSprites.length - 1)];
    I.health = 20;
    I.xVelocity = 0
    I.yVelocity = 0;

    I.width = 80;
    I.height = 80;

    I.inBounds = function () {
      return I.x >= 0 && I.x <= CANVAS_WIDTH &&
        I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };

    
    I.draw = function () {
      canvas.drawImage(I.sprite, I.x, I.y, I.width, I.height);

    };

    I.update = function () {
     

      // The enemies just kind of shake around randomly, which is horrifying
      // the enemy's deviation speed will increase as you progress in level
      I.move(); 
      I.x += I.xVelocity;
      I.y += I.yVelocity;
      I.age++;

      I.active = I.active && I.inBounds();
      if(I.health <= 0){
        I.explode();
      }
    };

    // the explode function will delete an object from the canvas, as well as animate it
    I.explode = function () {
      //increment the enemies killed variable every time an enemy is killed...
      exp++;
//drop pickup with low probability
      if (Math.random() < .03) {
        let newPickup = HealthPickUp({
          x: this.x + this.width/2,
          y: this.y + this.height/2,
        });
        pickups.push(newPickup);
      }
      
      this.active = false;
    },

    I.move = function(){
      I.xVelocity = ((player.x - I.x)/I.x);
      I.xVelocity *=2;
      I.yVelocity = ((player.y - I.y)/I.y);
      I.yVelocity *=2;
    }

    return I;
  };


  function getAngleDeg(ax,ay,bx,by) {
    let angleDeg = Math.atan((ay-by)/(ax-bx)) * 180 / Math.PI;
    
    return(angleDeg);
  }
  //Basic utility colission function, adapted from
  //https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  function collides(a, b) {
    return a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
  }

  let piercingBullet = false;

  function handleCollisions() {
    // for each player bullet, check for collision with enemy objects
    //destroy enemy and bullet if collision is detected
  
    //CHECK COLLISION WITH BULLETS
    playerBullets.forEach(function (bullet) {

      enemies.forEach(function (enemy) {
        if (collides(bullet, enemy)) {
          enemy.health-=bullet.shotDamage;

          if(bullet.blast == false && bullet.bursting == true){

          playerBullets.push(BlastArea({
            x: bullet.x-30,
            y: bullet.y-30,
            shotDamage: 1
          }));
          
        }

          if(bullet.piercing == true){
            console.log("the bullet pierced through");
          }else{
            if(bullet.blast == false){
            bullet.active = false;}
          }
        }
        
      });

      spawners.forEach(function (spawner){
        if (collides(bullet, spawner)){

          spawner.hp -= bullet.shotDamage;

          if(bullet.blast === false){
          bullet.active = false;}
          
          console.log("spawner damaged");

          if (spawner.hp <= 0) {
            spawner.active = false;
            console.log("spawner destroyed");
            exp+=100;
        }
        }
      });

      //for each wall, check for collision with bullet,
      //destroy bullet and wall if collision is detected
      walls.forEach(function (wall) {
        if (collides(bullet, wall)) {
          wall.health-=bullet.shotDamage;
          //console.log("bullet hit wall for"+bullet.shotDamage+" damage!");
          if(bullet.blast === false){
            bullet.active = false;}
          
          if (wall.health <= 0) {
            wall.active = false;
          }
        }
      });

    });

    //if the player moves and is inside of a wall at the end of moving
    //place the player in their previous location (effectively preventing movement into walls)
    walls.forEach(function (wall) {
      if (collides(player, wall)) {
        //console.log("you've struck a wall");
        player.x = player.prevX;
        player.y = player.prevY;
      }
    });


    /**
     * check for collision between enemy body and player.  If collision is detected
     * destroy enemy and reduce health of player
     */
    enemies.forEach(function (enemy) {
      if (collides(enemy, player)) {
        enemy.health--;
        player.health-= 1 ;
        if (player.health <= 0) {
          player.explode();
        }
      }
    });

    pickups.forEach(function (pickup){

      if (collides(pickup, player)){

        if(player.health + pickup.healthValue >= player.maxHealth){

          player.health = player.maxHealth;
        }else{
          player.health += pickup.healthValue;
        }

        pickup.active = false;
      }
    });
    //used for bug-testing
    //console.log(player.inBounds());
  }

  currentLevel = 1;

  /** 
   * drawUI will render the UI elements on the canvas,
   * This is to be called AFTER the rendering of any other elements
  */
  function drawUI() {

    let fontSize = 40;
    canvas.font = fontSize + "px Arial Black";
    canvas.fillStyle = "#FFFFFF";
    canvas.strokeStyle = "#000000";
    canvas.textAlign = "left";
    canvas.lineWidth="3";
    let healthText = "Health: " + player.health;
    let killCountText = "Exp: " + exp;

    //Draw text
    canvas.fillText(healthText, fontSize, fontSize);
    canvas.fillText(killCountText, fontSize, (fontSize + 5) * 2);

    //Draw text border
    canvas.strokeText(healthText, fontSize, fontSize);
    canvas.strokeText(killCountText, fontSize, (fontSize + 5) * 2);

    canvas.textAlign = "right";
    let levelText = "Level: " + currentLevel;

    canvas.fillText(levelText, CANVAS_WIDTH - 20, fontSize);
    canvas.strokeText(levelText, CANVAS_WIDTH - 20, fontSize);

  }

  
  paused = false;

  function drawPauseUI(){

//This will cause the screen to darken except for the text on the screen while the game is paused
    canvas.fillStyle = "rgba(0,0,0,.5)";
    canvas.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    
    //return fillStyle to white for text drawing
    canvas.fillStyle = "#FFFFFF";
    let fontSize = 48;
    canvas.textAlign = "center";
    
    //draw pause screen, showing current health and bullet limits, as well as the options to upgrade
    canvas.fillText("Paused",CANVAS_WIDTH/2,CANVAS_HEIGHT/4);
    canvas.strokeText("Paused",CANVAS_WIDTH/2,CANVAS_HEIGHT/4);

    /**Controls Display */
    canvas.fillText("WASD to move",CANVAS_WIDTH/2,CANVAS_HEIGHT/4+fontSize);
    canvas.strokeText("WASD to move",CANVAS_WIDTH/2,CANVAS_HEIGHT/4+fontSize);

    canvas.fillText("Arrow keys to shoot",CANVAS_WIDTH/2,CANVAS_HEIGHT/4+fontSize*2);
    canvas.strokeText("Arrow keys to shoot",CANVAS_WIDTH/2,CANVAS_HEIGHT/4+fontSize*2);

    canvas.fillText("Next Upgrade: "+upgradeCost,CANVAS_WIDTH/2,CANVAS_HEIGHT/2);
    canvas.strokeText("Next Upgrade: "+upgradeCost,CANVAS_WIDTH/2,CANVAS_HEIGHT/2);

    canvas.fillText("Press 'Tab' to view Upgrades",CANVAS_WIDTH/2,CANVAS_HEIGHT/2+fontSize);
    canvas.strokeText("Press 'Tab' to view Upgrades",CANVAS_WIDTH/2,CANVAS_HEIGHT/2+fontSize);
    /**STATS DISPLAY*/
    canvas.fillText("Bullet Limit: "+player.maxBullets,CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize);
    canvas.strokeText("Bullet Limit: "+player.maxBullets,CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize);

    canvas.fillText("Max Health: "+player.maxHealth,CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*2);
    canvas.strokeText("Max Health: "+player.maxHealth,CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*2);

    canvas.fillText("Pierce Chance: "+piercingUpgrade+"%",CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*3);
    canvas.strokeText("Pierce Chance: "+piercingUpgrade+"%",CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*3)

    canvas.fillText("Burst Chance: "+burstingUpgrade+"%",CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*4);
    canvas.strokeText("Burst Chance: "+burstingUpgrade+"%",CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*4)
  }

  var upgradeScreen = false;

  function drawUpgradeUI(){
  
canvas.fillStyle = "rgba(0,0,0,.5)";
    canvas.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    
    //return fillStyle to white for text drawing
    canvas.fillStyle = "#FFFFFF";
    let fontSize = 48;
    canvas.textAlign = "center";

    canvas.fillText("Paused",CANVAS_WIDTH/2,CANVAS_HEIGHT/4);
    canvas.strokeText("Paused",CANVAS_WIDTH/2,CANVAS_HEIGHT/4);

    canvas.fillText("Player Level: "+player.level,CANVAS_WIDTH/2,CANVAS_HEIGHT/4+fontSize);
    canvas.strokeText("Player Level: "+player.level,CANVAS_WIDTH/2,CANVAS_HEIGHT/4+fontSize);

    canvas.fillText("Press 'Tab' to return",CANVAS_WIDTH/2,CANVAS_HEIGHT/2+fontSize);
    canvas.strokeText("Press 'Tab' to return",CANVAS_WIDTH/2,CANVAS_HEIGHT/2+fontSize);

    canvas.fillText("Next Upgrade: "+upgradeCost,CANVAS_WIDTH/2,CANVAS_HEIGHT/2);
    canvas.strokeText("Next Upgrade: "+upgradeCost,CANVAS_WIDTH/2,CANVAS_HEIGHT/2);

    canvas.fillText("Press 1 to upgrade bullet limit",CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*3);
    canvas.strokeText("Press 1 to upgrade bullet limit",CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*3);

    canvas.fillText("Press 2 to upgrade maximum health",CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*4);
    canvas.strokeText("Press 2 to upgrade maximum health",CANVAS_WIDTH/2,CANVAS_HEIGHT/1.7+fontSize*4);

  }

  var storyText = false;
  var storyTiming = 0;

  // levelStoryText will contain flavor text to be displayed between levels.  I am not going to focus on writing a story
    // at this point, because this is a coding project and not a writing project.
  var levelStoryText = [
    "Try not dying next time.",
    "Level 2",
      "Level 3",
      "Level 4",
      "Level 5",
      "Level 6",
      "Level 7",
      "Level 8",
      "Level 9",
      "Level X"
];

  function drawStoryText(storyString){

     

      canvas.fillStyle = "rgba(0,0,0,1)";
      canvas.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
     

    //return fillStyle to white for text drawing
    canvas.fillStyle = "#FFFFFF";
    var fontSize = 48;
    canvas.textAlign = "center";

    if(storyTiming < 50){
      canvas.fillStyle = "rgba(255,255,255,"+1/(50-storyTiming)+")";
    }
    if(storyTiming > 300){
      canvas.fillStyle = "rgba(255,255,255,"+300-storyTiming+")";
    }
    if(storyTiming > 400){
      storyText = false;
      storyTiming = 0;
    }

    
    canvas.fillText(storyString, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    canvas.strokeText(storyString, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    
  }


  /**
   * KEYBINDING AND CONTROLS
   */
  //currentKeys will hold the value of each key that is currently held down
  let currentKeys = [10];
  //if a key is pressed, fill that space with a 1
  $(document).keydown(function (e) {
    currentKeys[e.which] = 1;
  });
  //once key is released, place 0 in that key's space
  $(document).keyup(function (e) {
    currentKeys[e.which] = 0;
  });

  $(document).keydown(function (key) {

    
    /**
     * Check the status of keys assigned for movement
     */
    if(!paused && !upgradeScreen){
    if (currentKeys[downMoveKey]) {
      key.preventDefault();
      //console.log("moving down");
      player.vMove = 1;
    }
    if (currentKeys[upMoveKey]) {
      key.preventDefault();
      //console.log("moving up");
      player.vMove = -1;
    }
    if (currentKeys[leftMoveKey]) {
      key.preventDefault();
      //console.log("moving left");
      player.hMove = -1;
    }
    if (currentKeys[rightMoveKey]) {
      key.preventDefault();
      //console.log("moving right");
      player.hMove = 1;
    }
    /**
     * Check for status of keys defined for shooting
     */
    if (currentKeys[downShootKey]) {
      key.preventDefault();
      shotVelocityY = 1;
    }
    if (currentKeys[upShootKey]) {
      shotVelocityY = -1;
      key.preventDefault();
    }
    if (currentKeys[leftShootKey]) {
      shotVelocityX = -1;
      key.preventDefault();
    }
    if (currentKeys[rightShootKey]) {
      shotVelocityX = 1;
      key.preventDefault();
    }
    if (currentKeys[downShootKey] || currentKeys[upShootKey] || currentKeys[leftShootKey] || currentKeys[rightShootKey]) {
      player.shoot();
    }
    shotVelocityX = 0;
    shotVelocityY = 0;
  }
  /**
   * UPGRADES and EXP SPENDING
   */
if(upgradeScreen){
  //press 1 to increase max bullet count
if(currentKeys[49]){
  key.preventDefault();
  if(player.buyGunUpgrade() ){
  console.log("Upgrading player bullet count, new bullet max: "+player.maxBullets);
  }
}
//press 2 to increase health
if(currentKeys[50]){
  key.preventDefault();
  if(player.buyHealthUpgrade()){
  console.log("Upgrading player health count, new health max: "+player.maxHealth);
}
}
//press 3 to add chance for piercing rounds
if(currentKeys[51]){
  key.preventDefault();
  if(player.buyPiercingUpgrade()){
  console.log("Upgrading player piercing shot chance: new chance = "+piercingUpgrade+"%");
}
}
if(currentKeys[52]){
  key.preventDefault();
  if(player.buyBurstingUpgrade()){
  console.log("Upgrading player piercing shot chance: new chance = "+burstingUpgrade+"%");
}
}

if(currentKeys[54]){
  key.preventDefault();
  if(player.buyPiercingUpgrade()){
  console.log("Upgrading player piercing shot chance: new chance = "+piercingUpgrade+"%");
}
}


}



    if(currentKeys[pauseKey]){
      key.preventDefault();
      if(paused || upgradeScreen){
        console.log("Unpausing the game");
        paused=false;
        upgradeScreen = false;
      }else{
        console.log("Pausing the game");
        paused=true;
      }
    }

    //This will transition the screen from the pause menu to the upgrade menu
    if(currentKeys[9]){
      key.preventDefault();
      if(upgradeScreen){   
        console.log("moving back to pause menu");
        upgradeScreen = false;
        paused = true;
        }else if (paused){
      console.log("moving to upgrade screen");
      upgradeScreen = true;
        paused = false;
      }}
      
    
      if(currentKeys[53]){
        key.preventDefault();
        if(storyText == false){
        
          storyText = true;
        }else{
        storyText = false;
        storyTiming = 0;
      }
    }

  });

  // The update function will run at the current set FPS and be used to update the status of all objects in the game
  function update() {

    player.update();
    //update the location of each bullet that needs to be rendered
    playerBullets.forEach(function (bullet) {
      bullet.update();
    });
    //return the state of all currently active bullets
    playerBullets = playerBullets.filter(function (bullet) {
      return bullet.active;
    });

    enemies.forEach(function (enemy) {
      enemy.update();
    });

    enemies = enemies.filter(function (enemy) {
      return enemy.active;
    });

    walls.forEach(function (wall) {
      wall.update();
    });

    walls = walls.filter(function (wall) {
      return wall.active;
    });

    pickups.forEach(function (pickup) {
      pickup.update();
    });

    pickups = pickups.filter(function (pickup) {
      return pickup.active;
    });

    spawners.forEach(function (spawner) {
      spawner.spawn();
    });

    spawners = spawners.filter(function (spawner) {
      return spawner.active;
    });

    handleCollisions();
    
  }

  /** 
   * draw is called every frame and renders objects on the canvas
  */
  function draw() {
    if(!paused && !upgradeScreen && !storyText){
    //clear the canvas to remove ghosting of images that move
    canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    door.draw();
    //render the player character
    player.draw();

    // pickups.forEach(function (pickup){
    //   pickup.draw();
    // });

    walls.forEach(function (wall) {
      wall.draw();
    });
    spawners.forEach(function (spawner) {
      spawner.draw();
    });
    //render each bullet on the canvas
    playerBullets.forEach(function (bullet) {
      bullet.draw();
    });
    //render each enemy on the canvas
    enemies.forEach(function (enemy) {
      enemy.draw();
    });

    pickups.forEach(function (pickup){
      pickup.draw();
    });
    
    drawUI();
  }





  /**
   * GAME MANAGEMENT FUNCTIONS
   * setInterval, which is the Game Loop
   * restart(), the game over function
   * nextLevel(), the progression function
   */
  //create a loop which iterates 60 times per second
  




  const FPS = 60;
  
  setInterval(function () {

    if(!paused && !upgradeScreen && !storyText){
    update();
    }
    
    draw();

    if(paused){
      drawPauseUI();
    }
    if(upgradeScreen){
      drawUpgradeUI();
    }
    if(storyText){
      drawStoryText(levelStoryText[(currentLevel-1)]);
      storyTiming++;
    }

  }, 1000 / FPS);

  
  /** 
   * restart will put you back at level 1, effectively restarting the game
  */
  function restart() {
    enemies.length = 0;
    playerBullets.length = 0;
    walls.length = 0;
    spawners.length = 0;
    pickups.length = 0;
    // map = createMap();
    // populateMap(map);
    //randomizeBackground();
    currentLevel = 1;
    player.health = player.maxHealth;
    exp = 0 ;
    loadLevel();
  }

  /** 
   * nextLevel() will delete all current enemies, bullets, walls, and spawners,
   * Then will increment spawnerCount, create a new map, and increment the currentLevel variable
  */
  function nextLevel() {
    enemies.length = 0;
    playerBullets.length = 0;
    walls.length = 0;
    spawners.length = 0;
    pickups.length = 0;
    spawnerCount++;
    loadLevel();
    currentLevel++;
  }

  

  function loadLevel(){

    
    storyText = true;
    map = createMap();
    populateMap(map);

  }
  upgradeCost = 100;



  

  //used to randomize the background color of the canvas element
  function randomizeBackground() {
    $("canvas").css("background-color", backgroundColors[getRandomInt(backgroundColors.length - 1)]);
    door = Door({ x: (getRandomInt(19) * 40), y: (getRandomInt(19) * 40) });
  }


  /**
   * The door is the main goal of the level, and once collided with will place you in the next level
   * @param {*} I 
   */
  function Door(I) {
    I.width = 80;
    I.height = 80;
    I.draw = function () {
      canvas.drawImage(doorSprite, this.x, this.y, this.width, this.height);
    };

    return I;
  }


  /**
   * Create an array of sprites to be used with the walls
   */
  wallSprite1 = new Image();
  wallSprite1.src = "game2sprites/wallsprite1.png";
  wallSprite2 = new Image();
  wallSprite2.src = "game2sprites/wallsprite2.png";
  wallSprite3 = new Image();
  wallSprite3.src = "game2sprites/wallsprite3.png";
  wallSprite4 = new Image();
  wallSprite4.src = "game2sprites/wallsprite4.png";

  //Initialize an array of wall sprites
  wallSprites = [wallSprite1, wallSprite2, wallSprite3, wallSprite4];

  walls = [];
  /**
   *  a wall object will serve as a basic obstacle, preventing the player from moving about freely
  *   The wall constructor requires that an x and y coordinate are assigned to it on creation
  */
  function Wall(I) {
    I = I || {};
    I.active = true;
    I.health = 5;
    I.sprite = wallSprites[getRandomInt(wallSprites.length - 1)];
    I.draw = function () {
      canvas.drawImage(I.sprite, I.x, I.y, I.width, I.height);
    };
    //I.x = 0;
    //I.y = 0;
    I.width = 40;
    I.height = 40;

    I.inBounds = function () {
      return I.x >= 0 && I.x <= CANVAS_WIDTH &&
        I.y >= 0 && I.y <= CANVAS_HEIGHT;
    };

    I.update = function () {
    };
    return I;
  };

  //THE FOLLOWING CODE IS A MODIFIED VERSION OF THE PROCEDURAL DUNGEON MAP CREATOR HERE:
  //https://medium.freecodecamp.org/how-to-make-your-own-procedural-dungeon-map-generator-using-the-random-walk-algorithm-e0085c8aa9a
  //lets create a randomly generated map for our dungeon crawler
  function createMap() {
    let dimensions = 20; // width and height of the map
    let maxTunnels = 40; // max number of tunnels possible
    let maxLength = 20; // max length each tunnel can have
    let map = createArray(1, dimensions); // create a 2d array full of 1's
    let currentRow = Math.floor(Math.random() * dimensions); // our current row - start at a random spot
    let currentColumn = Math.floor(Math.random() * dimensions); // our current column - start at a random spot
    let directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // array to get a random direction from (left,right,up,down)
    let lastDirection = []; // save the last direction we went
    let randomDirection; // next turn/direction - holds a value from directions

    // lets create some tunnels - while maxTunnels, dimentions, and maxLength  is greater than 0.
    while (maxTunnels && dimensions && maxLength) {

      // lets get a random direction - until it is a perpendicular to our lastDirection
      // if the last direction = left or right,
      // then our new direction has to be up or down,
      // and vice versa
      do {
        randomDirection = directions[Math.floor(Math.random() * directions.length)];
      } while ((randomDirection[0] === -lastDirection[0] && randomDirection[1] === -lastDirection[1])
        || (randomDirection[0] === lastDirection[0] && randomDirection[1] === lastDirection[1]));

      let randomLength = Math.ceil(Math.random() * maxLength); //length the next tunnel will be (max of maxLength)
      let tunnelLength = 0; //current length of tunnel being created

      // lets loop until our tunnel is long enough or until we hit an edge
      while (tunnelLength < randomLength) {

        //break the loop if it is going out of the map
        if (((currentRow === 0) && (randomDirection[0] === -1)) ||
          ((currentColumn === 0) && (randomDirection[1] === -1)) ||
          ((currentRow === dimensions - 1) && (randomDirection[0] === 1)) ||
          ((currentColumn === dimensions - 1) && (randomDirection[1] === 1))) {
          break;
        } else {
          map[currentRow][currentColumn] = 0; //set the value of the index in map to 0 (a tunnel, making it one longer)
          currentRow += randomDirection[0]; //add the value from randomDirection to row and col (-1, 0, or 1) to update our location
          currentColumn += randomDirection[1];
          tunnelLength++; //the tunnel is now one longer, so lets increment that variable
        }
      }

      if (tunnelLength) { // update our variables unless our last loop broke before we made any part of a tunnel
        lastDirection = randomDirection; //set lastDirection, so we can remember what way we went
        maxTunnels--; // we created a whole tunnel so lets decrement how many we have left to create
      }
    }
    return map; // all our tunnels have been created and our map is complete, so lets return it to our render()
  };



  /**
   * 
   * @param {*} mapArray 
   * mapArray is a 2 dimensional array that contains information concerning the layout of the level.
   */
  function populateMap(mapArray) {
    let playerPlaced = false;
    let spawnerPlaced = 0;
  
    for (i = 0; i < mapArray.length; i++) {

      for (j = 0; j < mapArray[i].length; j++)
        if (mapArray[i][j] == 1) {
          let wall = Wall({
            x: j * 40,
            y: i * 40
          });
         // console.log("wall at x: " + wall.x + " y: " + wall.y + " created");
          walls.push(wall);
          
          if (spawnerPlaced < spawnerCount && Math.random() < .03) {
            let spawner = Spawner({
              x: j * 40,
              y: i * 40
            });
            let tanker = Tanker({
              x: j * 40,
              y: i * 40
            });
           // console.log("Spawner placed at x: " + spawner.x + " y: " + spawner.y);
            spawners.push(spawner);
            spawnerPlaced++;
            enemies.push(tanker);
          }
        } else if (mapArray[i][j] == 0) {

          player.placePlayer(j * 40, i * 40);

        }
    }
    

    randomizeBackground();
  }

  map = createMap();
  populateMap(map);

});


