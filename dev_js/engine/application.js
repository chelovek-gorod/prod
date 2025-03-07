import { Application } from 'pixi.js'
import { screenResize } from './events'

const isOnRightClickScreenshot = false

const canvas = document.getElementById("canva")
const appContainer = canvas.parentNode
canvas.remove()

const app = new Application()
const appSettings = {
    background: 0xffffff,
    antialias: true, // сглаживание
    resolution: 2,
    resizeTo: appContainer
}

Promise.all( [app.init( appSettings )] ).then( appReady )
function appReady() {
    app.ticker.add( time => tick(time) )
    appContainer.append( app.canvas )
    if (!isOnRightClickScreenshot) app.canvas.oncontextmenu = (event) => event.preventDefault()
    resize()
}

let tickerArr = [] // entities for update (need e.tick(delta) method)

const appScreen = {}

function resize() {
    appScreen.width = app.screen.width
    appScreen.height = app.screen.height
    appScreen.centerX = app.screen.width * 0.5
    appScreen.centerY = app.screen.height * 0.5
    appScreen.isLandscape = app.screen.width > app.screen.height

    screenResize( appScreen )
}

export function getAppScreen() {
    return appScreen
}

export function sceneAdd(element) {
    app.stage.addChild( element )
}

export function sceneRemove(element) {
    app.stage.removeChild( element )
}

export function sceneClear() {
    // need to test this function (forEach ? for destroyed element)
    app.stage.children.forEach( element => {
        app.stage.removeChild( element )
        element.destroy()
    })
}

let orientation = window.matchMedia("(orientation: portrait)");
orientation.addEventListener("change", () => setTimeout(resize, 0))
window.addEventListener('resize', () => setTimeout(resize, 0))

let isOnFocus = true
window.addEventListener('focus', () => focusOnChange(true))
window.addEventListener('blur', () => focusOnChange(false))
if ('hidden' in document) document.addEventListener('visibilitychange', visibilityOnChange)
function visibilityOnChange( isHide ) {
    isOnFocus = !isHide
}
function focusOnChange( isOn ) {
    isOnFocus = isOn
}

export function checkFocus() {
    return isOnFocus
}

let isTick = true

export function stopTicker() {
    isTick = false
}

export function startTicker() {
    isTick = true
}

function tick(time) {
    if (!isTick) return
    // if (delta = 1) -> FPS = 60 (16.66ms per frame)
    tickerArr.forEach( element => element.tick(time) )
    // time.elapsedMS - in milliseconds
    // time.deltaMS   - ???
    // time.deltaTime - in frame
}

export function tickerAdd( element ) {
    if ('tick' in element) tickerArr.push( element )
    else console.warn( 'TRY TO ADD ELEMENT IN TICKER WITHOUT .tick() METHOD:', element)
}

export function tickerRemove( element ) {
    tickerArr = tickerArr.filter( e => e !== element )
}