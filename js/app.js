
/*
*
* Global variables
*
*/

var canvasWidth = 505,
    canvasHeight = 606,
    imageWidth = 101,
    imageHeight = 171,
    centerImage = (canvasHeight - imageHeight) / 2,
    canvasOffsetTop = 50,
    imageOffsetBottom = 38,
    rowHeight = 83,
    playerFeet = 32,
    playerSidePadding = 33,
    arbitraryPlayerOffsetBottom = 55,
    enemyPadding = 2;

// Game Sounds
var startSound = new Audio('sounds/start.mp3'),
    moveSound = new Audio('sounds/player-move.mp3'),
    impactSound = new Audio('sounds/impact.mp3'),
    winSound = new Audio('sounds/win.wav'),
    loseSound = new Audio('sounds/lose.wav');

moveSound.volume = 0.5;

// Array of potential Character Icons
var charArray = [
  'images/char-boy.png',
  'images/char-cat-girl.png',
  'images/char-horn-girl.png',
  'images/char-pink-girl.png',
  'images/char-princess-girl.png',
];

/*
*
* Utility Functions
*
*/

// Generates Random Int in Range (start,end)
function randomNum(start, end) {
  return Math.floor((Math.random() * end) + start);
}

/*
*
* Game Management Functions
*
*/

var Game = {};

Game.gameStatus = 0;

Game.clearTop = function() {
  ctx.clearRect(0, 0, canvasWidth, 32);
};

Game.displayScore = function() {
  ctx.font = "30px Arial";
  ctx.fillText("Score = " + player.score, 5, 30);
};

Game.displayLives = function() {
  ctx.font = "30px Arial";
  ctx.fillText("Lives = " + player.lives, canvasWidth - 125, 30);
};

Game.render = function() {
  this.clearTop();
  this.displayScore();
  this.displayLives();
};

/*
*
* Character Selection Screen
*
*/

var characterSelect = {
  boxX: 0,
  boxY: centerImage,
  startGame: false
};

characterSelect.drawScreen = function() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  // Creates a background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  // Draws the 5 characters to the screen
  for (var i = 0; i < 5; i++) {
    var currentChar = Resources.get(charArray[i]);
    ctx.drawImage(currentChar, i * imageWidth, centerImage);
  }
  this.boundBox();
};

characterSelect.boundBox = function() {
  ctx.strokeRect(this.boxX, this.boxY, imageWidth, imageHeight);
};

characterSelect.handleInput = function(key) {
  // if (this.checkBoundaries(key)) {
    moveSound.load();
    moveSound.play();
    if (key === 'enter') {
      this.startGame = true;
      Game.gameStatus = 1;
    }
    if (key === 'left') {
      this.boxX -= imageWidth;
    }
    if (key === 'right') {
        this.boxX += imageWidth;
    }
    this.drawScreen();
  // }
};

/*
*
* Enemy Functions
*
*/

var Enemy = function(row) {
    this.sprite = 'images/enemy-bug-crop.png';
    // Sets row for each enemy, top stone-block path is 1
    this.enemyRow = row + 1;
    // Starts enemy off canvas
    this.setEnemyX();
    this.setEnemyY(this.enemyRow);
    this.generateSpeed();
};

// Set enemy X, position enemy off canvas
Enemy.prototype.setEnemyX = function() {
  this.x = -imageWidth;
};

// Sets Enemy Y to the middle of their row
Enemy.prototype.setEnemyY = function(row) {
  this.y = canvasOffsetTop + ((row) * rowHeight);
};

// Sets speed between 100 / 300
Enemy.prototype.generateSpeed = function() {
  this.speed = randomNum(100, 300);
};

// Update the enemy's position, required method for game
Enemy.prototype.update = function(dt) {
  // Sets x to speed * dt
  this.x += this.speed * dt;
  // When enemy reaches end, reset position and change speed
  if (this.x > canvasWidth + imageWidth) {
    this.setEnemyX();
    this.generateSpeed();
  }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/*
*
* Player Functions
*
*/

var Player = function() {
  this.sprite = 'images/char-boy.png';
  // Sets Lives = 3, Score = 0, and starting position
  this.playerReset();
};

// Sets X and Y to initial position, bottom center, and row = 5
Player.prototype.playerSetPosition = function() {
  this.playerRow = 5;
  this.x = (canvasWidth - imageWidth) / 2;
  this.y = (canvasHeight - imageHeight) - arbitraryPlayerOffsetBottom;
};

// Sets X and Y to initial position, bottom center, and row = 5
Player.prototype.playerReset = function() {
  this.lives = 3;
  this.score = 0;
  this.playerSetPosition();
};

Player.prototype.checkBoundaries = function(key) {
  // TODO: Are these variables being created every time funciton run?
  // Maybe better to set them as global?
  var maxY = (canvasHeight - imageHeight) - arbitraryPlayerOffsetBottom;
  var minX = imageWidth;
  var maxX = canvasWidth - imageWidth;

  if ((key === 'down') && (this.y < maxY)) {
    return true;
  }
  if ((key === 'left') && (this.x >= minX)) {
    return true;
  }
  if ((key === 'right') && (this.x < maxX)) {
    return true;
  }
  if (key === 'up') {
      return true;
    }
  return false;
};

// Handles input and moves player
Player.prototype.handleInput = function(key) {
  // Check boundaries to make sure move allowed
  if (this.checkBoundaries(key)) {
    moveSound.load();
    moveSound.play();
    if (key === 'up') {
      if (this.y > rowHeight) {
        this.y -= rowHeight;
        this.playerRow--;
      } else {
        this.score++;
        winSound.play();
        this.playerSetPosition();
      }
    }
    if (key === 'down') {
      this.y += rowHeight;
      this.playerRow++;
    }
    if (key === 'left') {
      this.x -= imageWidth;
    }
    if (key === 'right') {
        this.x += imageWidth;
    }
  }
};

// TODO: Any use for update?
Player.prototype.update = function() {
};

Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/*
*
* Collision Detection
*
*/

function checkCollisions() {
  // Subtracts 1, because allEnemy array starts at 0, but the first enemy
  // row begins at 1
  var enemyNum = player.playerRow - 1;

  if (allEnemies[enemyNum]) {
    var rowEnemy = allEnemies[enemyNum];
    var enemyStart = rowEnemy.x + enemyPadding;
    var enemyEnd = rowEnemy.x + imageWidth - enemyPadding;
    var playerStart = player.x + playerSidePadding;
    var playerEnd = player.x + imageWidth - playerSidePadding;

    // If front or back corner of player is inside enemy rectangle
    if ((playerStart > enemyStart) && (playerStart < enemyEnd) ||
        (playerEnd > enemyStart) && (playerEnd < enemyEnd)) {
      impactSound.play();
      if (player.lives > 0) {
        player.lives--;
        player.playerSetPosition();
        // return true;
      } else {
        loseSound.play();
        player.playerReset();
      }
    }
    // return false;
  }
}

/*
*
* Instantiate Objects
*
*/

var allEnemies = [];

(function() {
  for (var i = 0; i < 3; i++) {
    allEnemies.push(new Enemy(i));
  }
})();

var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {};

  if (Game.gameStatus === 0) {
    allowedKeys = {
        37: 'left',
        39: 'right',
        13: 'enter'
    };
    characterSelect.handleInput(allowedKeys[e.keyCode]);
  }
  if (Game.gameStatus === 1) {
    allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
  }
});
