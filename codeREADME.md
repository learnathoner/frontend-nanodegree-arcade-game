# Frogger Code Walkthrough

## Basic Guide

A basic explanation of how the game runs:

**In "engine.js"**
1. **Canvas** - Creates a canvas and inserts into index.html
2. **Resources** - Loads resources, when ready calls init()
3. **init** - init() calls reset() then launches main()
4. **main** - main() checks the status of the game and refreshes w/ requestAnimationFrame

  **Game Status** can be:
  * **displayWelcomeScreen** = welcome screen
  * **displayCharSelection** = character selection screen
  * **displayLivesRemaining / displayLevel** = Shows lives remaining or level, press any key to continue playing
  * **displayLoseScreen** - Retry, or choose a new character
  * **playGame** = plays the game
    1. Get the game level
    2. update(dt) - update characters on screen
      * clears the board
      * update players and entities positions
      * check for collisions between player and enemy or gem
    3. render(level) - draws the level and characters
      * render level
        * if level = 1, renders 3 enemy rows
        * if level = 2, renders 4 enemy rows
      * render rocks, gems, enemies, player, and topbar with score

---

## app JS Quick Glance

1. [Storage Objects](#storage-objects) - Holds sizes, sounds, and characters used
2. [Utility Functions](#utility-functions) - Stores common functions I reuse, like randomInt() or clearCanvas()
3. [Text Object and Functions](#text-object-and-functions) - Object created to store text and animate it
4. [Game Management](#game-management) - Manages game status and level configurations
5. [Screens](#screens) - Creates the screens that display during the game -  Welcome Screen, Character Select, Lose Screen, Center Displays, Top Bar
6. [Game Components](#game-components) - The moving parts of the game - Rock, Gem, Player, Enemy, and related functions
7. [Collision Detection](#collision-detection) - Detects collisions between player and enemy or gem
8. [Instantiation](#instantiation) - Instantiates rocks, gems, allEnemies, and player
9. [Event Listener](#event-listener) - Sends appropriate input based on current gameStatus

---


# app.js Full Index

## Storage Objects
[Back to app.js Quick Glance](#app-js-quick-glance)

### sizes{ }
  * **Various sizes used in program**
  * canvasWidth: 505,
    canvasHeight: 606,
    rowHeight: 83,
    imageWidth: 101,
    imageHeight: 171,
    canvasOffsetTop: 50,
    imageOffsetBottom: 38,
    playerFeet: 32,
    playerSidePadding: 33,
    arbitraryPlayerOffsetBottom: 55,
    enemyPadding: 2,

### sounds{ }
  * **Sounds used in program**
  * startSound: new Audio('sounds/start.mp3'),
    moveSound: new Audio('sounds/player-move.mp3'),
    impactSound: new Audio('sounds/impact.mp3'),
    winSound: new Audio('sounds/win.wav'),
    loseSound: new Audio('sounds/lose.wav')

### characters[ ]

  * **Character names / images used**
    * Declares dictionaries mapping name to sprite
      * Ex: charBoy = {name: 'Boy', sprite: 'images/char-boy.png'}
    * Stores dictionaries in array  
      * characters = [charBoy, charCatGirl, charHornGirl, charPinkGirl, charPrincess]

## Utility Functions
[Back to app.js Quick Glance](#app-js-quick-glance)

  * **Variety of functions created for use throughout**
    * **randomNum(start, end)** - Generates random int
    * **clearScreen()** - Clears canvas
    * **fillCanvas(color = 'white')** - Clears and fills canvas with color
    * **transparentLayer(color = 'rgba(0, 0, 0, .25)')** - Creates transparent
      fill over canvas
    * **drawCenterRect(color = 'rgba(0, 0, 0, 0.5)', height, width = canvasWidth)**
      Draws rectangle in center of screen

## Text Object and Functions
[Back to app.js Quick Glance](#app-js-quick-glance)

  * **Creates a text object, making it easier to manipulate and animate text**
  ```
    TextObject(text,
      fontStyle = "20px Arial",
      styleType = "fill", style = "black",
      x = 0, y = 30))
  ```
  * **Functions**
    * **createContext()** - Makes context to measure text
    * **textWidth()** - Provides width
    * **centerText()** - Return X-value to center on canvas
    * **centerVertical(height)** - Returns Y-value to center vertically
    * **drawText()** - Draw text to canvas
  * **Animation Functions**
    * **floatRight(dt, speed)** - Floats text Right into the middle
    * **floatLeft(dt, speed)** - Floats text Left into the middle
    * **fadeIn(dt, speed, red, green, blue)** - Fades text into screen, color must
      be rgba
    * **createShadow(color, offsetX, offsetY, blur)** - Creates shadow
    * **reset()** - Sets animationDone to false

## Game management
[Back to app.js Quick Glance](#app-js-quick-glance)

  * **Holds functions for managing the game status and level**
  * **game{}** - Holds gameStatus, character, level, and waiting
    * Sets initial status to 'displayWelcomeScreen'
    * **changeStatus(nextStatus, seconds)** - Changes game Status in seconds
    * **nextLevel()** - Updates score and level, sets objects for level
    * **reset()** - Resets game to starting settings

## Screens
[Back to app.js Quick Glance](#app-js-quick-glance)

### Welcome Screen
  * welcomeScreen{}
  * **Text Objects** (the text used in welcomeScreen):
    * **welcomeMessage** - "welcome to", floats right into canvas
    * **froggerJS** - "FroggerJS", floats left into canvas
    * **welcomeCredits** - "By: Learnathoner" fades in
  * **drawWelcomeScreen(dt)** - Draws the text onto canvas
    * Once text drawn, wait 1 second then change status to displayCharSelection

### Character Selection Screen
  * characterSelect{}
  * **Text Objects**
    * **chooseChar** - "Choose Your Character"
    * **charName** - Shows currently selected char name below border
  * **drawCharScreen()** - Draws 5 characters, calls drawCharBorder
    * **drawCharBorder()** - Draws border around selected char, calls
      writeCharName()
    * **writeCharName()** - writes character name under border
  * **handleInput()** - handles input on char selection screen, after checking
    boundaries, can move left, right, or hit enter
    * **checkBoundaries()** - makes sure border can move left / right
    * **confirmCharSelection()** - if enter hit, changes gameStatus to

### Center Display Class
  * CenterDisplay(type) - Class for storing text displayed in the center of the
   screen over the game (level, lives, lose screen)
  * **constructor(type)** - sets type of display - lives or level
  * **displayCenterText()**
    * draws a transparentLayer over the screen
    * customizes text appearance based on type
    * draws text to center of screen
  * **handleInput()** - Changes gameStatus to 'playGame' on any keyup
  * Initialize Screens - Create instances to display
    * **displayLivesRemaining** - new CenterDisplay('lives')
    * **displayLevel** - new CenterDisplay('level')

### Lose Screen
  * loseScreen{} - Displays screen when you lose with option to try again with
    current char or restart and choose char
  * Text Objects
    * **loseMessage** - "You Lose" - 50px font
    * **tryAgain** - "Try Again" - 30px
    * **restart** - "Restart" - 30px
  * Functions
    * **drawLoseScreen** - Draws 3 text objects, calls border
    * **optionBorder()** - Draws box around current selection
    * **handleInput()** - Left or Right to switch, Enter to selecte

### Top Bar
  * topBar{} - Shows bar in game with score and lives
  * **clearTop** - clears between refreshes
  * **displayScore()** - draws player score
  * **displayLives()** - draws lives remaining
  * **render()** - clearTop(), displayScore(), displayLives()

## Game Components
[Back to app.js Quick Glance](#app-js-quick-glance)

### checkObjectCollision
  * detects collision between player and objects
    rock or gem, returns true if collision

### <span style="color:orange">Rock class</span>
  * Rock(row, col)
  * **constructor(row, col)** - places rock on row, col assigned
    * first row of road is row 1, first col is col 1
  * **render()**

### Gem class
  * Gem(color, row, col)
  * **constructor(color, row, col)** - takes color (green, blue, orange),
    assigns score based on color, assigns row and col
  * **render()**

### Enemy class
  * Enemy(row)
  * **constructor(row)** - Sets sprite, row, x, y, and speed
  * **setEnemyX** - Sets enemy X to offscreen on the left
  * **setEnemyY** - Sets enemy Y based on row
  * **generateSpeed** - Generates random speed
  * **update(dt)** - Updates position by speed * dt, if enemy makes it past
    canvas, resets x to start of row, regenerates speed
  * **static reset()** - Resets x of all enemies in array
  * **render()**

### Player
    * **constructor()** - Sets sprite, reset()
    * **setPosition()** - Sets initial position on board
    * **reset()** - Lives = 3, score = 0, setPosition()
    * **handleInput()** - Allows movement if no rock or border
      * **checkBoundaries()** - Make sure movement in borders
      * **checkRock()** - Check for rocks
    * **render()**

## Collision Detection
[Back to app.js Quick Glance](#app-js-quick-glance)

* **checkCollision()** - Checks for collision between player and enemy or
  player and gems
    * If collision with gem, adds score and removes gem from array

## Instantiation
[Back to app.js Quick Glance](#app-js-quick-glance)

* rocks = []
* gems = []
* allEnemies = []
  * create enemies for rows 1 - 3
* player = new Player()

## Event listener
[Back to app.js Quick Glance](#app-js-quick-glance)

* If gameStatus
  * **displayCharSelection:** - Allows left, right, or enter
  * **playGame** - Left, right, up, or down
  * **displayLivesRemaining or displayLevel** - Any input
