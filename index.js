const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor(params) {
    const image = new Image();
    image.src = "img/spaceship.png";

    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;

      //position the player at the bottom at half screen
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 10,
      };
    };

    this.rotation = 0;

    this.velocity = {
      x: 0,
      y: 0,
    };
  }

  draw() {
    //rotation of the image in a very unintuitive way
    //the canvas is translated to the position of the player and then rotated on press
    c.save();
    c.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );
    c.rotate(player.rotation);

    //postion the canvas to back to it's original state
    c.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    );

    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    //restore the previously saved state
    c.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 4;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    c.strokeStyle = "red";
    c.stroke();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    const image = new Image();
    image.src = "img/invader.png";

    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;

      this.position = {
        x: position.x,
        y: position.y,
      };
    };

    this.velocity = {
      x: 0,
      y: 0,
    };
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update({velocity}) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };

    this.velocity = {
      x: 3,
      y: 0,
    };

    this.invaders = [];

    const columns = Math.floor(Math.random() * 10) + 5; 
    const rows = Math.floor(Math.random() * 5 + 2); //pick a random number of rows from 2 to 7

    this.width = columns * 30

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        this.invaders.push(
          new Invader({
            position: {
              x: i * 30,
              y: j * 30,
            },
          })
        );
      }
    }
  }

  update() {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if(this.position.x + this.width >= canvas.width || this.position.x <= 0 )
        this.velocity.x = -this.velocity.x
  }
}

const player = new Player();
const projectiles = [];
const grids = [new Grid()];

//currect status on keys
const keys = {
  a: {
    pressed: "false",
  },
  s: {
    pressed: "false",
  },
  d: {
    pressed: "false",
  },
  w: {
    pressed: "false",
  },
  space: {
    pressed: "false",
  },
};

//animate in loop (otherwise the image is not drawn at all, draw function is called
// before the immage loads)
function animate() {
  requestAnimationFrame(animate);

  //background
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "black";

  //draw the player
  player.update();

  //array with projectiles
  projectiles.forEach((projectile, index) => {
    //remove projectiles if they go out of the screen
    if (projectile.position.y <= 0) {
      projectiles.splice(index, 1);
      //otherwise update the ones still on the screen
    } else {
      projectile.update();
    }
  });

  grids.forEach((grid) => {
    grid.update();
    grid.invaders.forEach((invader) => {
      invader.update({velocity: grid.velocity});
    });
  });

  //check for a and d to be pressed, other conditions are for the player to not go
  //outside the screen
  if (keys.a.pressed == true && player.position.x >= 0) {
    player.velocity.x = -7;
    player.rotation = -0.15;
  } else if (
    keys.d.pressed == true &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }
}

animate();

//movement for press down
addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "s":
      keys.s.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case "w":
      keys.w.pressed = true;
      break;
    case " ":
      keys.w.pressed = true;
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10,
          },
        })
      );
      break;
  }
});

//stop moving on press up
addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case "w":
      keys.w.pressed = false;
      break;
    case " ":
      keys.w.pressed = false;
      break;
  }
});
