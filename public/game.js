const socket = io();
let elixir = 10;
let selectedCard = null;

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  backgroundColor: '#2e7d32',
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let towers = [];
let troops = [];

function preload() {
  this.load.image('knight', 'assets/knight.png');
  this.load.image('tower', 'assets/tower.png');
}

function create() {
  // Towers
  towers.push(this.add.image(450, 50, 'tower').setData('hp', 3000));
  towers.push(this.add.image(450, 550, 'tower').setData('hp', 3000));

  // Click deploy
  this.input.on('pointerdown', (pointer) => {
    if (!selectedCard) return;
    socket.emit('spawnTroop', {
      x: pointer.x,
      y: pointer.y,
      type: selectedCard
    });
  });

  socket.on('spawnTroop', data => {
    const troop = this.add.image(data.x, data.y, data.type)
      .setScale(0.5)
      .setData({ hp: 500, target: towers[0] });
    troops.push(troop);
  });
}

function update() {
  troops.forEach(troop => {
    if (!troop.active) return;
    troop.y -= 0.5;

    towers.forEach(tower => {
      if (Phaser.Math.Distance.Between(
        troop.x, troop.y, tower.x, tower.y) < 40) {

        tower.setData('hp', tower.getData('hp') - 1);
        if (tower.getData('hp') <= 0) {
          tower.destroy();
        }
      }
    });
  });
}

// Card play
window.playCard = (type, cost) => {
  if (elixir < cost) return;
  elixir -= cost;
  selectedCard = type;
  document.getElementById('elixir').innerText = "Elixir: " + elixir;
};

// Elixir regen
setInterval(() => {
  if (elixir < 10) {
    elixir++;
    document.getElementById('elixir').innerText = "Elixir: " + elixir;
  }
}, 1000);


