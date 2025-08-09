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

  update({ velocity }) {
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

    this.width = columns * 30;

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
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //set vertical velocity to 0 so that the grid doesn't go indefinitely down
    this.velocity.y = 0;

    // side to side and down movement on every bounce
    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      //invert direction of movement
      this.velocity.x = -this.velocity.x;
      //go down
      this.velocity.y = 30;
    }
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

let frames = 1;
//for spwaning enemiest random invervals of frame from 500 to 1000
let randomInterval = Math.floor(Math.random() * 500 + 500);

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

  //invaders movement and colision detection
  grids.forEach((grid, k) => {
    grid.update();
    //change of vertical and horizontal directions for invaders
    //index i is for colision only
    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });

      //colision detection for projectiles
      projectiles.forEach((projectile, j) => {
        //vertical check top
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          //vertica check bottom
          projectile.position.y + projectile.radius >= invader.position.y &&
          //left side
          projectile.position.x + projectile.radius >= invader.position.x &&
          //right side
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width
        ) {
          //remove invader and the projectile
          setTimeout(() => {
            //check if the invader exists before slicing
            const invaderFound = grid.invaders.find(
              (invader2) => invader === invader2
            );
            //check if the projectile exists before slicing
            const projectileFound = projectiles.find(
              (projectile2) => projectile === projectile2
            );

            //call splice if both were found
            if (invaderFound && projectileFound) {
              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);
              if (grid.invaders.length > 0) {
                const firstIvader = grid.invaders[0];
                const lastIvader = grid.invaders[grid.invaders.length - 1];
                //update right side of the grid after removing a full column
                grid.width =
                  lastIvader.position.x -
                  firstIvader.position.x +
                  lastIvader.width;
                //update right side
                grid.position.x = firstIvader.position.x;
              } else {
                // if lenght is 0 (all invaders has been removed)
                //remove the grid that has been eliminated
                grids.splice(k, 1);
              }
            }
          }, 0);
        }
      });
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
  console.log(frames);
  //generate a new grid after a certain ammount of frames
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    frames = 1;
    randomInterval = Math.floor(Math.random() * 500 + 500);
  }

  frames++;
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
