import { AnimatedSprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { tickerAdd, tickerRemove } from "./engine/application"
import { EventHub, events } from './engine/events'
import { ITEM_TYPES } from "./constants"
import Explosion from "./Explosion"
import Bird from "./Bird"

export default class Monster extends AnimatedSprite {
    constructor(side) {
        super(sprites.monster.animations.idle)
        if (side < 3) this.scale.set(-1, 1)
        this.anchor.set(0.5, 0.87)
        this.animationSpeed = 0.5
        this.play()

        this.type = ITEM_TYPES.monster
        this.callback = null

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        tickerRemove(this)
        this.alpha = 1
    }

    getShut(callback) {
        this.callback = callback
        tickerAdd(this)
        this.parent.parent.addChild( new Bird(this.parent.position.x, this.parent.position.y) )
        this.parent.parent.addChild( new Explosion(this.parent.position.x, this.parent.position.y) )
    }

    tick(time) {
        this.alpha -= 0.002 * time.deltaMS
        if (this.alpha <= 0) {
            this.alpha = 0
            tickerRemove(this)
            this.parent.removeItem( this )
            if (this.callback) {
                this.callback()
                this.callback = null
            }
        }
    }
}