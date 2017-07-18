
/*
*
* Storage Objects - Hold sizes, audio, and image files used
*
*/

// Sizes used throughout app
const sizes = {
  canvasWidth: 505,
  canvasHeight: 606,
  imageWidth: 101,
  imageHeight: 171,
  canvasOffsetTop: 50,
  imageOffsetBottom: 38,
  rowHeight: 83,
  playerFeet: 32,
  playerSidePadding: 33,
  arbitraryPlayerOffsetBottom: 55,
  enemyPadding: 2
}

sizes.centerImage = (sizes.canvasHeight - sizes.imageHeight) / 2;

// Sounds used in game
// TODO: Why is "Audio" not defined
// const sounds = {
//   startSound: new Audio('sounds/start.mp3'),
//   moveSound: new Audio('sounds/player-move.mp3'),
//   impactSound: new Audio('sounds/impact.mp3'),
//   winSound: new Audio('sounds/win.wav'),
//   loseSound: new Audio('sounds/lose.wav')
// }

// Character Icons
const characters = {
  boy: 'images/char-boy.png',
  catGirl: 'images/char-cat-girl.png',
  hornGirl: 'images/char-horn-girl.png',
  pinkGirl: 'images/char-pink-girl.png',
  princessGirl: 'images/char-princess-girl.png'
}

/*
*
* Utility Functions
*
*/

// Generates random int in range(start, end)
function randomNum(start, end) {
  return Math.floor((Math.random() * end) + start);
}

function clearScreen() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function getTextWidth(text) {
  return ctx.measureText(text).width;
}

function centerTextCanvas(textWidth) {
  return ((canvasWidth - textWidth) / 2);
}

/*
*
* Game Management Functions
*
*/

// Game Status and chosen Character
const game = {
  gameStatus: 0,
  character: ''
}

// Displays score and lives
const topBar = {

  clearTop() {
    ctx.clearRect(0, 0, canvasWidth, 32);
  },

  displayScore() {
    ctx.font = "30px Arial";
    ctx.fillText("Score = " + player.score, 5, 30);
  },

  displayLives() {
    ctx.font = "30px Arial";
    ctx.fillText("Lives = " + player.lives, canvasWidth - 125, 30);
  },

  render() {
    this.clearTop();
    this.displayScore();
    this.displayLives();
  }
}

topBar.render()

/*
*
* Character Selection Screen
*
*/

const characterSelect = {
  boxX: 0,
  boxY: centerImage,
  selectedChar: 0,
  startGame: false,

  // Draws character selection Screen
  drawCharScreen() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // Draws the 5 characters to the screen
    for (i = 0; i < 5; i++) {
      var currentChar = Resources.get(charArray[i]);

      ctx.drawImage(currentChar, i * imageWidth, centerImage);
    }
    // console.log("completed");
    this.selectedCharBorder();
  },

  // Draws border around character
  selectedCharBorder() {
    var borderX = this.selectedChar * imageWidth;
    ctx.lineWidth = 2;
    if (this.selectedChar == 0) {
      borderX += 1;
    }
    if (this.selectedChar == 4) {
      borderX -= 1;
    }
    ctx.strokeRect(borderX, centerImage, imageWidth, imageHeight);
  },

  // Checks to see whether move right / left allowed
  checkBoundaries(key) {
    if (key === 'left') {
      if (this.selectedChar > 0) {
        return true;
      }
    }
    if (key === 'right') {
      if (this.selectedChar < 4) {
        return true;
      }
    }
    return false;
  },

  // Handles input on character selection screen
  handleInput(key) {
    if (key === 'enter') {
      game.character = charArray[this.selectedChar];
      this.startGame = true;
      game.gameStatus = 1;
      player.sprite = game.character;
    }
    if (this.checkBoundaries(key)) {
      if (key === 'left') {
        this.selectedChar -= 1;
        this.drawCharScreen();
        moveSound.load();
        moveSound.play();
      }
      if (key === 'right') {
        this.selectedChar += 1;
        this.drawCharScreen();
        moveSound.load();
        moveSound.play();
      }
    }
  }
};

/*
*
* Enemy Functions
*
*/

class Enemy {
  constructor(row) {
    this.sprite = 'images/enemy-bug-crop.png';
    // Sets row for each enemy, top stone-block path is 1
    this.enemyRow = row + 1;
    // Starts enemy off canvas
    this.setEnemyX();
    this.setEnemyY(this.enemyRow);
    this.generateSpeed();
  }

  setEnemyX() {
    this.x = -imageWidth;
  }

  setEnemyY() {
    this.y = canvasOffsetTop + ((this.enemyRow) * rowHeight);
  }

  generateSpeed() {
    this.speed = randomNum(100, 300);
  }

  update(dt) {
    // Sets x to speed * dt
    this.x += this.speed * dt;
    // When enemy reaches end, reset position and change speed
    if (this.x > canvasWidth + imageWidth) {
      this.setEnemyX();
      this.generateSpeed();
    }
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

/*
*
* Player Functions
*
*/

class Player {
  constructor() {
    this.sprite = game.character;
    // Sets Lives = 3, Score = 0, and starting position
    this.playerReset();
  }

  playerSetPosition() {
    this.playerRow = 5;
    this.x = (canvasWidth - imageWidth) / 2;
    this.y = (canvasHeight - imageHeight) - arbitraryPlayerOffsetBottom;
  }

  playerReset() {
    this.lives = 3;
    this.score = 0;
    this.playerSetPosition();
  }

  checkBoundaries(key) {
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
  }

  handleInput(key) {
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
  }

  update() {}

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

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

  if (game.gameStatus === 0) {
    allowedKeys = {
        37: 'left',
        39: 'right',
        13: 'enter'
    };
    characterSelect.handleInput(allowedKeys[e.keyCode]);
  }
  if (game.gameStatus === 1) {
    allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
  }
});
