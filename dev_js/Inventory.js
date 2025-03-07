import { Container, Sprite } from "pixi.js"
import { EventHub, events } from './engine/events'
import { tickerAdd } from "./engine/application"
import { sprites } from "./engine/loader"
import Item from "./Item"
import { CEIL_SIZE, KEY_COLORS, ITEM_TYPES, INVENTORY_SLOTS, INVENTORY_WIDTH, INVENTORY_CEIL_SIZE }  from "./constants"

export default class Inventory extends Container {
    constructor(items_list) {
        super()

        this.restartSlots = [] // items names that get at start
        this.slots = [] // items names
        this.slotsPoints = [] // {x, y}

        this.collectedItems = [] // just collected items, that moving to own slots points (in ticker)
        this.itemsTargetX = 0 // moving to slots points x
        this.itemsTargetY = CEIL_SIZE // moving to slots points y

        const startSlotX = (INVENTORY_CEIL_SIZE - INVENTORY_WIDTH) * 0.5
        const startSlotY = INVENTORY_CEIL_SIZE * 0.5
        for (var i = 0; i < INVENTORY_SLOTS; i++) {
            const slotX = startSlotX + i * INVENTORY_CEIL_SIZE

            const slot = new Sprite(sprites.inventory_box)
            slot.anchor.set(0.5)
            slot.position.set(slotX, startSlotY)
            this.addChild( slot )
            this.slotsPoints.push( {x: slotX, y: startSlotY} )
        }

        items_list.forEach( itemName => {
            if (itemName.indexOf('key') > -1) {
                for( let color in KEY_COLORS) {
                    if (itemName.indexOf(color) === 4) {
                        const key = new Item( {
                            type: ITEM_TYPES.key,
                            color: color,
                            textures: sprites.keys.animations[color]
                        }, true)
                        key.position.set(
                            this.slotsPoints[this.slots.length].x, this.slotsPoints[this.slots.length].y
                        )
                        this.addChild( key )

                        this.restartSlots.push('key_' + color)
                        this.slots.push('key_' + color)
                    }
                }
            }
            if (itemName === 'gun') {
                const gun = new Item( {
                    type: ITEM_TYPES.gun,
                    textures: sprites.gun.animations.gun
                }, true)
                gun.position.set(
                    this.slotsPoints[this.slots.length].x, this.slotsPoints[this.slots.length].y
                )
                this.addChild( gun )

                this.restartSlots.push('gun')
                this.slots.push('gun')
            }
        })

        tickerAdd(this)

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        this.slots = [...this.restartSlots]
        this.collectedItems = []
    }

    addItem( item, item_name ) {
        if (this.checkItem(item_name)) {
            item.targetPoint = null
        } else {
            item.targetPoint = {
                x: this.slotsPoints[this.slots.length].x,
                y: this.slotsPoints[this.slots.length].y
            }
            this.slots.push(item_name)
        }

        this.collectedItems.push( item )
        
        item.moveRate = {
            x: (this.itemsTargetX - item.x) / 600,
            y: (this.itemsTargetY - item.y) / 600
        }
    }

    checkItem( item_name ) {
        return (this.slots.indexOf(item_name) > -1)
    }

    tick(time) {
        if (this.collectedItems.length === 0) return

        this.collectedItems.forEach( item => {
            if(item.x < this.itemsTargetX) {
                item.position.x += item.moveRate.x * time.deltaMS
                if (item.x >= this.itemsTargetX) item.position.x = this.itemsTargetX
            }
            else if(item.x > this.itemsTargetX) {
                item.position.x += item.moveRate.x * time.deltaMS
                if (item.x <= this.itemsTargetX) item.position.x = this.itemsTargetX
            }

            if(item.y > this.itemsTargetY) {
                item.position.y += item.moveRate.y * time.deltaMS
                if (item.y <= this.itemsTargetY) item.position.y = this.itemsTargetY
            }

            // add item in slots
            if (item.x === this.itemsTargetX && item.y === this.itemsTargetY) {
                item.parent.removeChild( item )
                if (item.targetPoint) {
                    this.addChild(item)
                    item.position.set(item.targetPoint.x, item.targetPoint.y)
                    item.anchor.set(0.5)
                    item.targetPoint = null
                }
                this.collectedItems = this.collectedItems.filter(collectedItem => collectedItem !== item)
            }
        })
    }
}
