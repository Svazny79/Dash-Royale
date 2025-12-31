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

    if (selectedCard === 'fireball') {
      castFireball(this, pointer.x, pointer.y);
      return;
    }

    spawnTroop(this, pointer.x, pointer.y, selectedCard);
  });
}

function update() {
  troops.forEach(t => {
    if (!t.active) return;
    t.y -= t.type === 'archer' ? 0.7 : 0.5;
    updateHPBar(t);

    towers.forEach(tower => {
      if (!tower.active) return;
      if (Phaser.Math.Distance.Between(t.x, t.y, tower.x, tower.y) < 40) {
        damageTower(tower, 2);
      }
    });
  });
}

// -------- GAME LOGIC --------

function spawnTroop(scene, x, y, type) {
  const troop = scene.add.image(x, y, type).setScale(0.45);
  troop.type = type;
  troop.hp = type === 'knight' ? 600 : 300;
  troop.maxHp = troop.hp;
  troop.bar = createHPBar(scene, troop);
  troops.push(troop);
}

function createTower(scene, x, y, texture, hp) {
  const tower = scene.add.image(x, y, texture);
  tower.hp = hp;
  tower.maxHp = hp;
  tower.bar = createHPBar(scene, tower);
  return tower;
}

function createHPBar(scene, obj) {
  const bar = scene.add.graphics();
  obj.bar = bar;
  return bar;
}

function updateHPBar(obj) {
  obj.bar.clear();
  const pct = obj.hp / obj.maxHp;
  obj.bar.fillStyle(0xff0000);
  obj.bar.fillRect(obj.x - 20, obj.y - 40, 40 * pct, 5);
}

function damageTower(tower, dmg) {
  tower.hp -= dmg;
  updateHPBar(tower);

  if (tower.hp <= 0) {
    tower.destroy();
    checkWin();
  }
}

function castFireball(scene, x, y) {
  const fb = scene.add.image(x, y, 'fireball').setScale(0.4);
  setTimeout(() => {
    towers.forEach(t => {
      if (t.active && Phaser.Math.Distance.Between(x, y, t.x, t.y) < 80) {
        t.hp -= 400;
        updateHPBar(t);
      }
    });
    fb.destroy();
  }, 300);
}

// -------- UI --------

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
    document.getElementById('result').innerText =
      "🏆 YOU WIN! +30 TROPHIES";
  }
}
