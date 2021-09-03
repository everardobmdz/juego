var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var vacunas;
var covids;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);


function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('vacuna', 'assets/vacuna.png');
    this.load.image('covid', 'assets/covid.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 43, frameHeight: 78 });
}

function create ()
{
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    vacunas = this.physics.add.group({
        key: 'vacuna',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    vacunas.children.iterate(function (child) {


        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    covids = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(vacunas, platforms);
    this.physics.add.collider(covids, platforms);

    this.physics.add.overlap(player, vacunas, collectvacuna, null, this);

    this.physics.add.collider(player, covids, hitcovid, null, this);
}

function update ()
{
    
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectvacuna (player, vacuna)
{
    vacuna.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (vacunas.countActive(true) === 0)
    {

        vacunas.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var covid = covids.create(x, 16, 'covid');
        covid.setBounce(1);
        covid.setCollideWorldBounds(true);
        covid.setVelocity(Phaser.Math.Between(-200, 200), 20);
        covid.allowGravity = false;

    }
}

function hitcovid (player, covid)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}