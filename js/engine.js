var Engine = (function(global) {

  /*
  *
  * Global Variables and Canvas Definition
  *
  */

  var doc = global.document,
      win = global.window,
      canvas = doc.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      mainContent = doc.getElementById('main'),
      lastTime;

  canvas.width = 505;
  canvas.height = 606;
  mainContent.appendChild(canvas);

  /*
  *
  * Main Game Control - RequestAnimation for level or current screen
  *
  */

  function main() {
    // Create dt Value
    var now = Date.now(),
        dt = (now - lastTime) / 1000.0;
    // Fetches level for rendering
    let level = game.level;

    // Display screen based on gameStatus
    switch (game.gameStatus) {
      // Welcome Screen
      case 'displayWelcomeScreen':
        welcomeScreen.drawWelcomeScreen(dt);
        break;
      // Character Selection
      case 'displayCharSelection':
        characterSelect.drawCharScreen()
        break;
      // Lives Remaining
      case 'displayLivesRemaining':
        render(level);
        displayLivesRemaining.displayCenterText();
        break;
      // Show Current Level
      case 'displayLevel':
        render(level);
        displayLevel.displayCenterText();
        break;
      // Lose Screen
      case 'displayLoseScreen':
        update(dt);
        render(level);
        loseScreen.drawLoseScreen();
        break;
      // Plays the game
      case 'playGame':
        update(dt);
        render(level);
        break;
    }

    // Set next timeDelta
    lastTime = now;

    // Reload main
    win.requestAnimationFrame(main);
  }


  // Called once after resources loaded, sets time and loads main
  function init() {
    reset();
    lastTime = Date.now();
    main();
  }

  // Calls entity update, checks for collisions
  function update(dt) {
      ctx.clearRect(0, 0, sizes.canvasWidth, sizes.canvasHeight);
      updateEntities(dt);
      checkCollisions();
  }

  // Updates the position of all moving entities
  function updateEntities(dt) {
      allEnemies.forEach(function(enemy) {
          enemy.update(dt);
      });
      // player.update();
  }

  // Draws the level and entities
  function render(level = 1) {
      // Images used to draw the level rows and columns
      var rowImages = [
              'images/water-block.png',   // Top row is water
              'images/stone-block.png',   // Row 1 of 3 of stone
              'images/stone-block.png',   // Row 2 of 3 of stone
              'images/stone-block.png',   // Row 3 of 3 of stone
              'images/grass-block.png',   // Row 1 of 2 of grass
              'images/grass-block.png'    // Row 2 of 2 of grass
          ],
          numRows = 6,
          numCols = 5,
          row, col;

      // For levels greater than 1, adds another row
      if (level > 1) {
        rowImages[4] = 'images/stone-block.png';
      }

      // Loop through and draw the array for rows and columns
      for (row = 0; row < numRows; row++) {
          for (col = 0; col < numCols; col++) {
              // Draws the array images to canvas
              ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
          }
      }

      // Render entities
      renderEntities();
  }

  // After location updated, draws player, enemies, and objects
  function renderEntities() {

    // Hack to render gems and rocks by row order without overlap
    // TODO: Combine rocks and gems into single array
    for (let row = 1; row < 5; row++) {
      gems.forEach(function(gem) {
        if (gem.row === row) {
          gem.render();
        }
      });

      rocks.forEach(function(rock) {
        if (rock.row === row) {
          rock.render();
        }
      });
    }

    // Renders all enemies
    allEnemies.forEach(function(enemy) {
        enemy.render();
    });

    // Render player
    player.render();
    // Render TopBar with score
    topBar.render();
}

  /* This function does nothing but it could have been a good place to
   * handle game reset states - maybe a new game menu or a game over screen
   * those sorts of things. It's only called once by the init() method.
   */
  function reset() {
      // noop
    // characterSelect.drawCharScreen();
  }

  /* Go ahead and load all of the images we know we're going to need to
   * draw our game level. Then set init as the callback method, so that when
   * all of these images are properly loaded our game will start.
   */
  Resources.load([
      'images/stone-block.png',
      'images/water-block.png',
      'images/grass-block.png',
      'images/enemy-bug.png',
      'images/enemy-bug-crop.png',
      'images/char-boy.png',
      'images/char-cat-girl.png',
      'images/char-horn-girl.png',
      'images/char-pink-girl.png',
      'images/char-princess-girl.png',
      'images/Rock.png',
      'images/gem-blue.png',
      'images/gem-green.png',
      'images/gem-orange.png'
  ]);
  Resources.onReady(init);

  /* Assign the canvas' context object to the global variable (the window
   * object when run in a browser) so that developers can use it more easily
   * from within their app.js files.
   */
  global.ctx = ctx;
})(this);
