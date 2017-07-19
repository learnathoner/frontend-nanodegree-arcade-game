/*jshint esversion: 6 */
// 'use strict';

/*
*
* 1. Storage Objects - Hold sizes, audio, and image files used
*
*/

/****** Sizes Used ******/

const SIZES = {
  canvasWidth: 505,
  canvasHeight: 606,
  rowHeight: 83,
  imageWidth: 101,
  imageHeight: 171,
  halfImageWidth: function() {return this.imageWidth * 0.5;},
  // Offset for where first drawn row starts on canvas
  canvasOffsetTop: 50,
  imageOffsetBottom: 38,
  playerFeet: 32,
  // Padding between player icon and image container sides
  playerSidePadding: 33,
  arbitraryPlayerOffsetBottom: 55,
  enemyPadding: 2,

  // Y value to center image vertically in canvas
  centerImage(height = this.imageHeight) {
    return (this.canvasHeight - height) / 2;
  },

  // X value to center image or rect horizontally in canvas
  centerRectHoriz(width = this.imageWidth) {
    return ((this.canvasWidth - width) / 2);
  }
};

/****** Game Sounds ******/

const sounds = {
  opening: new Audio('sounds/opening.wav'),
  charSelect: new Audio('sounds/char-selection.mp3'),
  startLevel: new Audio('sounds/start.mp3'),
  gameLoop: new Audio('sounds/game-loop.wav'),
  gem: new Audio('sounds/gem.wav'),
  optionSelect: new Audio('sounds/option-select.wav'),
  move: new Audio('sounds/player-move.mp3'),
  impact: new Audio('sounds/impact.mp3'),
  win: new Audio('sounds/win.wav'),
  lose: new Audio('sounds/lose.wav')
};

sounds.move.volume = 0.5;

/****** Characters ******/

// Creates character dictionaries with name and image
const charBoy = {name: 'Boy', sprite: 'images/char-boy.png'},
      charCatGirl = {name: 'Cat Girl', sprite: 'images/char-cat-girl.png'},
      charHornGirl = {name: 'Horn Girl', sprite: 'images/char-horn-girl.png'},
      charPinkGirl = {name: 'Pink Girl', sprite: 'images/char-pink-girl.png'},
      charPrincess = {name: 'Pam', sprite: 'images/char-princess-girl.png'};

// Stores All Characters in Array
const characters = [
  charBoy,
  charCatGirl,
  charHornGirl,
  charPinkGirl,
  charPrincess
];

/*
*
* 2. Utility Functions
*
*/

// Generates Random Int in Range (start,end)
function randomNum(start, end) {
  return Math.floor((Math.random() * end) + start);
}

// Clears screen
function clearScreen() {
  ctx.clearRect(0, 0, SIZES.canvasWidth, SIZES.canvasHeight);
}

// Clear screen, fill canvas with color
function fillCanvas(color = "white") {
  clearScreen();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, SIZES.canvasWidth, SIZES.canvasHeight);
}

// Like fillCanvas, but doesn't clear screen first
function transparentLayer(color = 'rgba(0, 0, 0, .25)') {
  ctx.fillStyle = color;
  ctx.fillRect(0, SIZES.canvasOffsetTop, SIZES.canvasWidth, SIZES.canvasHeight - 70);
}

// Draws rectangle in Center of screen. Used for messages
function drawCenterRect(color = 'rgba(0, 0, 0, 0.5)', height = 200, width = SIZES.canvasWidth) {
  let rectX = SIZES.centerRectHoriz(width);
  let rectY = SIZES.centerImage(height);
  ctx.fillStyle = color;
  ctx.fillRect(rectX, rectY, width, height);
}

/*
*
* 3. Text Object and animations
*
*/

// Object created to store text and animation functions
class TextObject {
  constructor(text = '',
              fontStyle = "20px Arial",
              styleType = "fill", style = "black",
              x = 0, y = 30) {
    this.text = text;
    this.fontStyle = fontStyle;
    this.styleType = styleType;
    this.style = style;
    this.x = x;
    this.y = y;
    this.alpha = 0;
    this.animationDone = false;
  }

