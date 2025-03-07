import { AnimatedSprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { ITEM_TYPES } from "./constants"
import { EventHub, events } from './engine/events'

function getItemTexture(itemData) {
    if (itemData.type === ITEM_TYPES.key) {
        return sprites.keys.animations[itemData.color]
    }
    
    return sprites.gun.animations.gun
}

export default class Item extends AnimatedSprite {
    // itemData = {type, color}
    constructor(itemData, isCollected = false) {
        super( getItemTexture(itemData) )
        this.anchor.set(0.5, isCollected ? 0.5 : 0.7)
        this.animationSpeed = 0.75
        this.gotoAndPlay( Math.floor( Math.random() * this.textures.length ) )
        this.type = itemData.type
        if ("color" in itemData) this.color = itemData.color

        this.isCollectedOnRestart = isCollected

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        this.anchor.set(0.5, this.isCollectedOnRestart ? 0.5 : 0.7)
    }
}