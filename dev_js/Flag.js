import { Container, Sprite, DisplacementFilter } from "pixi.js";
import { tickerAdd } from "./engine/application";
import { sprites } from "./engine/loader";


export default class Flag extends Container {
    constructor() {
        super()
        this.stem = new Sprite(sprites.flag_stem)
        this.stem.anchor.set(0.5, 0.92)
        this.addChild(this.stem)

        this.flag = new Sprite(sprites.flag_logo)
        this.flag.anchor.set(0, 0)
        this.flag.position.set(0, -160)
        this.addChild(this.flag)

        this.filterSprite = new Sprite(sprites.dpf_flag)
        this.filterSprite.scale = 2.5
        this.filterSprite.texture.source.style.addressMode = 'repeat'
        this.addChild(this.filterSprite)

        this.windEffectFilter = new DisplacementFilter(this.filterSprite)
        this.flag.filters = [this.windEffectFilter]

        tickerAdd(this)
    }

    tick(time) {
        this.filterSprite.position.x += time.elapsedMS * 0.5
        this.filterSprite.position.y += time.elapsedMS * 0.2
        //time.deltaTime * 0.3
    }
}