import { Container, Graphics, Text } from 'pixi.js'
import { textStyles } from './fonts'
import { getAppScreen, sceneAdd, sceneRemove } from './application'
import { EventHub, events } from './events'

const settings = {
    width: 270,
    height: 90,
}
settings.halfWidth = settings.width / 2
settings.halfHeight = settings.height / 2
settings.sidePoints = 100 / 8 // 12.5% in half side
settings.stepH = settings.halfWidth / settings.sidePoints
settings.stepV = settings.halfHeight / settings.sidePoints

class LoadingBar extends Container {
    constructor() {
        super()

        this.text = new Text({
            text:'Загрузка: 0%',
            style:textStyles.loading
        })
        this.text.anchor.set(0.5, 1)
        this.text.position.y = 10
        this.addChild(this.text)

        this.screenResize( getAppScreen() )
        EventHub.on( events.screenResize, this.screenResize, this )

        sceneAdd(this)
    }

    delete() {
        EventHub.off( events.screenResize, this.screenResize, this )
        this.removeAllListeners()
        sceneRemove(this)
        this.destroy()
    }

    screenResize(screenData) {
        this.position.x = screenData.centerX
        this.position.y = screenData.centerY
    }

    update(progress) {
        const range = Math.round(progress)
        this.text.text = 'Загрузка: ' + range + '%'
    }
}

export default LoadingBar