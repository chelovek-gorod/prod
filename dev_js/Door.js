import { AnimatedSprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { ITEM_TYPES } from "./constants"
import { EventHub, events } from './engine/events'

export default class Door extends AnimatedSprite {
    constructor(color, isLefRight) {
        //super(sprites.doors.animations[color + "_close"])
        //this.anchor.set(0.5, 0.8)
        //super(sprites['gate_' + color].animations['gate_' + color + '_open'])
        super(sprites['door_' + color].animations[(isLefRight) ? 'lock_left' : 'lock_right'])
        this.isLefRight = isLefRight
        this.anchor.set(0.52, 0.82)
        if (isLefRight) this.scale.set( -1 , 1 )
        this.color = color

        this.type = ITEM_TYPES.door
        this.isOpen = false

        this.animationSpeed = 0.1
        this.loop = true
        //this.gotoAndStop(0)
        this.play()

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        this.animationSpeed = 0.1
        this.isOpen = false
        this.loop = true
        this.textures = sprites['door_' + this.color].animations[(this.isLefRight) ? 'lock_left' : 'lock_right']
        //this.gotoAndStop(0)
        this.play()
    }

    open() {
        this.parent.isOpen = true
        this.animationSpeed = 0.5
        this.isOpen = true
        this.loop = false
        this.textures = sprites['door_' + this.color].animations.open
        this.gotoAndPlay(0)
    }
}