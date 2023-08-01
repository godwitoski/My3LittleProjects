const amount_diamonds = 30;
const AMOUNT_BOOBLES = 30;
GamePlayManager = {
  init: function () {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    this.flagFirstMouseDown = false;
    this.amountDiamondsCaught = 0;
    this.endGame = false;
    this.countSmile = -1;
  },
  preload: function () {
    game.load.image("background", "./assets/images/background.png");
    game.load.spritesheet("horse", "./assets/images/horse.png", 84, 156, 2);
    game.load.spritesheet(
      "diamonds",
      "./assets/images/diamonds.png",
      81,
      84,
      4
    );

    game.load.image("explosion", "./assets/images/explosion.png");
    game.load.image("shark", "assets/images/shark.png");
    game.load.image("fishes", "assets/images/fishes.png");
    game.load.image("mollusk", "assets/images/mollusk.png");

    game.load.image("booble1", "assets/images/booble1.png");
    game.load.image("booble2", "assets/images/booble2.png");
  },
  create: function () {
    game.add.sprite(0, 0, "background");

    this.boobleArray = [];
    for (let i = 0; i < AMOUNT_BOOBLES; i++) {
      let xBooble = game.rnd.integerInRange(1, 1140);
      let yBooble = game.rnd.integerInRange(600, 950);

      let booble = game.add.sprite(
        xBooble,
        yBooble,
        "booble" + game.rnd.integerInRange(1, 2)
      );
      booble.vel = 0.2 + game.rnd.frac() * 2;
      booble.alpha = 0.9;
      booble.scale.setTo(0.2 + game.rnd.frac());
      this.boobleArray[i] = booble;
    }

    this.mollusk = game.add.sprite(500, 150, "mollusk");
    this.shark = game.add.sprite(500, 20, "shark");
    this.fishes = game.add.sprite(100, 550, "fishes");

    this.horse = game.add.sprite(0, 0, "horse");
    this.horse.frame = 0;
    this.horse.x = game.width / 2;
    this.horse.y = game.height / 2;
    this.horse.anchor.setTo(0.5);

    game.input.onDown.add(this.onTap, this);

    this.diamonds = [];
    for (let i = 0; i < amount_diamonds; i++) {
      let diamond = game.add.sprite(100, 100, "diamonds");
      diamond.frame = game.rnd.integerInRange(0, 3);
      diamond.scale.setTo(0.3 + game.rnd.frac());
      diamond.anchor.setTo(0.5);
      diamond.x = game.rnd.integerInRange(50, 1050);
      diamond.y = game.rnd.integerInRange(50, 600);

      this.diamonds[i] = diamond;
      let rectCurrentDiamond = this.getBoundsDiamod(diamond);
      let rectHorse = this.getBoundsDiamod(this.horse);

      while (
        this.isOverlapingOtherDiamond(i, rectCurrentDiamond) ||
        this.isRectanglesOverlapping(rectHorse, rectCurrentDiamond)
      ) {
        diamond.x = game.rnd.integerInRange(50, 1050);
        diamond.y = game.rnd.integerInRange(50, 600);
        rectCurrentDiamond = this.getBoundsDiamod(diamond);
      }
    }

    this.explosionGroup = game.add.group();

    for (let i = 0; i < 10; i++) {
      this.explosion = this.explosionGroup.create(100, 100, "explosion");
      this.explosion.tweenScale = game.add.tween(this.explosion.scale).to(
        {
          x: [0.4, 0.8, 0.4],
          y: [0.4, 0.8, 0.4],
        },
        600,
        Phaser.Easing.Exponential.Out,
        false,
        0,
        0,
        false
      );

      this.explosion.tweenAlpha = game.add.tween(this.explosion).to(
        {
          alpha: [1, 0.6, 0],
        },
        600,
        Phaser.Easing.Exponential.Out,
        false,
        0,
        0,
        false
      );

      this.explosion.anchor.setTo(0.5);
      this.explosion.kill();
    }

    this.currentScore = 0;

    const style = {
      font: "bold 30pt Arial",
      fill: "#fff",
      aligne: "center",
    };
    this.scoreText = game.add.text(game.width / 2, 40, "0", style);
    this.scoreText.anchor.setTo(0.5);

    this.totalTime = 30;
    this.timerText = game.add.text(1000, 40, this.totalTime + "", style);
    this.timerText.anchor.setTo(0.5);

    this.timerGamOver = game.time.events.loop(
      Phaser.Timer.SECOND,
      function () {
        if (this.flagFirstMouseDown) {
          this.totalTime--;
          this.timerText.text = this.totalTime + "";
          if (this.totalTime <= 0) {
            game.time.events.remove(this.timerGamOver);
            this.endGame = true;
            this.showFinalMessage("GAME OVER");
          }
        }
      },
      this
    );
  },
  increaseScore: function () {
    this.countSmile = 0;
    this.horse.frame = 1;

    this.currentScore += 100;
    this.scoreText.text = this.currentScore;

    this.amountDiamondsCaught += 1;
    if (this.amountDiamondsCaught >= amount_diamonds) {
      game.time.events.remove(this.timerGamOver);
      this.endGame = true;
      this.showFinalMessage("CONGRATULATIONS");
    }
  },
  showFinalMessage: function (msg) {
    this.tweenMollusk.stop();
    const bgAlpha = game.add.bitmapData(game.width, game.height);
    bgAlpha.ctx.fillStyle = "#000";
    bgAlpha.ctx.fillRect(0, 0, game.width, game.height);

    const bg = game.add.sprite(0, 0, bgAlpha);
    bg.alpha = 0.5;

    const style = {
      font: "bold 60pt Arial",
      fill: "#fff",
      aligne: "center",
    };

    this.textFieldFinalMsg = game.add.text(
      game.width / 2,
      game.height / 2,
      msg,
      style
    );
    this.textFieldFinalMsg.anchor.setTo(0.5);
  },

  onTap: function () {
    if (!this.flagFirstMouseDown) {
      this.tweenMollusk = game.add
        .tween(this.mollusk.position)
        .to({ y: -0.001 }, 5800, Phaser.Easing.Cubic.InOut, true, 0, 1000, true)
        .loop(true);
    }
    this.flagFirstMouseDown = true;
  },
  getBoundsDiamod: function (currentDiamond) {
    return new Phaser.Rectangle(
      currentDiamond.left,
      currentDiamond.top,
      currentDiamond.width,
      currentDiamond.height
    );
  },
  isRectanglesOverlapping: function (rect1, rect2) {
    if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
      return false;
    }
    if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
      return false;
    }
    return true;
  },
  isOverlapingOtherDiamond: function (index, rect2) {
    for (let i = 0; i < index; i++) {
      let rect1 = this.getBoundsDiamod(this.diamonds[i]);
      if (this.isRectanglesOverlapping(rect1, rect2)) {
        return true;
      }
    }
    return false;
  },
  getBoundsHorse: function () {
    let x0 = this.horse.x - Math.abs(this.horse.width) / 4;
    let width = Math.abs(this.horse.width) / 2;
    let y0 = this.horse.y - this.horse.height / 2;
    let height = this.horse.height;

    return new Phaser.Rectangle(x0, y0, width, height);
  },
  render: function () {
    game.debug.sprite;
  },
  update: function () {
    if (this.flagFirstMouseDown && !this.endGame) {
      for (let i = 0; i < AMOUNT_BOOBLES; i++) {
        let booble = this.boobleArray[i];
        booble.y -= booble.vel;
        if (booble.y < -50) {
          booble.y = 700;
          booble.x = game.rnd.integerInRange(1, 1140);
        }
      }

      if (this.countSmile >= 0) {
        this.countSmile++;
        if (this.countSmile > 50) {
          this.countSmile = -1;
          this.horse.frame = 0;
        }
      }

      this.shark.x--;
      if (this.shark.x < -300) {
        this.shark.x = 1300;
      }

      this.fishes.x += 0.3;
      if (this.fishes.x > 1300) {
        this.fishes.x = -300;
      }

      let pointerX = game.input.x;
      let pointerY = game.input.y;

      let distXHorse = pointerX - this.horse.x;
      let distYHorse = pointerY - this.horse.y;

      if (distXHorse > 0) {
        this.horse.scale.setTo(1, 1);
      } else {
        this.horse.scale.setTo(-1, 1);
      }
      this.horse.x += distXHorse * 0.02;
      this.horse.y += distYHorse * 0.02;

      for (let i = 0; i < amount_diamonds; i++) {
        let rectHorse = this.getBoundsHorse();
        let rectDiamond = this.getBoundsDiamod(this.diamonds[i]);

        if (
          this.diamonds[i].visible &&
          this.isRectanglesOverlapping(rectHorse, rectDiamond)
        ) {
          this.increaseScore();

          this.diamonds[i].visible = false;

          let explosion = this.explosionGroup.getFirstDead();
          if (explosion != null) {
            explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
            explosion.tweenScale.start();
            explosion.tweenAlpha.start();

            explosion.tweenAlpha.onComplete.add(function (
              currenTarget,
              currentTween
            ) {
              currenTarget.kill();
            },
            this);
          }
        }
      }
    }
  },
};

let game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");