  // Sets context for measuring text width
  createContext() {
    ctx[`${this.styleType}Style`] = this.style;
    ctx.font = `${this.fontStyle}`;
  }

  // Returns text width
  textWidth() {
    this.createContext();
    return ctx.measureText(this.text).width;
  }

  // Returns the x value to center-align text
  centerText() {
    const textWidth = this.textWidth();
    return (SIZES.canvasWidth - textWidth) / 2;
  }

  // Vertically center text, takes height in px
  centerVertical(textHeight) {
    return ((SIZES.canvasHeight - textHeight) / 2) + (textHeight);
  }

  // Draws text to the canvas
  drawText() {
    ctx[`${this.styleType}Style`] = this.style;
    ctx.font = `${this.fontStyle}`;
    ctx[`${this.styleType}Text`](this.text, this.x, this.y);
  }

  /****** Text Effects ******/

  // Floats text Right to the center of canvas
  floatRight(dt, speed = 100) {
      const center = this.centerText();
      this.drawText();

      if (this.x < center) {
        this.x += dt * speed;
      } else {
        this.animationDone = true;
      }
  }

  // Floats text Left to the center of canvas
  floatLeft(dt, speed = 100) {
      const center = this.centerText();
      this.drawText();

      if (this.x > center) {
        this.x -= speed * dt;
      } else {
        this.animationDone = true;
      }
  }

  // Fades text into the canvas, takes red, green, and blue values for color
  fadeIn(dt, speed = 100, red = 0, green = 0, blue = 0) {
    this.style = `rgba(${red}, ${green}, ${blue}, ${this.alpha})`;
    this.x = this.centerText();
    this.drawText();

    if (this.alpha < 1) {
      this.alpha += speed * dt;
    } else {
      this.animationDone = true;
    }
  }

  // Creates a text Shadow
  createShadow(color = "black", offsetX = 5, offsetY = 5, blur = 5) {
    ctx.shadowColor = color;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
    ctx.shadowBlur = blur;
  }

  // Sets animation status to false
  reset() {
    this.animationDone = false;
  }
}

/*
*
* 4. Game Management Functions
*
*/

// game object - holds status, character, level, and waiting
const game = {
  gameStatus: 'displayWelcomeScreen',
  character: '',
  level: 1,
  // Indicates whether a request to change status has been made using timeout
  waiting: false
};

// change game status to nextStatus in x seconds
game.changeStatus = function(nextStatus, seconds) {
  // Alerts that a status change request is in progress
  game.waiting = true;

  setTimeout(function() {
      game.gameStatus = nextStatus;
      game.waiting = false;
    }, seconds * 1000);
};

// Clears gameObjects and gems
game.resetObjects = function() {
  gameObjects = [];
};

// Upon level completion, updates score and sets next level configuration
game.nextLevel = function() {
  player.score += 100;
  sounds.win.play();
  this.level += 1;

  // Configurations for each level
  switch (this.level) {
    case 2:
      allEnemies.push(new Enemy(4));
      break;
    case 3:
      gameObjects.push(new Gem('green', 2, 2));
      gameObjects.push(new Gem('green', 2, 4));
      gameObjects.push(new Gem('green', 4, 3));
      break;
    case 4:
      this.resetObjects();
      gameObjects.push(new Rock(1, 3));
      gameObjects.push(new Gem('orange', 1, 5));
      gameObjects.push(new Gem('green', 3, 2));
      gameObjects.push(new Gem('green', 3, 4));
      gameObjects.push(new Rock(4, 2));
      gameObjects.push(new Rock(4, 4));
      break;
    case 5:
      this.resetObjects();
      gameObjects.push(new Rock(1, 1));
      gameObjects.push(new Rock(1, 2));
      gameObjects.push(new Rock(1, 4));
      gameObjects.push(new Rock(1, 5));
      gameObjects.push(new Gem('orange', 2, 1));
      gameObjects.push(new Gem('blue', 2, 5));
      gameObjects.push(new Rock(3, 1));
      gameObjects.push(new Rock(3, 3));
      gameObjects.push(new Rock(3, 5));
      gameObjects.push(new Gem('green', 4, 2));
      gameObjects.push(new Gem('green', 4, 4));
      break;
    case 6:
      this.resetObjects();
      gameObjects.push(new Rock(1, 3));
      gameObjects.push(new Gem('orange', 1, 1));
      gameObjects.push(new Rock(2, 3));
      gameObjects.push(new Rock(4, 1));
      gameObjects.push(new Rock(4, 2));
      gameObjects.push(new Rock(4, 4));
      gameObjects.push(new Rock(4, 5));
  }

  // After configuring level, resets enemies and shows level screen
  Enemy.reset();
  game.gameStatus = 'displayLevel';
};

