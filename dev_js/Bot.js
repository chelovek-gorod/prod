import { AnimatedSprite, Container, Sprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { BOT_SPEED, DIRECTION, ACTIONS, ITEM_TYPES, CEIL_OFFSET, STONE_SPEED } from "./constants"
import { tickerAdd, tickerRemove } from "./engine/application"
import { EventHub, events, restart } from './engine/events'
import SmileCloud from "./SmileCloud"

export default class Bot extends Container {
    constructor(area, side, inventory) {
        super()
        this.type = ITEM_TYPES.bot

        this.startSide = side

        this.inventory = inventory

        this.shadow = new Sprite( sprites.bot_shadow )
        this.shadow.anchor.set(0.5, 0.9)
        this.shadow.scale.set(0.75)
        this.addChild(this.shadow)

        this.image = new AnimatedSprite(sprites.bot.animations["idle_" + side])
        this.image.anchor.set(0.5, 0.9)
        this.image.scale.set(0.75)
        this.addChild(this.image)

        this.timeout = null

        this.smile = new SmileCloud()
        this.addChild(this.smile)

        this.area = area.children

        this.side = side
        this.targetCeil = null
        this.targetX = 0
        this.targetY = 0

        this.speed = BOT_SPEED

        this.commands = []
        this.callback = null

        this.image.animationSpeed = 0.5
        this.image.loop = true
        this.image.play()

        EventHub.on( events.setCommands, this.setCommands, this )
    }

    setCommands( data ) {
        if (!("commands" in data) || !("callback" in data)) return
        if (!Array.isArray(data.commands) || data.commands.length === 0) return

        restart()
        clearTimeout( this.timeout )
        this.callback = null // !!! this.idle call callback if callback not null
        this.idle()
        this.smile.hide()

        this.commands = data.commands.reverse()
        this.callback = data.callback

        this.checkAction()
    }

    getTurnLeft( isToLeft) {
        switch( this.side ) {
            case DIRECTION.left : return isToLeft ? DIRECTION.down : DIRECTION.up
            case DIRECTION.right : return isToLeft ? DIRECTION.up : DIRECTION.down
            case DIRECTION.up : return isToLeft ? DIRECTION.left : DIRECTION.right
            case DIRECTION.down : return isToLeft ? DIRECTION.right : DIRECTION.left
        }
    }

    getTargetPoint(x, y) {
        const offset = CEIL_OFFSET[this.side]
        if (!offset) return null

        return this.area.find(p => p.x === x + offset.dx && p.y === y + offset.dy)
    }

    idle() {
        restart()

        this.commands = []
        this.smile.hide()

        tickerRemove(this)

        this.position.set(0, 0)
        this.side = this.startSide

        this.speed = BOT_SPEED

        this.commands = []

        this.image.textures = sprites.bot.animations["idle_" + this.side]
        this.image.loop = true
        this.image.play()
    }

    showSmile(isWin = false) {
        this.image.textures = sprites.bot.animations['smile_' + this.side]
        this.image.loop = false
        this.image.gotoAndPlay(0)
        this.image.onComplete = () => {
            this.smile.showSmile( isWin )
            if (!isWin) {
                this.timeout = setTimeout( () => this.idle(), 3000 )
            }
            if (this.callback) {
                this.callback( isWin )
            }
        }
    }

    checkAction() {// console.log('get action', this.commands.length ? this.commands[this.commands.length -1] : '[ ]' )
        const action = this.commands.pop()
        if (!action) {
            const isWin = (this.parent.item && this.parent.item.type === ITEM_TYPES.target)
            return this.showSmile(isWin)
        }

        if (action === ACTIONS.forward) this.useMove()
        else if (action === ACTIONS.pick_up) this.getItem()
        else if (action === ACTIONS.use_gun) this.useGun()
        else if (action === ACTIONS.use_key) this.useKey()
        else if (action === ACTIONS.move) this.moveStone()
        else if (action === ACTIONS.left || action === ACTIONS.right) this.useTurn(action)
        else {
            this.idle()
            console.warn('GET UNKNOWN ACTION:', action)
        }
    }

    getItem() {
        if (!this.parent.item) return this.showSmile(false)

        if (this.parent.item.type === ITEM_TYPES.gun || this.parent.item.type === ITEM_TYPES.key) {
            this.parent.getItem(this.inventory)

            return this.checkAction()
        }

        return this.showSmile(false)
    }

    showLight(color, callback) {
        const light = new AnimatedSprite(sprites.light.animations[color])
        let lightLayerIndex = 2
        if (this.side === DIRECTION.left || this.side === DIRECTION.up) {
            light.anchor.set(0.9, 1.5)
            const lightScaleX = this.side === DIRECTION.left ? 1 : -1
            light.scale.set(lightScaleX, 1)
            lightLayerIndex = 0
        } else {
            light.anchor.set(0.9, 0.25)
            const lightScaleX = this.side === DIRECTION.right ? -1 : 1
            light.scale.set(lightScaleX, -1)
        }

        light.loop = false
        light.animationSpeed = 0.25
        light.onComplete = () => {
            this.removeChild(light)
            light.destroy()
            callback()
        }
        this.addChildAt(light, lightLayerIndex)
        light.play()
    }

    useGun() {
        this.targetCeil = this.getTargetPoint(this.parent.position.x, this.parent.position.y)
        if (!this.targetCeil || !this.targetCeil.item || this.targetCeil.isOpen) return this.showSmile(false)

        if (this.targetCeil.item.type === ITEM_TYPES.monster) {
            // check gun
            if (!this.inventory.checkItem( ITEM_TYPES.gun )) return this.showSmile(false)

            this.showLight('purple', () => {
                this.targetCeil.item.getShut( () => this.checkAction() )
            })
            
            return
        }

        return this.showSmile(false)
    }

    useKey() {
        this.targetCeil = this.getTargetPoint(this.parent.position.x, this.parent.position.y)
        if (!this.targetCeil || !this.targetCeil.item || this.targetCeil.isOpen) return this.showSmile(false)

        if (this.targetCeil.item.type === ITEM_TYPES.door) {
            // check color
            const doorColor = this.targetCeil.item.color
            // check key
            if (!this.inventory.checkItem( 'key_' + doorColor )) return this.showSmile(false)

            this.showLight(doorColor, () => {
                this.targetCeil.item.open()
                this.checkAction()
            })
            
            return
        }

        return this.showSmile(false)
    }

    moveStone() {
        this.targetCeil = this.getTargetPoint(this.parent.position.x, this.parent.position.y)
        if (!this.targetCeil || !this.targetCeil.item || this.targetCeil.isOpen) return this.showSmile(false)

        if (this.targetCeil.item.type === ITEM_TYPES.stone) {
            const ceilAfterStone = this.getTargetPoint(this.targetCeil.x, this.targetCeil.y)

            // check that ceil exist and ceil without any items
            if (!ceilAfterStone || ceilAfterStone.item ) return this.showSmile(false)

            this.speed = STONE_SPEED
            this.image.loop = false
            this.image.textures = sprites.bot.animations["start_" + this.side]
            this.image.onComplete = () => {
                this.targetCeil.item.move( this.side, ceilAfterStone )
                this.startMove()
            }
            
            return this.image.gotoAndPlay(0)
        }

        return this.showSmile(false)
    }

    useTurn(side) {
        const turnSide = this.getTurnLeft( side === DIRECTION.left )
        this.image.textures = sprites.bot.animations[this.side + "_" + turnSide]
        
        this.side = turnSide
        this.image.loop = false
        this.image.gotoAndPlay(0)
        this.image.onComplete = () => this.checkAction()
    }

    useMove() {
        this.targetCeil = this.getTargetPoint(this.parent.position.x, this.parent.position.y)

        if (!this.targetCeil) return this.showSmile(false)
        if (!this.targetCeil.isOpen) return this.showSmile(false)

        this.image.loop = false
        this.image.textures = sprites.bot.animations["start_" + this.side]
        this.image.onComplete = this.startMove.bind(this)
        this.image.gotoAndPlay(0)
    }

    startMove() {
        if (CEIL_OFFSET[this.side].dy > 0) {
            this.parent.removeChild(this)
            this.targetCeil.addChild(this)
            this.targetX = 0
            this.targetY = 0
            this.position.set(-CEIL_OFFSET[this.side].dx, -CEIL_OFFSET[this.side].dy)
        } else {
            this.targetX = CEIL_OFFSET[this.side].dx
            this.targetY = CEIL_OFFSET[this.side].dy
        }

        tickerAdd(this)
        // this.image.onComplete = this.checkAction.bind(this)
    }

    endMove() {
        tickerRemove(this)

        this.speed = BOT_SPEED

        if (CEIL_OFFSET[this.side].dy < 0) {
            this.parent.removeChild(this)
            this.targetCeil.addChild(this)
            this.position.set(0, 0)
        }
        
        this.image.textures = sprites.bot.animations["stop_" + this.side]
        this.image.onComplete = this.checkAction.bind(this)
        this.image.gotoAndPlay(0)
    }

    tick(time) {
        switch( this.side ) {
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