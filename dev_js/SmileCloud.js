import { Sprite } from "pixi.js";
import { tickerAdd, tickerRemove } from "./engine/application";
import { sprites } from "./engine/loader";


class SmileCloud extends Sprite {
    constructor() {
        super(sprites.smile_lose)
        this.anchor.set(0.5, 1.7)
        this.scale.set(0)
        this.scaleStep = 0.001
        this.maxScale = 0.75
        this.alpha = 0
        this.stepAlpha = this.scaleStep / this.maxScale
    }

    hide() {
        this.scale.set(0)
        this.alpha = 0
        tickerRemove(this)
    }

    showSmile(isWin = true) {
        this.texture = isWin ? sprites.smile_win : sprites.smile_lose
        tickerAdd(this)
    }

    tick(time) {
        const scale = this.scale.x + this.scaleStep * time.elapsedMS
        this.scale.set(scale)
        this.alpha += this.stepAlpha * time.elapsedMS
        if (this.scale.x >= this.maxScale) {
            this.scale.set(this.maxScale)
            this.alpha = 1
            tickerRemove(this)
        }

    }
}

export default SmileCloud