// Resets game to starting settings
game.reset = function() {

  // Removes fourth row enemy if present
  if (this.level > 1) {
    allEnemies.pop();
  }

  this.level = 1;
  this.waiting = false;
  // TODO: fix welcomemsg reset
  welcomeScreen.welcomeMessage.reset();
  player.reset();
  Enemy.reset();
  this.resetObjects();
};

/*
*
* 5. Screens
*
*/

/****** Welcome Screen ******/

// Shows Welcome message on game start and restart
var welcomeScreen = {
  soundPlayed: false,
  // Text objects display on welcome screen
  welcomeMessage: new TextObject("Welcome To",
                                "50px ShadowsIL",
                                "fill", "blue",
                                10, 100),
  froggerJS: new TextObject("FroggerJS",
                                "bold 100px Indie_Flower",
                                "fill", "green",
                                600, 200),
  welcomeCredits: new TextObject("By: Learnathoner",
                                "40px Arial",
                                "fill", "green",
                                0, 300),

  // Draws welcome screen
  drawWelcomeScreen(dt) {

    // Ensures sound only plays once during the screen
    if (!this.soundPlayed) {
      sounds.opening.play();
      this.soundPlayed = true;
    }

    fillCanvas('white');
    this.welcomeMessage.floatRight(dt);
    this.froggerJS.floatLeft(dt, 200);
    this.welcomeCredits.fadeIn(dt, 0.5);

    // If all text animations are done, waits 1 second then changes game status
    // to Char selection screen
    if ((this.welcomeMessage.animationDone) &&
        (this.froggerJS.animationDone) &&
        (this.welcomeCredits.animationDone)) {
      if (!game.waiting) {
        game.changeStatus('displayCharSelection', 1);
      }
    }
  }
};

/****** Character Selection Screen ******/

