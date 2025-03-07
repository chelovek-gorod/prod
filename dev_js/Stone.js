import { AnimatedSprite, Sprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { DIRECTION, ITEM_TYPES, STONE_SPEED, CEIL_OFFSET } from "./constants"
import { EventHub, events } from './engine/events'
import { tickerAdd, tickerRemove } from "./engine/application"

const dustPoints = [
    {x: -40, y: 24},
    {x:  16, y: 48},
    {x: -16, y: 48},
    {x:  48, y: 16},
    {x: -56, y:  8},
    {x:   8, y: 56},
    {x: -32, y: 32},
    {x:  32, y: 32},
    {x:  -8, y: 56},
    {x:  56, y:  8},
    {x:   0, y: 64},
    {x: -48, y: 16},
    {x:  24, y: 40},
    {x: -24, y: 40},
    {x:  40, y: 24}
]

export default class Stone extends Sprite {
    constructor() {
        super(sprites.static_stone)
        this.anchor.set(0.5, 0.77)
        this.position.set(0, 0)

        this.type = ITEM_TYPES.stone

        this.targetX = 0
        this.targetY = 0
        this.targetCeil = null
        this.direction = ''

        this.dustTick = 0
        this.dustIndex = 0
        this.dustPerTicks = 6 // add dust per ticks

        this.speed = STONE_SPEED

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        tickerRemove(this)
        this.position.set(0, 0)
        this.targetX = 0
        this.targetY = 0
        this.targetCeil = null
        this.direction = ''
    }

    move( direction, ceil ) {
        this.direction = direction

        this.targetCeil = ceil

        if (CEIL_OFFSET[this.direction].dy > 0) {
            this.parent.removeItem()
            this.targetCeil.addItem(this)
            this.targetX = 0
            this.targetY = 0
            this.position.set(-CEIL_OFFSET[this.direction].dx, -CEIL_OFFSET[this.direction].dy)
        } else {
            this.targetX = CEIL_OFFSET[this.direction].dx
            this.targetY = CEIL_OFFSET[this.direction].dy
        }
        
        this.targetCeil.item = this

        tickerAdd(this)
    }

    endMove() {
        tickerRemove(this)

        if (CEIL_OFFSET[this.direction].dy < 0) {
            this.parent.removeItem()
            this.targetCeil.addItem(this)
            this.position.set(0, 0)
        }

        this.targetCeil = null
        this.direction = ''
    }

    addDust() {
        this.dustIndex++
        if (this.dustIndex === dustPoints.length) this.dustIndex = 0

        const stone_dust = new AnimatedSprite(sprites.stone_dust.animations.effect)
        stone_dust.scale.set(0.75)
        stone_dust.anchor.set(0.5, 1)
        stone_dust.position.set(
            this.position.x + dustPoints[this.dustIndex].x,
            this.position.y + dustPoints[this.dustIndex].y
        )

        stone_dust.animationSpeed = 0.25
        stone_dust.loop = false
        stone_dust.onComplete = () => stone_dust.destroy()
        stone_dust.play()
        this.parent.addChild(stone_dust)
    }

    tick(time) {
        this.dustTick++
        if (this.dustTick === this.dustPerTicks) {
            this.dustTick = 0
            this.addDust()
        } 

        switch( this.direction ) {
            case DIRECTION.left:
                this.position.x -= this.speed * time.deltaMS
                this.position.y -= this.speed * 0.5 * time.deltaMS
                if (this.position.x <= this.targetX) return this.endMove()
                break
            case DIRECTION.right:
                this.position.x += this.speed * time.deltaMS
                this.position.y += this.speed * 0.5 * time.deltaMS
                if (this.position.x >= this.targetX) return this.endMove()
                break
            case DIRECTION.up:
                this.position.x += this.speed * time.deltaMS
                this.position.y -= this.speed * 0.5 * time.deltaMS
                if (this.position.y <= this.targetY) return this.endMove()
                break
            case DIRECTION.down:
                this.position.x -= this.speed * time.deltaMS
                this.position.y += this.speed * 0.5 * time.deltaMS
                if (this.position.y >= this.targetY) return this.endMove()
                break
        }
    }
}