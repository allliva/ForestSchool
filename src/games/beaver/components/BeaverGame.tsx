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
import beaverIdle from '../assets/beaver-idle.webp'
import beaverWalk from '../assets/beaver-walk.webp'
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
  walk: beaverWalk,
  fall: beaverFall,
  wet: beaverWet,
  facepalm: beaverFacepalm,
  win: beaverWin,
}
const splashes = [splash1, splash2, splash3, splash4, splash5]

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
  const [hammers, setHammers] = useState(3)
  const [mistakes, setMistakes] = useState(0)
  const [firstTryRounds, setFirstTryRounds] = useState(0)
  const [roundHadMistake, setRoundHadMistake] = useState(false)
  const [flyingTokenId, setFlyingTokenId] = useState<string | null>(null)
  const [splashIndex, setSplashIndex] = useState<number | null>(null)
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
    setPhase('checking')
    setMessage('Бобр проверяет мост…')
    setPose('walk')

    if (isCorrectBridge(placed)) {
      audio.play(beaverSoundTheme.correct)
      schedule(() => {
        const nextFirstTryRounds = firstTryRounds + (roundHadMistake ? 0 : 1)
        setFirstTryRounds(nextFirstTryRounds)
        setPose(roundIndex === tasks.length - 1 ? 'win' : 'idle')
        setPhase(roundIndex === tasks.length - 1 ? 'gameWin' : 'roundSuccess')
        setMessage(roundIndex === tasks.length - 1 ? 'Бобр добрался домой!' : `Мост готов! ${task.displaySentence}`)
        if (roundIndex === tasks.length - 1) {
          audio.play(beaverSoundTheme.finish)
          schedule(() => onFinish(nextFirstTryRounds, mistakes), 850)
        }
      }, unit * 4)
      return
    }

    const nextMistakes = mistakes + 1
    const nextHammers = hammers - 1
    setMistakes(nextMistakes)
    setRoundHadMistake(true)
    audio.play(beaverSoundTheme.crack)
    schedule(() => setPose('fall'), unit)
    splashes.forEach((_, index) => schedule(() => {
      setSplashIndex(index)
      if (index === 1) audio.play(beaverSoundTheme.splash)
    }, unit * (index + 2)))
    schedule(() => {
      setSplashIndex(null)
      setPose('wet')
      setHammers(nextHammers)
      audio.play(beaverSoundTheme.hammerLost)
    }, unit * 7)
    schedule(() => {
      setPose('facepalm')
      if (nextHammers === 0) {
        setPhase('gameOver')
        setMessage('У бобра закончились молоточки!')
        audio.play('wrong')
        schedule(() => onFail(firstTryRounds, nextMistakes), 800)
      } else {
        setPhase('roundFail')
        setMessage('Ой! Мост не выдержал. Попробуем ещё раз?')
      }
    }, unit * 8)
  }

  const nextRound = () => prepareRound(roundIndex + 1)
  const retryRound = () => prepareRound(roundIndex, true)
  const controlsDisabled = phase !== 'building' || Boolean(flyingTokenId)
  const isFinalPath = roundIndex === tasks.length - 1 || phase === 'gameWin'
  const completedRounds = phase === 'roundSuccess' || phase === 'gameWin' ? roundIndex + 1 : roundIndex

  return <GameShell game="beaver" onExit={onExit} onHelp={onHelp} onAudio={onAudio}>
    <section className={`beaver-stage phase-${phase} pose-${pose} ${isFinalPath ? 'final-path' : ''}`} aria-label="Бобр строит мост">
      <div className="beaver-hud">
        <img className="beaver-progress-panel" src={progressPanel} alt="" draggable={false}/>
        <div className="beaver-hammers" aria-label={`Осталось молоточков: ${hammers}`}>
          <small>Молоточки</small>
          <div>{Array.from({ length: 3 }, (_, index) => <img key={index} className={index < hammers ? 'active' : 'lost'} src={hammer} alt={index < hammers ? 'Молоточек' : ''}/>)}</div>
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
            const arcY = Math.abs(index - middle) * 13
            return <div className={`bridge-slot ${token ? 'filled' : ''}`} style={{ '--arc-y': `${arcY}px` } as React.CSSProperties} key={index}>
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

      <motion.div className="beaver-character" animate={pose === 'walk' ? { x: ['0cqw', '18cqw', '37cqw', '58cqw'], y: ['0cqh', '-5cqh', '-7cqh', '0cqh'], rotate: [0, -2, 2, 0] } : pose === 'fall' ? { x: '42cqw', y: '23cqh', rotate: 24 } : { x: 0, y: 0, rotate: 0 }} transition={{ duration: reducedMotion ? .01 : pose === 'walk' ? .95 : .24, ease: 'easeInOut' }}>
        {phase === 'building' && placed.length === task.words.length && <button type="button" className="beaver-go-action" disabled={Boolean(flyingTokenId)} onClick={checkBridge} aria-label="Пойти по мосту"><motion.span className="beaver-go-arrow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: [1, .55, 1], y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: .8 }} aria-hidden="true">➜</motion.span></button>}
        <img className={pose === 'walk' ? 'walking-frame' : ''} src={poseImages[pose]} alt={pose === 'facepalm' ? 'Мокрый бобр вытирается' : pose === 'fall' ? 'Бобр падает в воду' : 'Добрый бобр'} draggable={false}/>
      </motion.div>
      {splashIndex !== null && <img className="beaver-splash" src={splashes[splashIndex]} alt="Брызги воды" draggable={false}/>}

      <div className="beaver-bridge-tools">
        {phase === 'building' && placed.length > 0 && <>
          <button type="button" className="secondary-button bridge-tool-button" disabled={controlsDisabled || placed.length === 0} onClick={undoLast} aria-label="Вернуть бревно" data-tooltip="Вернуть бревно" title="Вернуть бревно"><span aria-hidden="true">↶</span></button>
          <button type="button" className="secondary-button bridge-tool-button" disabled={controlsDisabled || placed.length === 0} onClick={resetBridge} aria-label="Очистить мост" data-tooltip="Очистить мост" title="Очистить мост"><span aria-hidden="true">🧹</span></button>
        </>}
        {phase === 'roundSuccess' && <button type="button" className="primary-button" onClick={nextRound}>Дальше</button>}
        {phase === 'roundFail' && <button type="button" className="primary-button" onClick={retryRound}>Попробовать ещё</button>}
      </div>
      <div className="beaver-feedback" role="status" aria-live="polite">{message}</div>
    </section>
  </GameShell>
}
