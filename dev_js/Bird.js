import { AnimatedSprite } from "pixi.js"
import { tickerAdd, tickerRemove } from "./engine/application"
import { sprites } from "./engine/loader"

export default class Bird extends AnimatedSprite {
    constructor(x, y) {
        super(sprites.bird.animations.fly)
        this.anchor.set(0.25, 0.85)
        this.position.set(x, y)
        this.alpha = 0
        this.alphaStep = 0.002
        this.speed = 0.3
        this.speedX = this.speed * 0.5
        this.speedY = this.speed * 0.3

        this.animationSpeed = 1
        this.play()

        tickerAdd(this)
    }

    tick( time ) {
        this.position.x -= this.speedX * time.deltaMS
        this.position.y -= this.speedY * time.deltaMS

        if (this.alpha < 1) {
            this.alpha += this.alphaStep * time.deltaMS
        }

        if (this.position.x < -this.width || this.position.y < -this.height) {
            tickerRemove(this)
            this.destroy()
        }
    }
}