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
import squirrelBackground from '../games/squirrel/assets/autumn-clearing.webp'
import squirrelIdle from '../games/squirrel/assets/squirrel-idle-v2.webp'
import squirrelRun1 from '../games/squirrel/assets/squirrel-run-1-v2.webp'
import squirrelRun2 from '../games/squirrel/assets/squirrel-run-2-v2.webp'
import squirrelCatch from '../games/squirrel/assets/squirrel-catch-v2.webp'
import squirrelThrow from '../games/squirrel/assets/squirrel-throw-v2.webp'
import squirrelWrong from '../games/squirrel/assets/squirrel-wrong-v2.webp'
import squirrelCelebrate from '../games/squirrel/assets/squirrel-celebrate-v2.webp'
import chest1Closed from '../games/squirrel/assets/chest-1-closed-v3.webp'
import chest1Open from '../games/squirrel/assets/chest-1-open-v3.webp'
import chest2Closed from '../games/squirrel/assets/chest-2-closed-v3.webp'
import chest2Open from '../games/squirrel/assets/chest-2-open-v3.webp'
import chest3Closed from '../games/squirrel/assets/chest-3-closed-v3.webp'
import chest3Open from '../games/squirrel/assets/chest-3-open-v3.webp'
import oakParachute from '../games/squirrel/assets/oak-leaf-parachute-v3.webp'
import squirrelAcorn from '../games/squirrel/assets/acorn-v4.webp'
import progressEmpty from '../games/squirrel/assets/progress-acorn-empty-v3.webp'
import progressFilled from '../games/squirrel/assets/progress-acorn-filled-v3.webp'
import progressPantry from '../games/squirrel/assets/progress-pantry-v3.webp'
import progressBadge from '../games/squirrel/assets/progress-badge-v3.webp'
import beaverBackground from '../games/beaver/assets/beaver-river.webp'
import beaverRiverBackground from '../games/beaver/assets/river-background.webp'
import beaverHomeBackground from '../games/beaver/assets/home-background.webp'
import beaverCardCover from '../games/beaver/assets/beaver-card-cover.webp'
import beaverBridge from '../games/beaver/assets/bridge-outline.webp'
import beaverWordLog from '../games/beaver/assets/word-log.webp'
import beaverLogEnd from '../games/beaver/assets/log-end.webp'
import beaverHammer from '../games/beaver/assets/hammer.webp'
import beaverIdle from '../games/beaver/assets/beaver-idle.webp'
import beaverWalk from '../games/beaver/assets/beaver-walk.webp'
import beaverFall from '../games/beaver/assets/beaver-fall.webp'
import beaverWet from '../games/beaver/assets/beaver-wet.webp'
import beaverFacepalm from '../games/beaver/assets/beaver-facepalm.webp'
import beaverWin from '../games/beaver/assets/beaver-win.webp'

const visualAssets = [
  frogBackground, frogProgress, frogCrown, frogFly, frogWordLily,
  frogSprite0, frogSprite1, frogSprite2, frogSprite3, frogSprite4, frogSprite5,
  squirrelBackground, squirrelIdle, squirrelRun1, squirrelRun2, squirrelCatch, squirrelThrow, squirrelWrong, squirrelCelebrate,
  chest1Closed, chest1Open, chest2Closed, chest2Open, chest3Closed, chest3Open,
  oakParachute, squirrelAcorn, progressEmpty, progressFilled, progressPantry, progressBadge,
  beaverBackground, beaverRiverBackground, beaverHomeBackground, beaverCardCover, beaverBridge, beaverWordLog, beaverLogEnd, beaverHammer, beaverIdle, beaverWalk, beaverFall, beaverWet, beaverFacepalm, beaverWin,
]

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