const characterSelect = {
  // Position of where to draw selection border box
  boxX: 0,
  boxY: SIZES.centerImage(),
  // Index and name of currently selected char
  selectedCharIndex: 0,
  selectedCharName: 'Boy',
  // Message and Characted Name text objects
  chooseChar: new TextObject("Choose Your Character:",
                              "50px ShadowsIL",
                              "fill", "blue",
                              30, 125),
  charName: new TextObject("Character",
                            "50px ShadowsIL",
                            "fill", "blue",
                            30, 160),

  // Draws character selection Screen
  drawCharScreen() {
    // Creates background
    fillCanvas();
    // Draws 'Choose your char' message
    this.chooseChar.drawText();
    this.drawCharBorder();

    // Draws the 5 characters to the screen from characters array
    for (const [index, character] of characters.entries()) {
      // Fetches sprite image
      var currentChar = Resources.get(character.sprite);
      // Draws image
      ctx.drawImage(currentChar, index * SIZES.imageWidth, SIZES.centerImage());
    }
  },

  // Draws border around current character selection
  drawCharBorder() {
    // Border starts on char number * image width
    var borderX = this.selectedCharIndex * SIZES.imageWidth;

    // Moves border on the canvas side edges
    if (this.selectedCharIndex === 0) {
      borderX += 1;
    }
    if (this.selectedCharIndex === 4) {
      borderX -= 1;
    }

    // Draws border rectangle, calls fn to write name underneath
    ctx.fillStyle = "red";
    ctx.fillRect(borderX, SIZES.centerImage(), SIZES.imageWidth, SIZES.imageHeight);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.strokeRect(borderX, SIZES.centerImage(), SIZES.imageWidth, SIZES.imageHeight);
    this.writeCharName(borderX);
  },

  // Writes char name under border
  writeCharName(borderX) {
    // Text = selected char's name
    this.charName.text = this.selectedCharName;
    // Arrow function that returns X value to center name under char
    let centerBottomName = () => borderX + SIZES.halfImageWidth() - (this.charName.textWidth() * 0.5);

    // Char name stylings
    switch (this.selectedCharName) {
      case 'Boy':
          this.charName.style = 'blue';
          break;
      case 'Cat Girl':
          this.charName.style = 'pink';
          break;
      case 'Horn Girl':
          this.charName.style = 'black';
          break;
      case 'Pink Girl':
          this.charName.style = 'purple';
          break;
      case 'Pam':
          this.charName.style = 'gold';
          break;
    }
    // Y value placed under the border
    this.charName.y = SIZES.centerImage() + SIZES.imageHeight + 50;
    // X value aligns name centered under char
    this.charName.x = centerBottomName();
    this.charName.drawText();
  },

  // Checks to see whether selection move right / left allowed
  checkBoundaries(key) {
    if (key === 'left') {
      if (this.selectedCharIndex > 0) {
        return true;
      }
    }
    if (key === 'right') {
      if (this.selectedCharIndex < 4) {
        return true;
      }
    }
    return false;
  },

  // Initializes game when player selected and enter pushed
  confirmCharSelection() {
    game.gameStatus = 'displayLevel';
    game.character = characters[this.selectedCharIndex].sprite;
    player.sprite = game.character;
    clearScreen();
  },

  // Handles input on character selection screen
  handleInput(key) {
    if (key === 'enter') {
      this.confirmCharSelection();
    }
    if (this.checkBoundaries(key)) {
      if (key === 'left') {
        this.selectedCharIndex -= 1;
      }
      if (key === 'right') {
        this.selectedCharIndex += 1;
      }
      // Plays move sound, changes current char name, redraws selection screen
      sounds.charSelect.load();
      sounds.charSelect.play();
      this.selectedCharName = characters[this.selectedCharIndex].name;
      this.drawCharScreen();
    }
  }
};

/****** Center Display Screen ******/

class CenterDisplay {
  constructor(type) {
    this.centerText = new TextObject();
    this.type = type;
    this.soundPlayed = false;
    }

  displayCenterText() {
    let positionTop = 30,
        spacingBottom = 30;
    transparentLayer();

    if (!this.soundPlayed) {
      sounds.startLevel.play();
      this.soundPlayed = true;
    }

    switch (this.type) {
      case 'lives':
        this.centerText.fontStyle = "50px ShadowsIL";
        this.centerText.style = "#C52715";
        this.centerText.text = `Lives Remaining: ${player.lives}`;
        drawCenterRect('rgba(0, 255, 0, .75)');
        break;
      case 'level':
        this.centerText.fontStyle = "50px ShadowsIL";
        this.centerText.style = "yellow";
        this.centerText.text = `Current Level: ${game.level}`;
        drawCenterRect('rgba(0, 0, 255, .75)');
        break;
    }

    // Writes lives or level remaining
    this.centerText.x = this.centerText.centerText();
    this.centerText.y = this.centerText.centerVertical(50) - positionTop;
    this.centerText.drawText();

    // On 3rd Level screen, tells player about gems
    if ((game.level === 3) && (this.type === 'level')) {
      this.centerText.text = "BONUS: Collect All The Gems!";
      this.centerText.fontStyle = "30px ShadowsIL";
      this.centerText.x = this.centerText.centerText();
      this.centerText.y += spacingBottom + 10;
      this.centerText.drawText();
    }

    // Writes Press any Key to Continue
    this.centerText.text = "Press Any Key to Continue";
    this.centerText.fontStyle = "20px ShadowsIL";
    this.centerText.x = this.centerText.centerText();
    this.centerText.y += spacingBottom;
    this.centerText.drawText();

  }

