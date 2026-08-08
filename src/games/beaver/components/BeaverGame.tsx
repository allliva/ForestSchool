import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { GameShell } from '../../../shared/GameShell'
import { audio } from '../../../shared/audio'
import { createBeaverSession, createShuffledTokens, isCorrectBridge, type BeaverWordToken } from '../data/tasks'
import { beaverSoundTheme } from '../audio/theme'
import bridgeOutline from '../assets/bridge-outline.webp'
import wordLog from '../assets/word-log.webp'
import logEnd from '../assets/log-end.webp'
import hammer from '../assets/hammer.webp'
import progressPanel from '../assets/progress-panel.webp'
import progressFragment from '../assets/progress-fragment.webp'
import forestBroom from '../assets/forest-broom.webp'
import beaverIdle from '../assets/beaver-idle.webp'
import beaverWalkFrame1 from '../assets/beaver-walk-frame-1.webp'
import beaverWalkFrame2 from '../assets/beaver-walk-frame-2.webp'
import beaverWalkFrame3 from '../assets/beaver-walk-frame-3.webp'
import beaverWalkFrame4 from '../assets/beaver-walk-frame-4.webp'
import beaverFall from '../assets/beaver-fall.webp'
import beaverWet from '../assets/beaver-wet.webp'
import beaverFacepalm from '../assets/beaver-facepalm.webp'
import beaverWin from '../assets/beaver-win.webp'
import splash1 from '../assets/splash-1.webp'
import splash2 from '../assets/splash-2.webp'
import splash3 from '../assets/splash-3.webp'
import splash4 from '../assets/splash-4.webp'
import splash5 from '../assets/splash-5.webp'
import '../styles/beaver.css'

type BeaverGamePhase = 'building' | 'checking' | 'roundSuccess' | 'roundFail' | 'gameWin' | 'gameOver'
type BeaverPose = 'idle' | 'walk' | 'fall' | 'wet' | 'facepalm' | 'win'

const poseImages: Record<BeaverPose, string> = {
  idle: beaverIdle,
  walk: beaverWalkFrame1,
  fall: beaverFall,
  wet: beaverWet,
  facepalm: beaverFacepalm,
  win: beaverWin,
}
const splashes = [splash1, splash2, splash3, splash4, splash5]
const walkFrames = [beaverWalkFrame1, beaverWalkFrame2, beaverWalkFrame3, beaverWalkFrame4]
const failScatter = [
  { x: '-8cqw', y: '9cqh', rotate: '-27deg' },
  { x: '5cqw', y: '14cqh', rotate: '19deg' },
  { x: '-3cqw', y: '18cqh', rotate: '-13deg' },
  { x: '9cqw', y: '10cqh', rotate: '31deg' },
  { x: '-10cqw', y: '16cqh', rotate: '16deg' },
  { x: '3cqw', y: '20cqh', rotate: '-32deg' },
] as const

