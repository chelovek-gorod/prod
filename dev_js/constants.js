export const CEIL_SIZE = 128
export const CEIL_HALF_SIZE = Math.round(CEIL_SIZE * 0.5)
export const CEIL_QUARTER_SIZE = Math.round(CEIL_HALF_SIZE * 0.5)
export const INVENTORY_SLOTS = 5
export const INVENTORY_CEIL_SIZE = CEIL_SIZE
export const INVENTORY_WIDTH = INVENTORY_SLOTS * INVENTORY_CEIL_SIZE
export const MAP_OFFSET = CEIL_SIZE
export const MAP_OFFSET_TOP = MAP_OFFSET * 2 + INVENTORY_CEIL_SIZE

export const BOT_SPEED = 0.1
export const STONE_SPEED = 0.04
export const DIRECTION = {
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down'
}
export const ACTIONS = {
    left: 'left',
    right: 'right',
    forward: 'forward',
    
    move: 'move',
    pick_up: 'pick_up',
    use_key: 'use_key',
    use_gun: 'use',
}
export const CEIL_OFFSET = {
    [DIRECTION.left]: { dx: -CEIL_HALF_SIZE, dy: -CEIL_QUARTER_SIZE },
    [DIRECTION.right]: { dx: CEIL_HALF_SIZE, dy: CEIL_QUARTER_SIZE },
    [DIRECTION.up]: { dx: CEIL_HALF_SIZE, dy: -CEIL_QUARTER_SIZE },
    [DIRECTION.down]: { dx: -CEIL_HALF_SIZE, dy: CEIL_QUARTER_SIZE },
}
export const ITEM_TYPES = {
    bot: 'bot',
    door: 'door',
    key: 'key',
    target: 'target',
    gun: 'gun',
    monster: 'monster',
    stone: 'stone'
}
export const KEY_COLORS = {
    red: 'red',
    yellow: 'yellow',
    green: 'green',
    blue: 'blue'
}
export const KEY_COLORS_INDEX = {
    1: KEY_COLORS.red,
    2: KEY_COLORS.yellow,
    3: KEY_COLORS.green,
    4: KEY_COLORS.blue
}

export const CLOUDS = {
    scale: 0.8,
    count: 40,
    minSpeed: 0.03,
    maxSpeed: 0.06,
    speedRateX: 0.6,
    speedRateY: -0.3
}