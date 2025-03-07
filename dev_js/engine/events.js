import { EventEmitter } from "pixi.js"

export const EventHub = new EventEmitter()

export const events = {
    screenResize: 'screenResize',

    setLevel: 'setLevel',
    setCommands: 'setCommands',
    restart: 'restart',
}

export function screenResize( data ) {
    EventHub.emit( events.screenResize, data )
}

export function setCommands( data ) {
    EventHub.emit( events.setCommands, data )
}
export function setLevel( data ) {
    EventHub.emit( events.setLevel, data )
}
export function restart( ) {
    EventHub.emit( events.restart )
}