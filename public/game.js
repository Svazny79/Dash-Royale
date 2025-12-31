const socket = io();
let elixir = 10;
let selectedCard = null;
let gameOver = false;

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  backgroundColor: '#2e7d32',
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let troops = [];
let towers = [];

function preload() {
  this.load.image('knight', 'assets/knight.png');
  this.load.image('archer', 'assets/archer.png');
  this.load.image('fireball', 'assets/fireball.png');
  this.load.image('crown', 'assets/crown.png');
  this.load.image('king', 'assets/king.png');
}

function create() {
  // Crown Towers
  towers.push(createTower(this, 250, 520, 'crown', 2000));
  towers.push(createTower(this, 650, 520, 'crown', 2000));

  // King Tower
  towers.push(createTower(this, 450, 560, 'king', 3500));

  this.input.on('pointerdown', pointer => {
    if (!selectedCard || gameOver) return;

    socket.emit('playCard', {
      type: selectedCard,
      x: pointer.x,
      y: pointer.y
    });
  });

  socket.on('playCard', data => {
    if (data.type === 'fireball') {
      castFireball(this, data.x, data.y);
      return;
    }

    const troop = this.add.image(data.x, data.y, data.type)
      .setScale(0.45)
      .setData({ hp: data.type === 'knight' ? 600 : 300 });

    troop.bar = createHPBar(this, troop);
    troops.push(troop);
  });
}

function update() {
  troops.forEach(t => {
    if (!t.active) return;
    t.y -= t.texture.key === 'archer' ? 0.7 : 0.5;
    updateHPBar(t);

    towers.forEach(tower => {
      if (!tower.active) return;
      if (Phaser.Math.Distance.Between(t.x, t.y, tower.x, tower.y) < 40) {
        damageTower(tower, 2);
      }
    });
  });
}

// ---------------- HELPERS ----------------

function createTower(scene, x, y, texture, hp) {
  const tower = scene.add.image(x, y, texture).setData('hp', hp);
  tower.maxHp = hp;
  tower.bar = createHPBar(scene, tower);
  return tower;
}

function createHPBar(scene, obj) {
  const bar = scene.add.graphics();
  bar.fillStyle(0xff0000);
  bar.fillRect(-20, -35, 40, 5);
  obj.add(bar);
  return bar;
}

function updateHPBar(obj) {
  obj.bar.clear();
  const pct = obj.getData('hp') / obj.maxHp;
  obj.bar.fillStyle(0xff0000);
  obj.bar.fillRect(-20, -35, 40 * pct, 5);
}

function damageTower(tower, dmg) {
  tower.setData('hp', tower.getData('hp') - dmg);
  updateHPBar(tower);

  if (tower.getData('hp') <= 0) {
    tower.destroy();
    checkWin();
  }
}

function castFireball(scene, x, y) {
  const fb = scene.add.image(x, y, 'fireball').setScale(0.4);
  setTimeout(() => {
    towers.forEach(t => {
      if (t.active && Phaser.Math.Distance.Between(x, y, t.x, t.y) < 80) {
        damageTower(t, 400);
      }
    });
    fb.destroy();
  }, 300);
}

// ---------------- UI ----------------

window.playCard = (type, cost) => {
  if (elixir < cost || gameOver) return;
  elixir -= cost;
  selectedCard = type;
  document.getElementById('elixir').innerText = "Elixir: " + elixir;
};

setInterval(() => {
  if (elixir < 10 && !gameOver) {
    elixir++;
    document.getElementById('elixir').innerText = "Elixir: " + elixir;
  }
}, 1000);

function checkWin() {
  const kingAlive = towers.some(t => t.texture?.key === 'king');
  if (!kingAlive) {
    gameOver = true;
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').innerText = "🏆 YOU WIN! +30 TROPHIES";
  }
}