export function BeaverGame({ onFinish, onFail, onExit, onHelp, onAudio }: {
  modeId: string
  onFinish: (score: number, mistakes: number) => void
  onFail: (score: number, mistakes: number) => void
  onExit: () => void
  onHelp: () => void
  onAudio: () => void
}) {
  const tasks = useMemo(() => createBeaverSession(), [])
  const [roundIndex, setRoundIndex] = useState(0)
  const task = tasks[roundIndex]
  const [available, setAvailable] = useState<BeaverWordToken[]>(() => createShuffledTokens(tasks[0]))
  const [placed, setPlaced] = useState<BeaverWordToken[]>([])
  const [phase, setPhase] = useState<BeaverGamePhase>('building')
  const [pose, setPose] = useState<BeaverPose>('idle')
  const [hammers, setHammers] = useState(5)
  const [mistakes, setMistakes] = useState(0)
  const [firstTryRounds, setFirstTryRounds] = useState(0)
  const [roundHadMistake, setRoundHadMistake] = useState(false)
  const [flyingTokenId, setFlyingTokenId] = useState<string | null>(null)
  const [splashIndex, setSplashIndex] = useState<number | null>(null)
  const [bridgeWillHold, setBridgeWillHold] = useState<boolean | null>(null)
  const [message, setMessage] = useState('Выбирай слова по порядку — бревно само перелетит на мост.')
  const timers = useRef<number[]>([])
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const unit = reducedMotion ? 25 : 180

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, reducedMotion ? Math.min(delay, 35) : delay)
    timers.current.push(timer)
  }

  useEffect(() => () => timers.current.forEach(timer => window.clearTimeout(timer)), [])

  const prepareRound = (index: number, keepMistake = false) => {
    setRoundIndex(index)
    setAvailable(createShuffledTokens(tasks[index]))
    setPlaced([])
    setPhase('building')
    setPose('idle')
    setSplashIndex(null)
    setFlyingTokenId(null)
    setBridgeWillHold(null)
    setRoundHadMistake(keepMistake)
    setMessage('Выбирай слова по порядку — бревно само перелетит на мост.')
  }

  const selectWord = (token: BeaverWordToken) => {
    if (phase !== 'building' || flyingTokenId) return
    setFlyingTokenId(token.id)
    setAvailable(current => current.filter(item => item.id !== token.id))
    setPlaced(current => [...current, token])
    setPose('idle')
    setMessage(`Бревно «${token.text}» летит на мост.`)
    audio.play(beaverSoundTheme.pick)
    schedule(() => {
      setFlyingTokenId(null)
      audio.play(beaverSoundTheme.place)
      setMessage(placed.length + 1 === task.words.length ? 'Все брёвна на месте. Проверим мост?' : 'Выбирай следующее слово.')
    }, 360)
  }

  const undoLast = () => {
    if (phase !== 'building' || flyingTokenId || placed.length === 0) return
    const token = placed[placed.length - 1]
    setPlaced(current => current.slice(0, -1))
    setAvailable(current => [...current, token])
    setMessage(`Бревно «${token.text}» вернулось в запас.`)
    audio.play('tap')
  }

  const resetBridge = () => {
    if (phase !== 'building' || flyingTokenId || placed.length === 0) return
    setPlaced([])
    setAvailable(createShuffledTokens(task))
    setMessage('Мост разобран. Начни предложение заново.')
    audio.play('tap')
  }

  const checkBridge = () => {
    if (phase !== 'building' || flyingTokenId || placed.length !== task.words.length) return
    const bridgeHolds = isCorrectBridge(placed)
    setPhase('checking')
    setMessage('Бобр проверяет мост…')
    setBridgeWillHold(bridgeHolds)
    setPose('walk')

    if (bridgeHolds) {
      audio.play(beaverSoundTheme.correct)
      const finalRound = roundIndex === tasks.length - 1
      schedule(() => {
        const nextFirstTryRounds = firstTryRounds + (roundHadMistake ? 0 : 1)
        setFirstTryRounds(nextFirstTryRounds)
        setPhase(finalRound ? 'gameWin' : 'roundSuccess')
        setMessage(finalRound ? 'Бобр добрался домой!' : `Мост готов! ${task.displaySentence}`)
        if (finalRound) {
          audio.play(beaverSoundTheme.finish)
          schedule(() => onFinish(nextFirstTryRounds, mistakes), 850)
        } else {
          schedule(() => prepareRound(roundIndex + 1), reducedMotion ? 420 : 650)
        }
      }, reducedMotion ? 35 : finalRound ? 2550 : 2400)
      return
    }

    const nextMistakes = mistakes + 1
    const nextHammers = hammers - 1
    const fallDelay = reducedMotion ? 25 : 1350
    setMistakes(nextMistakes)
    setRoundHadMistake(true)
    audio.play(beaverSoundTheme.crack)
    schedule(() => setPose('fall'), fallDelay)
    splashes.forEach((_, index) => schedule(() => {
      setSplashIndex(index)
      if (index === 1) audio.play(beaverSoundTheme.splash)
    }, fallDelay + unit * (index + 1)))
    schedule(() => {
      setSplashIndex(null)
      setPose('wet')
      setHammers(nextHammers)
      audio.play(beaverSoundTheme.hammerLost)
    }, fallDelay + unit * 6)
    schedule(() => {
      setPose('facepalm')
      if (nextHammers === 0) {
        setPhase('gameOver')
        setMessage('У бобра закончились молоточки!')
        audio.play('wrong')
        schedule(() => onFail(firstTryRounds, nextMistakes), 800)
      } else {
        setPhase('roundFail')
        setMessage('Мост не выдержал')
        schedule(() => prepareRound(roundIndex, true), reducedMotion ? 420 : 1350)
      }
    }, fallDelay + unit * 7)
  }
  const controlsDisabled = phase !== 'building' || Boolean(flyingTokenId)
  const isFinalPath = roundIndex === tasks.length - 1 || phase === 'gameWin'
  const completedRounds = phase === 'roundSuccess' || phase === 'gameWin' ? roundIndex + 1 : roundIndex

  const walkingAnimation = bridgeWillHold === false
    ? {
        x: ['0cqw', '2cqw', '4cqw', '6cqw', '8cqw', '10cqw', '12cqw', '14cqw', '16cqw', '18cqw', '20cqw', '22cqw', '24cqw', '26cqw', '28cqw', '30cqw', '32cqw', '34cqw', '36cqw'],
        y: ['0cqh', '-.3cqh', '-.8cqh', '-1.5cqh', '-2.5cqh', '-4cqh', '-5.8cqh', '-7.8cqh', '-10cqh', '-12.5cqh', '-15cqh', '-17.3cqh', '-19.4cqh', '-21.1cqh', '-22.3cqh', '-23.1cqh', '-23.6cqh', '-23.9cqh', '-24cqh'],
        rotate: Array.from({ length: 19 }, (_, index) => index === 0 || index === 18 ? 0 : index % 2 ? -.45 : .45),
        scale: 1,
        opacity: 1,
      }
    : roundIndex === tasks.length - 1
      ? {
          x: ['0cqw', '3cqw', '6cqw', '9cqw', '12cqw', '15cqw', '18cqw', '21cqw', '24cqw', '27cqw', '30cqw', '33cqw', '36cqw', '39cqw', '42cqw', '45cqw', '48cqw', '51cqw', '54cqw', '57cqw', '60cqw', '63cqw', '66cqw', '69cqw', '72cqw', '75cqw', '77cqw', '79cqw'],
          y: ['0cqh', '-.7cqh', '-1.5cqh', '-2.6cqh', '-4cqh', '-5.8cqh', '-8cqh', '-10.5cqh', '-13.5cqh', '-16.5cqh', '-19.5cqh', '-22cqh', '-24cqh', '-23.8cqh', '-23.2cqh', '-22.3cqh', '-21cqh', '-19.5cqh', '-17.8cqh', '-16cqh', '-14cqh', '-12cqh', '-10cqh', '-8cqh', '-6cqh', '-4cqh', '-2cqh', '0cqh'],
          rotate: Array.from({ length: 28 }, (_, index) => index === 0 || index === 27 ? 0 : index % 2 ? -.4 : .4),
          scale: [1, 1, 1, 1, 1, 1, 1, .995, .99, .985, .98, .97, .96, .95, .94, .92, .9, .87, .83, .78, .72, .65, .57, .48, .38, .27, .17, .1],
          opacity: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, .98, .94, .86, .74, .58, .4, .2, 0],
        }
      : {
          x: ['0cqw', '4cqw', '8cqw', '12cqw', '16cqw', '20cqw', '24cqw', '28cqw', '32cqw', '36cqw', '40cqw', '44cqw', '48cqw', '52cqw', '56cqw', '60cqw', '64cqw', '68cqw', '72cqw', '76cqw', '80cqw', '84cqw', '88cqw', '92cqw', '96cqw', '100cqw', '104cqw', '108cqw', '112cqw'],
          y: ['0cqh', '-.7cqh', '-1.7cqh', '-3cqh', '-4.7cqh', '-6.8cqh', '-9.3cqh', '-12.3cqh', '-16cqh', '-20cqh', '-22.5cqh', '-24cqh', '-23.7cqh', '-23cqh', '-21.8cqh', '-20.2cqh', '-18.2cqh', '-16cqh', '-13.7cqh', '-11.5cqh', '-9.2cqh', '-7.2cqh', '-5.3cqh', '-3.7cqh', '-2.3cqh', '-1.2cqh', '-.5cqh', '-.1cqh', '0cqh'],
          rotate: Array.from({ length: 29 }, (_, index) => index === 0 || index === 28 ? 0 : index % 2 ? -.42 : .42),
          scale: 1,
          opacity: 1,
        }
  const beaverAnimation = pose === 'walk'
    ? walkingAnimation
    : pose === 'fall'
      ? { x: '36cqw', y: '31cqh', rotate: 28, scale: .96, opacity: 1 }
      : pose === 'wet' || pose === 'facepalm'
        ? { x: '36cqw', y: '21cqh', rotate: 0, scale: .72, opacity: 1 }
        : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
  const beaverMovementDuration = reducedMotion
    ? .01
    : pose === 'walk'
      ? bridgeWillHold === false ? 1.35 : roundIndex === tasks.length - 1 ? 2.5 : 2.35
      : pose === 'fall' ? .46 : .24

  return <GameShell game="beaver" onExit={onExit} onHelp={onHelp} onAudio={onAudio}>
    <section className={`beaver-stage phase-${phase} pose-${pose} ${isFinalPath ? 'final-path' : ''}`} aria-label="Бобр строит мост">
      <div className="beaver-hud">
        <img className="beaver-progress-panel" src={progressPanel} alt="" draggable={false}/>
        <div className="beaver-hammers" aria-label={`Осталось молоточков: ${hammers}`}>
          <small>Молоточки</small>
          <div>{Array.from({ length: 5 }, (_, index) => <img key={index} className={index < hammers ? 'active' : 'lost'} src={hammer} alt={index < hammers ? 'Молоточек' : ''}/>)}</div>
        </div>
        <div className="beaver-journey" aria-label={`Путь домой: ${completedRounds} из 10`}>
          <strong>Путь домой · {completedRounds} из 10</strong>
          <div className="journey-route">
            <ol>{tasks.map((item, index) => <li key={item.id} className={index < completedRounds ? 'completed' : index === completedRounds ? 'current' : ''}><img className="progress-fragment" src={progressFragment} alt="" draggable={false}/><i>{index + 1}</i></li>)}</ol>
          </div>
        </div>
      </div>

      <div className="bridge-scene">
        <img className="bridge-outline" src={bridgeOutline} alt="Контур будущего моста" draggable={false}/>
        <div className="bridge-slots" data-count={task.words.length} aria-label="Слова на мосту">
          {task.words.map((_, index) => {
            const token = placed[index]
            const middle = (task.words.length - 1) / 2
            const arcY = Math.abs(index - middle) * 36
            const arcRotate = (index - middle) * 5
            const scatter = failScatter[index % failScatter.length]
            return <div className={`bridge-slot ${token ? 'filled' : ''}`} style={{ '--arc-y': arcY + 'px', '--arc-rotate': arcRotate + 'deg', '--fail-x': scatter.x, '--fail-y': scatter.y, '--fail-rotate': scatter.rotate } as React.CSSProperties} key={index}>
              {token && <motion.div className="placed-log" data-token-id={token.id} initial={reducedMotion ? false : { x: -260, y: 180, rotate: -24, scale: 1.25 }} animate={{ x: 0, y: 0, rotate: 0, scale: 1 }} transition={{ duration: .36, ease: 'easeOut' }}>
                <img src={logEnd} alt="" draggable={false}/><svg className={token.text.length > 8 ? 'long-word' : ''} viewBox="0 0 100 100" aria-hidden="true"><defs><path id={`word-arc-${token.id}`} d="M 14 60 A 36 36 0 0 1 86 60"/></defs><text><textPath href={`#word-arc-${token.id}`} startOffset="50%" textAnchor="middle">{token.text}</textPath></text></svg><span className="placed-word-accessible">{token.text}</span>
              </motion.div>}
            </div>
          })}
        </div>
      </div>

      <div className="log-bank" role="group" aria-label="Доступные брёвна" data-count={available.length}>
        {available.map(token => <button className="word-log" type="button" key={token.id} disabled={controlsDisabled} onClick={() => selectWord(token)} data-token-id={token.id}>
          <img src={wordLog} alt="" draggable={false}/><strong>{token.text}</strong>
        </button>)}
      </div>

      <motion.div className="beaver-character" animate={beaverAnimation} transition={{ duration: beaverMovementDuration, ease: "easeInOut" }}>
        {phase === 'building' && placed.length === task.words.length && <button type="button" className="beaver-go-action" disabled={Boolean(flyingTokenId)} onClick={checkBridge} aria-label="Пойти по мосту"><motion.span className="beaver-go-arrow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: [1, .72, 1], y: [0, -5, 0], scale: [1, 1.14, 1] }} transition={{ repeat: Infinity, duration: .8 }} aria-hidden="true"><svg viewBox="0 0 120 80" focusable="false"><path className="go-arrow-outline" d="M 12 40 H 88 M 66 15 L 94 40 L 66 65"/><path className="go-arrow-fill" d="M 12 40 H 88 M 66 15 L 94 40 L 66 65"/></svg></motion.span></button>}
        {pose === 'walk' ? <span className="beaver-walk-cycle" aria-label="Бобр идёт по мосту">{walkFrames.map((frame, index) => <img key={frame} className={`walk-cycle-frame frame-${index + 1}`} src={frame} alt="" draggable={false}/>)}</span> : <img src={poseImages[pose]} alt={pose === 'facepalm' ? 'Мокрый бобр вытирается' : pose === 'fall' ? 'Бобр падает в воду' : 'Добрый бобр'} draggable={false}/>}
      </motion.div>
      {splashIndex !== null && <img className="beaver-splash" src={splashes[splashIndex]} alt="Брызги воды" draggable={false}/>}

      <div className="beaver-bridge-tools">
        {phase === 'building' && placed.length > 0 && <>
          <button type="button" className="secondary-button bridge-tool-button" disabled={controlsDisabled || placed.length === 0} onClick={undoLast} aria-label="Вернуть бревно" data-tooltip="Вернуть бревно" title="Вернуть бревно"><span aria-hidden="true">↶</span></button>
          <button type="button" className="secondary-button bridge-tool-button" disabled={controlsDisabled || placed.length === 0} onClick={resetBridge} aria-label="Очистить мост" data-tooltip="Очистить мост" title="Очистить мост"><img className="bridge-tool-icon" src={forestBroom} alt="" draggable={false}/></button>
        </>}
      </div>
      {(pose === 'fall' || pose === 'wet' || pose === 'facepalm' || phase === 'roundFail' || phase === 'gameOver') && <motion.div className="beaver-fail-mark" initial={{ opacity: 0, scale: .35, rotate: -18 }} animate={{ opacity: 1, scale: [1, 1.12, 1], rotate: 0 }} transition={{ duration: .38 }} role="img" aria-label="Мост не выдержал">×</motion.div>}
      <div className="beaver-feedback" role="status" aria-live="polite">{message}</div>
    </section>
  </GameShell>
}
