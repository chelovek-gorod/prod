import { Assets } from 'pixi.js'
import LoadingBar from './LoadingBar'

const paths = {
    sprites : './sprites/',
    fonts : './fonts/',
}

export const sprites = {
    flag_stem: 'flag_stem.webp',
    flag_logo: 'flag_logo.webp',
    dpf_flag: 'dpf_flag.webp',

    bg_1: 'n3.webp',

    bird: 'bird.json',

    clouds: 'clouds.json',

    inventory_box: 'inventory_box.webp',
    light: 'light.json',

    bot: 'bot.json',
    bot_shadow: 'bot_shadow.webp',
    smile_lose: 'smile_lose.webp',
    smile_win: 'smile_win.webp',

    ceil_1b: 'ceil_1b.webp',
    ceil_1w: 'ceil_1w.webp',
    ceil_2b: 'ceil_2b.webp',
    ceil_2w: 'ceil_2w.webp',
    ceil_3b: 'ceil_3b.webp',
    ceil_3w: 'ceil_3w.webp',

    door_red: 'door_v_red.json',
    door_green: 'door_v_green.json',
    door_blue: 'door_v_blue.json',
    door_yellow: 'door_v_yellow.json',

    keys:'keys2.json',
    gun:'gun2.json',
    monster:'enemy.json',
    explosion: 'explosion.json',
    static_stone: 'stone.webp',
    stone_dust: 'stone_dust.json',
}
const spritesNumber = Object.keys(sprites).length
for (let sprite in sprites) sprites[sprite] = paths.sprites + sprites[sprite]

export const fonts = {
    normal: 'Onest-Regular.ttf',
}
for (let font in fonts) fonts[font] = paths.fonts + fonts[font]

///////////////////////////////////////////////////////////////////

export function uploadAssets( loadingDoneCallback ) {
    const assetsNumber = spritesNumber // + soundsNumber + voicesNumber
    let loadedAssets = 0
    let progressPerAsset = 100 / assetsNumber

    const loadingBar = new LoadingBar()

    const multiPacksMap = new Map()
    function updateMultiPackAnimations(sprite, animationsList) {
        // update all textures in all animations at MultiPack atlas
        for(let animationName in sprites[sprite].animations) {
            sprites[sprite].animations[animationName].forEach( (frame, index) => {
                if (!!frame) return // texture is already loaded, go to next frame
                const texture = Assets.cache.get(animationsList[animationName][index])
                sprites[sprite].animations[animationName][index] = texture
            })
        }
    }

    const loading = () => {
        loadedAssets++
        loadingBar.update(progressPerAsset * loadedAssets)
        if (loadedAssets === assetsNumber) {
            multiPacksMap.forEach( (animations, sprite) => updateMultiPackAnimations(sprite, animations) )
            multiPacksMap.clear()
            loadingBar.delete()
            loadingDoneCallback()
        }
    }

    for (let sprite in sprites) {
        Assets.add( {alias: sprite, src: sprites[sprite]} )
        Assets.load( sprite ).then(data => {
            if ('data' in data && 'related_multi_packs' in data.data.meta && 'animations' in data.data) {
                multiPacksMap.set(sprite, data.data.animations)
            }
            sprites[sprite] = data
            loading()
        })
    }
}