  handleInput(e) {
    this.soundPlayed = false;
    sounds.startLevel.pause();
    sounds.startLevel.currentTime = 0;
    game.gameStatus = 'playGame';
  }
}

const displayLivesRemaining = new CenterDisplay('lives');
const displayLevel = new CenterDisplay('level');

/****** Lose Screen ******/

const loseScreen = {
  selectedOption: 1,
  optionHeight: 30,
  loseMessage: new TextObject("You Lose!",
                              "50px ShadowsIL",
                              "fill", "blue"),
  tryAgain: new TextObject("Try Again",
                              "30px ShadowsIL",
                              "fill", "green"),
  restart: new TextObject("Restart",
                              "30px ShadowsIL",
                              "fill", "green"),

  drawLoseScreen() {
    const tryAgainWidthHalf = this.tryAgain.textWidth() * 0.5;
    const restartWidthHalf = this.restart.textWidth() * 0.5;
    const padding = 25;
    const loseMessageY = this.loseMessage.centerVertical(50) - 25;
    const optionMarginTop = 60;
    const optionsY = loseMessageY + optionMarginTop;

    transparentLayer('rgba(255, 0, 0, 0.5)');
    drawCenterRect('rgba(255, 0, 0, 0.9)', 300);
    this.loseMessage.x = this.loseMessage.centerText();
    this.loseMessage.y = loseMessageY;
    this.tryAgain.x = this.tryAgain.centerText() - tryAgainWidthHalf - padding;
    this.tryAgain.y = optionsY;
    this.restart.x = this.restart.centerText() + restartWidthHalf + padding;
    this.restart.y = optionsY;

    this.optionBorder();
    this.loseMessage.drawText();
    this.tryAgain.drawText();
    this.restart.drawText();

  },

  // Creates border around selected option
  optionBorder() {
    let x = 1,
        width = 2,
        padding = 10,
        height = this.optionHeight + (padding * 2),
        y = this.restart.y - this.optionHeight - padding;

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;

    if (this.selectedOption === 1) {
      x = this.tryAgain.x - padding;
      width = this.tryAgain.textWidth() + (padding * 2);
    } else if (this.selectedOption === 2) {
      x = this.restart.x - padding;
      width = this.restart.textWidth() + (padding * 2);
    }

    ctx.fillStyle = "black";
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  },

  handleInput(key) {
    if ((key === 'left') && (this.selectedOption === 2)) {
      sounds.optionSelect.load();
      sounds.optionSelect.play();
      this.selectedOption -= 1;
    } else if ((key === 'right') && (this.selectedOption === 1)) {
      sounds.optionSelect.load();
      sounds.optionSelect.play();
      this.selectedOption += 1;
    }
    if (key === 'enter') {
      game.reset();
      if (this.selectedOption === 1) {
        game.reset();
        game.gameStatus = 'displayLevel';
      } else if (this.selectedOption === 2) {
        game.reset();
        game.gameStatus = 'displayWelcomeScreen';
      }
    }
  }
};

/****** Topbar *****/

// Draws topbar with score and lives
const topBar = {
  barHeight: 32,
  scoreX: 5,
  livesX: SIZES.canvasWidth - 125,
  textY: 30,
  // Clears the top before rendering
  clearTop() {
    ctx.clearRect(0, 0, SIZES.canvasWidth, this.barHeight);
  },

  // User regular text instead of TextObject for score and lives since they
  // cannot be used until player initialized
  displayScore() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText("Score = " + player.score, this.scoreX, this.textY);
  },

  displayLives() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText("Lives = " + player.lives, this.livesX, this.textY);
  },

  render() {
    this.clearTop();
    this.displayScore();
    this.displayLives();
  }
};

