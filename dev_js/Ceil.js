import { Container, Sprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { ITEM_TYPES }  from "./constants"
import { EventHub, events } from './engine/events'

export default class Ceil extends Container {
    constructor(x, y, isBright) {
        super()
        const ceilName = 'ceil_' + Math.ceil(Math.random() * 3) + (isBright ? 'w' : 'b')
        this.ceil = new Sprite( sprites[ ceilName ] )
        this.ceil.anchor.set(0.5)
        this.addChild(this.ceil)

        this.isBright = isBright

        this.isOpen = true
        this.item = null

        this.restartIsOpen = true
        this.restartItem = null

        this.position.set(x, y)

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        if (this.item && this.item !== this.restartItem) {
            this.removeChild(this.item)
        }
        this.isOpen = this.restartIsOpen
        this.item = this.restartItem
        if (this.item) {
            this.addChild( this.item )
            this.item.position.set(0, 0)
        }
    }

    addItem(item, isStartOption = false) {
        if (item === null
        || item.type === ITEM_TYPES.target
        || item.type === ITEM_TYPES.key
        || item.type === ITEM_TYPES.gun
        || item.type === ITEM_TYPES.bot) {
            this.isOpen = true
        } else {
            this.isOpen = false
        }
        
        this.item = item
        this.addChild(this.item)

        if (isStartOption) {
            this.restartIsOpen = this.isOpen
            this.restartItem = item

            this.ceil.texture = sprites[ 'ceil_1' + (this.isBright ? 'w' : 'b') ]           
        }
    }

    removeItem() {
        if (!this.item) return null

        this.isOpen = true
        this.removeChild(this.item)
        const item = this.item
        item.position.set(this.position.x, this.position.y)
        this.item = null
        return item
    }

    getItem( inventory ) {
        if (this.item.type === ITEM_TYPES.gun) {
            const gun = this.removeItem()
            this.parent.addChild(gun)
            inventory.addItem(gun, 'gun')
        } else if (this.item.type === ITEM_TYPES.key) {
            const key = this.removeItem()
            this.parent.addChild(key)
            inventory.addItem(key, 'key_' + key.color)
        } else {
            console.warn('NO KEY OR GUN IN CEIL !!!')
        }
    }
}