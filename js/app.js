/*
TODO: Is there a way to import or use these from engine, even
though app.js is loaded after?
global.canvas = canvas?
*/
// var cWidth = 505,
//     cHeight = 606;

// Returns random int in range (start, end), saves retyping
function randomNum(start, end) {
  return Math.floor((Math.random() * end) + start);
}

var canvasWidth = 505,
    canvasHeight = 606,
    imageWidth = 101,
    imageHeight = 171,
    imageOffsetTop = 50,
    imageOffsetBottom = 38,
    rowHeight = 83,
    playerFeet = 32,
    playerSidePadding = 17,
    enemyPadding = 2;

// Enemies our player must avoid
var Enemy = function(row) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The imag001e/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug-crop.png';
    this.x = -imageWidth;
    // Calls function to generate Y value
    this.enemyRow = row + 1;
    this.setY(this.enemyRow);
    // Calls function to generate speed
    this.generateSpeed();
};

// Sets enemy 'Y': Chooses random road row 1-3, puts enemy in middle
Enemy.prototype.setY = function(row) {
  // var rowNum = randomNum(1,3);
  // // Sets Y to (row 1-3 * the row height) + the top padding
  // var enemyY = 50 + (rowNum * rowHeight);
  // this.y = enemyY;
  this.y = ((row) * rowHeight) + 50;
};

// Sets speed between 100 / 300
Enemy.prototype.generateSpeed = function() {
  this.speed = randomNum(100, 300);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // Sets x to speed * dt
  this.x += this.speed * dt;
  // When enemy reaches end of row, sets new speed and row
  if (this.x > canvasWidth + imageWidth) {
    this.x = -imageWidth;
    this.generateSpeed();
  }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  this.sprite = 'images/char-boy.png';
  // this.x = (canvasWidth - imageWidth) / 2;
  // // TODO: Completely arbitrary y, better way?
  // this.y = canvasHeight - imageHeight - 55;

  this.lives = 3;
  // reset sets the Y and X to default locations
  this.reset();
  this.playerRow = 5;
};

Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  // ctx.strokeRect(this.x, this.y, imageWidth, imageHeight);
};

Player.prototype.reset = function() {
  this.x = (canvasWidth - imageWidth) / 2;
  // TODO: Completely arbitrary y, better way?
  this.y = canvasHeight - imageHeight - 55;
};

Player.prototype.update = function() {
};

Player.prototype.handleInput = function(key) {
  // TODO: Adjust dimensions
  if (key === 'up') {
    if (this.y > 83) {
      this.y -= 83;
      this.playerRow--;
    } else {
      player.reset();
    }
  }
  if (key === 'down') {
    if (this.y < canvasHeight - imageHeight - 55) {
      this.y += 83;
      this.playerRow++;
    }
  }
  if (key === 'left') {
    if (this.x > 99) {
      this.x -= 101;
    }
  }
  if (key === 'right') {
    if (this.x < 505-101) {
      this.x += 101;
    }
  }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];

(function() {
  for (var i = 0; i < 3; i++) {
    allEnemies.push(new Enemy(i));
  }
})();

var player = new Player();

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
      ctx.strokeText("collision", 0, 20);
      player.reset();
      player.playerRow = 5;
      return true;
    }
    return false;
  }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