/*
*
* 6. Game Components
*
*/

function checkObjectCollision(object, playerRow, playerCol) {
  if ((playerCol === object.col) && (playerRow === object.row)) {
    return true;
    }
  return false;
}

class GameObject {
  constructor(row, column) {
    this.sprite = '';
    this.type = '';
    this.row = row;
    this.col = column;
    // sets X and Y values based on col/row that start at 1
    this.x = (this.col - 1) * SIZES.imageWidth;
    this.y = SIZES.canvasOffsetTop + ((this.row - 1) * SIZES.rowHeight);
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

/****** Rock Generator *****/

class Rock extends GameObject {
  constructor(row, column) {
    super(row, column);
    this.type = 'rock';
    this.sprite = 'images/Rock.png';
  }
}

/****** Gems *******/
class Gem extends GameObject{
  constructor(color, row, column) {
    super(row, column);
    this.type = 'gem';
    this.color = color;

    switch (color) {
      case 'green':
        this.sprite = 'images/gem-green.png';
        this.score = 10;
        break;
      case 'blue':
        this.sprite = 'images/gem-blue.png';
        this.score = 25;
        break;
      case 'orange':
        this.sprite = 'images/gem-orange.png';
        this.score = 50;
        break;
    }
  }
}

/****** Enemy Functions *****/

class Enemy {
  constructor(row) {
    this.sprite = 'images/enemy-bug-crop.png';
    // Sets row for each enemy, top stone-block path is 1
    this.row = row;
    this.minSpeed = 100;
    this.maxSpeed = 300;
    // Set X, Y, and Speed
    this.setEnemyX();
    this.setEnemyY();
    this.generateSpeed();
  }

  setEnemyX() {
    this.x = -SIZES.imageWidth;
  }

  setEnemyY() {
    this.y = SIZES.canvasOffsetTop + ((this.row) * SIZES.rowHeight);
  }

  generateSpeed() {
    this.speed = randomNum(this.minSpeed, this.maxSpeed);
  }

  update(dt) {
    // Sets x to speed * dt
    this.x += this.speed * dt;
    // When enemy reaches end, reset position and change speed
    if (this.x > SIZES.canvasWidth + SIZES.imageWidth) {
      this.setEnemyX();
      this.generateSpeed();
    }
  }

  static reset() {
    for (const enemy of allEnemies) {
      enemy.setEnemyX();
    }
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

/****** Player Functions *****/

class Player {
  constructor() {
    this.sprite = game.character;
    // Sets Lives = 3, Score = 0, and starting position
    this.reset();
  }

  setPosition() {
    this.row = 5;
    this.col = 3;
    this.x = (SIZES.canvasWidth - SIZES.imageWidth) / 2;
    this.y = (SIZES.canvasHeight - SIZES.imageHeight) - SIZES.arbitraryPlayerOffsetBottom;
  }

  reset() {
    this.lives = 3;
    this.score = 0;
    this.setPosition();
  }

  checkBoundaries(key) {
    // TODO: Are these variables being created every time funciton run?
    // Maybe better to set them as global?
    var maxY = (SIZES.canvasHeight - SIZES.imageHeight) - SIZES.arbitraryPlayerOffsetBottom;
    var minX = SIZES.imageWidth;
    var maxX = SIZES.canvasWidth - SIZES.imageWidth;

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

  checkgameObjects(playerRow, playerCol) {
    for (const object of gameObjects) {
      if ((object.type === 'rock') &&
          (checkObjectCollision(object, playerRow, playerCol))) {
        return true;
      }
    }
    return false;
  }

  handleInput(key) {
    // Check boundaries to make sure move allowed
    const playerRow = this.row,
          playerCol = this.col;

    if (this.checkBoundaries(key)) {
      if (key === 'up') {
        if (!this.checkgameObjects(playerRow - 1, playerCol)) {
          if (this.y > SIZES.rowHeight) {
            this.y -= SIZES.rowHeight;
            this.row--;
          } else {
            game.nextLevel();
            this.setPosition();
          }
        }
      }
      if (key === 'down') {
        if (!this.checkgameObjects(playerRow + 1, playerCol)) {
          this.y += SIZES.rowHeight;
          this.row++;
        }
      }
      if (key === 'left') {
        if (!this.checkgameObjects(playerRow, playerCol - 1)) {
          this.x -= SIZES.imageWidth;
          this.col -= 1;
        }
      }
      if (key === 'right') {
        if (!this.checkgameObjects(playerRow, playerCol + 1)) {
          this.x += SIZES.imageWidth;
          this.col += 1;
        }
      }
      sounds.move.load();
      sounds.move.play();
    }
  }

  update() {}

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}


/*
*
* 7. Collision Detection
*
*/

function checkCollisions() {
  // Subtracts 1, because allEnemy array starts at 0, but the first enemy
  // row begins at 1
  const enemyNum = player.row - 1;

  for (const enemy of allEnemies) {
    if (enemy.row === player.row) {
      let enemyStart = enemy.x + SIZES.enemyPadding;
      let enemyEnd = enemy.x + SIZES.imageWidth - SIZES.enemyPadding;
      var playerStart = player.x + SIZES.playerSidePadding;
      var playerEnd = player.x + SIZES.imageWidth - SIZES.playerSidePadding;

      // If front or back corner of player is inside enemy rectangle
      if ((playerStart > enemyStart) && (playerStart < enemyEnd) ||
          (playerEnd > enemyStart) && (playerEnd < enemyEnd)) {
        sounds.impact.play();

        if (player.lives > 0) {
          player.lives--;
          player.setPosition();
          game.gameStatus = 'displayLivesRemaining';
          // return true;
        } else {
          // TODO: Create losegame function
          sounds.lose.play();
          player.setPosition();
          game.gameStatus = 'displayLoseScreen';
        }
      }
    }
  }

  // check for Gem collision, if so adds points and removes
  for (const object of gameObjects) {
    if ((object.type === 'gem') &&
        (checkObjectCollision(object, player.row, player.col))) {
      let gemPosition = gameObjects.indexOf(object);
      sounds.gem.load();
      sounds.gem.play();
      player.score += object.score;
      gameObjects.splice(gemPosition, 1);
    }
  }
}

/*
*
* 8. Instantiate Objects
*
*/

let gameObjects = [];
const allEnemies = [];

(function() {
  for (let i = 0; i < 3; i++) {
    allEnemies.push(new Enemy(i + 1));
  }
})();

var player = new Player();

/*
*
* 9. Event Listener
*
*/

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.

document.addEventListener('keyup', function(e) {
  var allowedKeys = {};

  switch (game.gameStatus) {
    case 'displayCharSelection':
      allowedKeys = {
        37: 'left',
        39: 'right',
        13: 'enter'
      };
      characterSelect.handleInput(allowedKeys[e.keyCode]);
      break;
    case 'playGame':
      allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
      };
      player.handleInput(allowedKeys[e.keyCode]);
      break;
    case 'displayLivesRemaining':
      displayLivesRemaining.handleInput(e);
      break;
    case 'displayLevel':
      displayLevel.handleInput(e);
      break;
    case 'displayLoseScreen':
      allowedKeys = {
        37: 'left',
        39: 'right',
        13: 'enter'
      };
      loseScreen.handleInput(allowedKeys[e.keyCode]);
      break;
  }
});

// Future game soundloop
// sounds.gameLoop.addEventListener('keydown', function(e) {
//   if (e.keyCode === 77) {
//     if (sounds.gameLoop.playing) {
//       sounds.gameLoop.pause();
//     } else {
//       sounds.gameLoop.play();
//     }
//   }
// }, false);
//
// sounds.gameLoop.addEventListener('ended', function() {
//   if (game.gameStatus === 'playGame') {
//     this.currentTime = 0;
//     this.play();
//   }
// }, false);
