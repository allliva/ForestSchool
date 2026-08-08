import frogBackground from '../games/frog/assets/frog-pond-lily.png'
import frogProgress from '../games/frog/assets/frog-progress-front.png'
import frogCrown from '../games/frog/assets/frog-crown-3d.png'
import frogFly from '../games/frog/assets/frog-letter-fly.png'
import frogWordLily from '../games/frog/assets/frog-word-lily-v2.webp'
import frogSprite0 from '../games/frog/assets/frog-sprite-0.png'
import frogSprite1 from '../games/frog/assets/frog-sprite-1.png'
import frogSprite2 from '../games/frog/assets/frog-sprite-2.png'
import frogSprite3 from '../games/frog/assets/frog-sprite-3.png'
import frogSprite4 from '../games/frog/assets/frog-sprite-4.png'
import frogSprite5 from '../games/frog/assets/frog-sprite-5.png'
import squirrelBackground from '../games/squirrel/assets/squirrel-oak.webp'
import beaverBackground from '../games/beaver/assets/beaver-river.webp'

const visualAssets = [frogBackground, frogProgress, frogCrown, frogFly, frogWordLily, frogSprite0, frogSprite1, frogSprite2, frogSprite3, frogSprite4, frogSprite5, squirrelBackground, beaverBackground]

function preloadImage(source: string) {
  return new Promise<void>(resolve => {
    const image = new Image()
    image.onload = () => { void image.decode().catch(() => undefined).finally(resolve) }
    image.onerror = () => resolve()
    image.src = source
  })
}

let preloadPromise: Promise<void> | undefined

export function preloadVisualAssets() {
  preloadPromise ??= Promise.all(visualAssets.map(preloadImage)).then(() => undefined)
  return preloadPromise
}