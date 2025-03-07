import { AnimatedSprite } from "pixi.js";
import { sprites } from "./engine/loader";


class Explosion extends AnimatedSprite {
    constructor(x, y) {
        super(sprites.explosion.animations.explosion)
        this.anchor.set(0.5, 0.75)
        this.position.set(x, y)
        this.animationSpeed = 0.5
        this.loop = false
        this.play()
        this.onComplete = () => {
            this.destroy()
        }
    }
}

export default Explosion