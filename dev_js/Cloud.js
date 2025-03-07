import { Sprite } from "pixi.js"
import { CLOUDS } from "./constants"
import { tickerAdd } from "./engine/application"
import { sprites } from "./engine/loader"

export default class Cloud extends Sprite {
    constructor(textureIndex) {
        super(sprites.clouds.textures["cloud_" + textureIndex])
        this.anchor.set(0.5)

        this.scaleRateX = Math.random() < 0.5 ? -CLOUDS.scale : CLOUDS.scale
        this.scaleRateY = Math.random() < 0.5 ? -CLOUDS.scale : CLOUDS.scale
        this.angle = -30 

        this.minSpeed = CLOUDS.minSpeed
        this.maxSpeed = CLOUDS.maxSpeed
        this.minTempSpeed = 0

        this.speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed)
        this.speedX = this.speed * CLOUDS.speedRateX
        this.speedY = this.speed * CLOUDS.speedRateY

        this.isReady = false
        
        tickerAdd(this)
    }

    setSizes(width, height, scale) {
        if (!this.isReady) {
            this.position.set(Math.random() * width, Math.random() * height)
            this.isReady = true
        }

        this.scale.x = scale * this.scaleRateX
        this.scale.y = scale * this.scaleRateY

        const size = Math.ceil( Math.sqrt(this.width * this.width + this.height * this.height) * 0.5 )
        
        this.minX = -size
        this.minY = -size

        this.maxX = width + size
        this.maxY = height + size
    }

    tick( time ) {
        this.position.x += this.speedX * time.deltaMS
        this.position.y += this.speedY * time.deltaMS

        if (this.position.x > this.maxX || this.position.y < this.minY) {
            if (Math.random() < 0.5) {
                this.position.x = this.minX
                this.position.y = this.minY + Math.random() * this.maxY
            } else {
                this.position.x = this.minX + Math.random() * this.maxX
                this.position.y = this.maxY
            }
        }
    }
}