      // Declare variable of tile width
      const tileWidth = 101,

          // Declare variable of tile height
          tileHeight = 83,

          // Declare variable of gem goal (collect 50 to win game)
          gemGoal = 50,

          // Declare variable of Heart
          heartCountElement = document.querySelector('.game-stats-hearts'),

          // Declare variable of gem count element
          gemCountElement = document.querySelector('.game-stats-gem-count'),

          // Declare variable of minutes
          minutesElement = document.querySelector('.game-stats-minutes'),

          // Declare variable of tile seconds
          secondsElement = document.querySelector('.game-stats-seconds'),

          /**************** Source to download game sounds https://www.zapsplat.com/sound-effect-category/game-sounds/ *************/
          // Declare variable of collect gems sound
          gemSound = new Audio('sounds/Collect_Point_00.mp3'),

          // Declare variable of death sound
          deathSound = new Audio('sounds/Explosion_03.mp3'),

          // Declare variable of game over sound
          gameOverSound = new Audio('sounds/Jingle_Lose_00.mp3'),

          // Declare variable of game win sound
          gameWinSound = new Audio('sounds/Jingle_Win_00.mp3');

      let gameStarted = false,
          totalSeconds = 0,
          gameTimer;

      gemSound.preload = 'auto';
      deathSound.preload = 'auto';
      gameOverSound.preload = 'auto';
      gameWinSound.preload = 'auto';

      // Draw on the screen, required method for game
      class gameObject {

          render(
              xOffset = 0,
              yOffset = 0,
              spriteWidth = 101,
              spriteHeight = 171
          ) {
              ctx.drawImage(
                  Resources.get(this.sprite),
                  (this.x + xOffset),
                  (this.y + yOffset),
                  spriteWidth,
                  spriteHeight
              );
          }
      }

      // Enemy
      class Enemy extends gameObject {

          constructor() {
              super();
              this.sprite = 'images/enemy-bug.png';
              this.speedMultiplier = 1;
              this.randomizeSettings();
          }

          // Update the enemy's position
          // Parameter: dt, a time delta between ticks
          update(dt) {
              this.x += 100 * this.speedMultiplier * dt;

              if (this.x > tileWidth * 9) {
                  this.randomizeSettings();
              }
          }

          // Random emeny bug
          randomizeSettings() {

              const sprites = [
                  'images/enemy-bug.png',
                  'images/enemy-bug-1.png',
                  'images/enemy-bug-2.png'
              ];

              const xStartPositions = [-tileWidth, -tileWidth * 2, -tileWidth * 3];

              const yStartPositions = [
                  tileHeight * 2,
                  tileHeight * 3,
                  tileHeight * 4,
                  tileHeight * 5,
                  tileHeight * 6
              ];

              this.x = xStartPositions[Math.floor(Math.random() * (3))];
              this.y = yStartPositions[Math.floor(Math.random() * (5))];
              this.speedMultiplier = Math.random() * (4 - 1) + 1;
              this.sprite = sprites[Math.floor(Math.random() * (3))];
          }
      }

      // Player
      class Player extends gameObject {
          constructor() {
              super();
              this.sprite = 'images/char-boy.png';
              this.xStartPosition = tileWidth * 4;
              this.yStartPosition = tileHeight * 7;
              this.x = this.xStartPosition;
              this.y = this.yStartPosition;
              this.active = false;
              this.hearts = 3;
              this.gemsCollected = 0;
          }

          getGem() {
              this.gemsCollected += 1;
              gemCountElement.innerHTML = (this.gemsCollected < 10) ? `0${this.gemsCollected}/${gemGoal}` : `${this.gemsCollected}/${gemGoal}`;

              // Clone gem sound to be able to play the sound multiple times in rapid succession
              let soundClone = gemSound.cloneNode();
              soundClone.play();

              // Add new enemy for every 10 gems collected
              switch (this.gemsCollected) {
                  case 10:
                  case 20:
                  case 30:
                  case 40:
                      allEnemies.push(new Enemy());
                      break;
                  case gemGoal:
                      endGame();
                      break;
              }
          }

          hide() {
              this.active = false;
              this.x = -tileWidth * 5;
              this.y = -tileHeight * 5;
          }

          die() {
              const self = this;
              deathSound.play();
              this.hearts -= 1;
              updateHeartCounter(this.hearts);
              this.hide();

              if (this.hearts === 0) {
                  endGame();
              } else {
                  setTimeout(() => self.reset(), 1000);
              }
          }

          reset() {
              this.x = this.xStartPosition;
              this.y = this.yStartPosition;
              this.active = true;
          }

          handleInput(key) {
              if (key === 'left') {
                  this.x -= (this.x > 0) ? tileWidth : 0;
              } else if (key === 'right') {
                  this.x += (this.x < (tileWidth * 8)) ? tileWidth : 0;
              } else if (key === 'up') {
                  this.y -= (this.y > tileHeight) ? tileHeight : 0;
              } else if (key === 'down') {
                  this.y += (this.y < (tileHeight * 7)) ? tileHeight : 0;
              }
          }
      }

      // Gem, Keys and Stars 
      class Gem extends gameObject {
          constructor() {
              super();
              this.sprite = 'images/Key.png';
              this.x = tileWidth * 4;
              this.y = tileHeight * 4;
          }

          randomizeSettings() {
              const sprites = ['images/Key.png', 'images/Star.png', 'images/gem-orange.png', 'images/gem-green.png', 'images/gem-blue.png']
              const xSpawnPositions = [
                  tileWidth,
                  tileWidth * 2,
                  tileWidth * 3,
                  tileWidth * 4,
                  tileWidth * 5,
                  tileWidth * 6,
                  tileWidth * 7,
              ];
              const ySpawnPositions = [
                  tileHeight * 2,
                  tileHeight * 3,
                  tileHeight * 4,
                  tileHeight * 5,
                  tileHeight * 6
              ];
              this.sprite = sprites[Math.floor(Math.random() * (5))];
              this.x = xSpawnPositions[Math.floor(Math.random() * (7))];
              this.y = ySpawnPositions[Math.floor(Math.random() * (5))];
          }
      }

      // Draw blood when player dies
      class Splatter extends gameObject {
          constructor() {
              super();
              this.sprite = 'images/blood3.png';
          }

          drawBlood() {
              const sprites = ['images/blood1.png', 'images/blood2.png', 'images/blood3.png'];
              this.sprite = sprites[(player.hearts - 1)];
              this.x = player.x;
              this.y = player.y;
          }
      }

      // Start Game
      function startGame() {
          const startScreen = document.querySelector('.info-screen');
          startScreen.classList.add('info-screen--disabled');
          gameStarted = true;
          player.active = true;
          gameTimer = setInterval(setTime, 1000);
      }

      // End Game
      function endGame() {
          let gameWon = false;
          clearInterval(gameTimer);

          if (player.gemsCollected >= gemGoal) {
              gameWinSound.play();
              player.hide();
              gameWon = true;
          } else {
              gameOverSound.play();
          }

          const score = calculateScore(player.gemsCollected, player.hearts, totalSeconds, gameWon);
          showScoreModal(score);
      }

      // Decrease heart when player dies 
      function updateHeartCounter(hearts) {
          if (hearts == 2) {
              heartCountElement.innerHTML = '<img src="images/Heart.png" alt=""><img src="images/Heart.png" alt="">';
          } else if (hearts == 1) {

              heartCountElement.innerHTML = '<img src="images/Heart.png" alt="">';
          } else {
              heartCountElement.innerHTML = '';
          }
      }

      // Calculate score
      function calculateScore(gems, hearts, seconds, gameWon) {
          let gemScore = gems * 100;
          let heartsScore = 0;
          let timeScore = 0;

          if (gameWon) {
              heartsScore = hearts * 2500;
              timeScore = 14000 - (seconds * 100);
              timeScore = (timeScore > 0) ? timeScore : 0;
          }

          return Math.floor(gemScore + heartsScore + timeScore);
      }

      // Show Modal when player won or losed
      function showScoreModal(score) {
          let message = 'Hey, at least you tried...';
          if (score >= 300 && score <= 500) {
              message = 'Everybody has to start somewhere';
          } else if (score >= 500 && score < 1000) {
              message = 'Well that didn\'t go so well';
          } else if (score >= 1000 && score < 2000) {
              message = 'Maybe a little more practice?';
          } else if (score >= 2000 && score < 3000) {
              message = 'I\'m sure you\'ll get the hang of it';
          } else if (score >= 3000 && score < 4000) {
              message = 'Ok, that wasn\'t too bad';
          } else if (score >= 4000 && score < 5000) {
              message = 'So close, give it another try!';
          } else if (score >= 5000 && score < 7500) {
              message = 'You made it! Can you do it faster?';
          } else if (score >= 7500 && score < 10000) {
              message = 'Nice! Now shave off some more seconds';
          } else if (score >= 10000 && score < 12500) {
              message = 'Great work, I can see you\'ve been training';
          } else if (score >= 12500 && score < 15000) {
              message = 'You\'re getting really good at this!';
          } else if (score >= 15000 && score < 17500) {
              message = 'Seriously impressive gem chasing!';
          } else if (score >= 17500 && score < 20500) {
              message = 'Wow! Not much room for improvement!';
          } else if (score >= 20500 && score < 22500) {
              message = 'You are a gem chasing god!!';
          } else if (score >= 22500) {
              message = 'You are now ranked as the #1 player in the world!';
          }

          const infoModalMarkup = `
		<h2 class="info-modal-heading">${message}</h2>
		<div class="info-modal-result">
			<h3 class="info-modal-score-heading">Final score</h3>
			<div class="info-modal-score">${score}</div>
			<button class="info-modal-button">Play again</button>
		</div>`,
              infoModal = document.createElement('div');

          infoModal.classList.add('info-modal');
          infoModal.innerHTML = infoModalMarkup;
          document.body.prepend(infoModal);
          setTimeout(() => infoModal.classList.add('info-modal-active'), 500);

          const resetButton = document.querySelector('.info-modal-button');
          resetButton.addEventListener('click', function() {
              resetGame();
          });
      }

      // Reset Game
      function resetGame() {
          window.location.reload(false);
      }

      /********* Timer from stackoverflow, https://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript *****/
      function setTime() {
          ++totalSeconds;
          secondsElement.innerHTML = pad(totalSeconds % 60);
          minutesElement.innerHTML = pad(parseInt(totalSeconds / 60));
      }

      function pad(val) {
          let valString = val + '';
          if (valString.length < 2) {
              return '0' + valString;
          } else {
              return valString;
          }
      }

      // Keys control
      document.addEventListener('keyup', function(e) {
          const controlKeys = {
              37: 'left',
              38: 'up',
              39: 'right',
              40: 'down',
              65: 'left',
              87: 'up',
              68: 'right',
              83: 'down'
          };

          if (player.active) {
              player.handleInput(controlKeys[e.keyCode]);
          }

      });

      let player = new Player(),
          gem = new Gem();

      let splatters = [];
      for (let i = 0; i < 3; i++) {
          splatters[i] = new Splatter();
      }

      let allEnemies = [];
      for (let i = 0; i < 6; i++) {
          allEnemies[i] = new Enemy();
      }


      // Select character active
      function character(e) {
          const chars = document.querySelector(".active");
          if (chars !== null) {
              chars.classList.remove("active");
          }
          e.target.className = "active";
          //define new player sprite according to choosen caracter
          let sprite = e.target.getAttribute("src");
          e.target.classList.add("active");
          document.querySelector(".start-game").addEventListener("click", function() {
              player.sprite = sprite;
              gameReady = true;
          });

      }

      const fadeOut = document.querySelector('.start-game'),
          charsParent = document.querySelector('#chars');
      fadeOut.addEventListener("click", function() {
          chars.classList.add("fade-out");
      });

      // Pause Game when info icon is clicked
      function pauseGame() {
          gameStarted = false;
          clearInterval(gameTimer);
      }


      //controls for on screen control buttons, adjusted also for touch devices.
      const upTouch = document.getElementById("up"),
          leftTouch = document.getElementById("left"),
          rightTouch = document.getElementById("right"),
          downTouch = document.getElementById("down");

      upTouch.addEventListener("click", function() {
          player.handleInput("up");
      });
      leftTouch.addEventListener("click", function() {
          player.handleInput("left");
      });
      rightTouch.addEventListener("click", function() {
          player.handleInput("right");
      });
      downTouch.addEventListener("click", function() {
          player.handleInput("down");
      });


      // Show and hide controls when click gamepad icon
      function controls() {
          var x = document.getElementById("controls");
          if (x.style.display === "block") {
              x.style.display = "none";
          } else {
              x.style.display = "block";
          }
      }

 // Loader before start game
      window.onload = window.setTimeout(function() {
          document.getElementById("loader").style.display = "none";
      }, 2000);
