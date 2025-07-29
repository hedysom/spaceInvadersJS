const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Player {
    constructor(params) {
        const image = new Image()
        image.src = "img/spaceship.png"
        
        image.onload = () => {
            const scale = 0.15
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale

            //position the player at the bottom at half screen
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 10
            }
        }


        this.velocity = {
            x: 0,
            y: 0
        }


    }

    draw() {
        //c.fillStyle = "red"
        //c.fillRect(this.position.x, this.position.y, this.width, this.height)
        // call draw only if image finished loading
        if(this.image)
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        
    }

    update() {
        if(this.image){
            this.draw()
            this.position.x += this.velocity.x
        }
    }

}

const player = new Player()
const keys = {
    a : {
        pressed : "false"
    },
    s : {
        pressed : "false"
    },
    d : {
        pressed : "false"
    },
    w : {
        pressed : "false"
    }
}

//animate in loop (otherwise the image is not drawn at all, draw function is called 
// before the immage loads)
function animate() {
    requestAnimationFrame(animate)

    //background 
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = "black"

    //draw the player
    player.update()

    if(keys.a.pressed == true)
        player.velocity.x -= 5
    else
        player.velocity.x = 0
}

animate()

//movement for press down
addEventListener("keydown", ({key}) => {
    switch(key){
        case "a":
            console.log("a pressed down")
            keys.a.pressed = true
            break
        case "s":
            keys.s.pressed = true
            break
        case "d":
            keys.d.pressed = true
            break
        case "w":
            keys.w.pressed = true
            break
    }
})

//stop moving on press up
addEventListener("keyup", ({key}) => {
    switch(key){
        case "a":
            console.log("a pressed down")
            keys.a.pressed = false
            break
        case "s":
            keys.s.pressed = false
            break
        case "d":
            keys.d.pressed = false
            break
        case "w":
            keys.w.pressed = false
            break
    }
})