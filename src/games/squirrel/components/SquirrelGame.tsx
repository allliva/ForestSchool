import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { GameShell } from '../../../shared/GameShell'
import { useSession } from '../../../shared/useSession'
import { audio } from '../../../shared/audio'
import {
  SQUIRREL_GOAL,
  SQUIRREL_SCORED_TURNS,
  hasFilledPantry,
  nextSquirrelProgress,
  shuffleSquirrelTasks,
  squirrelTaskForTurn,
  squirrelFallDuration,
  syllableCategories,
  syllableLabel,
  type SyllableCount,
} from '../data/tasks'
import { squirrelSoundTheme } from '../audio/theme'
import chest1Closed from '../assets/chest-1-closed-v3.webp'
import chest1Open from '../assets/chest-1-open-v3.webp'
import chest2Closed from '../assets/chest-2-closed-v3.webp'
import chest2Open from '../assets/chest-2-open-v3.webp'
import chest3Closed from '../assets/chest-3-closed-v3.webp'
import chest3Open from '../assets/chest-3-open-v3.webp'
import oakParachute from '../assets/oak-leaf-parachute-v3.webp'
import acorn from '../assets/acorn-v4.webp'
import progressEmpty from '../assets/progress-acorn-empty-v3.webp'
import progressFilled from '../assets/progress-acorn-filled-v3.webp'
import progressPantry from '../assets/progress-pantry-v3.webp'
import progressBadge from '../assets/progress-badge-v3.webp'
import squirrelIdle from '../assets/squirrel-idle-v2.webp'
import squirrelRun1 from '../assets/squirrel-run-1-v2.webp'
import squirrelRun2 from '../assets/squirrel-run-2-v2.webp'
import squirrelCatch from '../assets/squirrel-catch-v2.webp'
import squirrelThrow from '../assets/squirrel-throw-v2.webp'
import squirrelWrong from '../assets/squirrel-wrong-v2.webp'
import squirrelCelebrate from '../assets/squirrel-celebrate-v2.webp'
import '../styles/squirrel.css'

type SquirrelGameState = 'loading' | 'idle' | 'answering' | 'correct' | 'wrong' | 'transition' | 'completed'
type SquirrelPose = 'idle' | 'run-1' | 'run-2' | 'catch' | 'throw' | 'wrong' | 'celebrate'
type AcornFlightStage = 'to-squirrel' | 'to-chest' | null

interface AcornFlight {
  startX: number
  startY: number
  catchX: number
  catchY: number
  chestX: number
  chestY: number
}

const chestFrames = [
  { closed: chest1Closed, open: chest1Open },
  { closed: chest2Closed, open: chest2Open },
  { closed: chest3Closed, open: chest3Open },
]

const squirrelFrames: Record<SquirrelPose, string> = {
  idle: squirrelIdle,
  'run-1': squirrelRun1,
  'run-2': squirrelRun2,
  catch: squirrelCatch,
  throw: squirrelThrow,
  wrong: squirrelWrong,
  celebrate: squirrelCelebrate,
}

export function SquirrelGame({ onFinish, onFail, onExit, onHelp, onAudio, level = 0 }: {
  modeId: string
  onFinish: (score: number, mistakes: number) => void
  onFail: (score: number, mistakes: number) => void
  onExit: () => void
  onHelp: () => void
  onAudio: () => void
  level?: number
}) {
  const tasks = useMemo(() => shuffleSquirrelTasks(), [])
  const session = useSession(null, onFinish)
  const task = squirrelTaskForTurn(tasks, session.index)

  const stageRef = useRef<HTMLElement>(null)
  const squirrelRef = useRef<HTMLDivElement>(null)
  const hangingAcornRef = useRef<HTMLImageElement>(null)
  const chestRefs = useRef<Array<HTMLButtonElement | null>>([])
  const timersRef = useRef<number[]>([])
  const missRef = useRef<() => void>(() => undefined)
  const [phase, setPhase] = useState<SquirrelGameState>('idle')
  const [pose, setPose] = useState<SquirrelPose>('idle')
  const [selected, setSelected] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const fallDuration = squirrelFallDuration(level, progress)
  const [message, setMessage] = useState('')
  const [flight, setFlight] = useState<AcornFlight | null>(null)
  const [flightStage, setFlightStage] = useState<AcornFlightStage>(null)
  const [dropCycle, setDropCycle] = useState(0)

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }

  useEffect(() => () => {
    timersRef.current.forEach(timer => window.clearTimeout(timer))
  }, [])

  useEffect(() => {
    setPhase('idle')
    setPose('idle')
    setSelected(null)
    setFlight(null)
    setFlightStage(null)
    setMessage('')
  }, [task.id])

  const measureFlight = (index: number) => {
    const stage = stageRef.current?.getBoundingClientRect()
    const source = hangingAcornRef.current?.getBoundingClientRect()
    const chest = chestRefs.current[index]?.getBoundingClientRect()
    const squirrel = squirrelRef.current?.getBoundingClientRect()
    if (!stage || !source || !chest || !squirrel) return null
    const startX = source.left + source.width / 2 - stage.left
    const startY = source.top + source.height / 2 - stage.top
    return {
      startX,
      startY,
      catchX: chest.left + chest.width / 2 - stage.left,
      catchY: chest.top - squirrel.height * .18 - stage.top,
      chestX: chest.left + chest.width / 2 - stage.left,
      chestY: chest.top + chest.height * .48 - stage.top,
    }
  }

  missRef.current = () => {
    if (phase !== 'idle') return
    const cannotStepBack = progress === 0
    const nextProgress = nextSquirrelProgress(progress, false)
    setPhase('wrong')
    setPose('wrong')
    setProgress(nextProgress)
    setMessage(cannotStepBack ? 'Жёлудь упал, а запас уже пуст — попробуем ещё раз!' : 'Жёлудь упал. Один жёлудь потерян!')
    audio.play(squirrelSoundTheme.wrong)
    session.wrong()
    if (cannotStepBack) {
      schedule(() => onFail(session.score, session.mistakes + 1), 700)
    } else {
      schedule(() => {
        setPhase('idle')
        setPose('idle')
        setMessage('Попробуй это слово ещё раз.')
        setDropCycle(value => value + 1)
      }, 760)
    }
  }

  useEffect(() => {
    if (phase !== 'idle') return
    const timer = window.setTimeout(() => missRef.current(), fallDuration * 1000)
    return () => window.clearTimeout(timer)
  }, [dropCycle, fallDuration, phase, task.id])

  const choose = (category: SyllableCount, index: number) => {
    if (phase !== 'idle') return
    const isCorrect = category === task.syllables
    const path = measureFlight(index)
    setSelected(index)
    setPhase('answering')
    setPose('run-1')
    setMessage('Белочка спешит к сундуку…')
    audio.play(squirrelSoundTheme.press)
    schedule(() => setPose('run-2'), 110)

    if (isCorrect) {
      if (path) {
        setFlight(path)
        setFlightStage('to-squirrel')
      }
      schedule(() => {
        setFlightStage(null)
        setPhase('correct')
        setPose('catch')
        setMessage('Поймала! Теперь — в сундук!')
        audio.play(squirrelSoundTheme.catch)
      }, 240)
      schedule(() => {
        setPose('throw')
        setFlightStage('to-chest')
        audio.play(squirrelSoundTheme.chest)
      }, 500)
      schedule(() => {
        setFlightStage(null)
        setFlight(null)
        const nextProgress = nextSquirrelProgress(progress, true)
        const countsForScore = session.index < SQUIRREL_SCORED_TURNS
        const nextScore = session.score + (countsForScore && !session.mistake ? 1 : 0)
        setProgress(nextProgress)
        setMessage(hasFilledPantry(nextProgress) ? 'Запасы собраны!' : 'Верно! Ещё один жёлудь в кладовой.')
        setPose(hasFilledPantry(nextProgress) ? 'celebrate' : 'idle')
        setPhase(hasFilledPantry(nextProgress) ? 'completed' : 'transition')
        audio.play(hasFilledPantry(nextProgress) ? squirrelSoundTheme.finish : squirrelSoundTheme.correct)
        session.correct(countsForScore)
        if (hasFilledPantry(nextProgress)) schedule(() => onFinish(nextScore, session.mistakes), 520)
      }, 760)
      return
    }

    schedule(() => {
      const cannotStepBack = progress === 0
      const nextProgress = nextSquirrelProgress(progress, false)
      setPhase('wrong')
      setPose('wrong')
      setProgress(nextProgress)
      setMessage(cannotStepBack ? 'Запасы закончились — попробуем ещё раз!' : 'Не тот сундук. Один жёлудь выпал из запаса.')
      audio.play(squirrelSoundTheme.chest)
      audio.play(squirrelSoundTheme.wrong)
      session.wrong()
      if (cannotStepBack) {
        schedule(() => onFail(session.score, session.mistakes + 1), 650)
      } else {
        schedule(() => {
          setPhase('idle')
          setPose('idle')
          setSelected(null)
          setMessage('Попробуй это слово ещё раз.')
          setDropCycle(value => value + 1)
        }, 720)
      }
    }, 260)
  }

  const travel = selected === null ? '0cqw' : `${23 + selected * 26}cqw`
  const chestIsOpen = (index: number) => selected === index && phase !== 'idle' && phase !== 'transition' && phase !== 'completed'
  const disabled = phase !== 'idle'
  const dropFallsAway = flightStage === 'to-squirrel' || phase === 'correct' || phase === 'transition' || phase === 'completed'

  return <GameShell game="squirrel" onExit={onExit} onHelp={onHelp} onAudio={onAudio}>
    <section ref={stageRef} className={`squirrel-stage phase-${phase} flight-${flightStage ?? 'none'} feedback-${session.feedback}`} aria-label="Белочка собирает запасы">
      <div className="squirrel-progress" aria-label={`В кладовой ${progress} из ${SQUIRREL_GOAL} желудей`}>
        <img className="progress-pantry" src={progressPantry} alt="Кладовая" draggable={false}/>
        <ol>
          {Array.from({ length: SQUIRREL_GOAL }, (_, index) => <li className={index < progress ? 'filled' : ''} key={index} aria-hidden="true">
            <img src={index < progress ? progressFilled : progressEmpty} alt="" draggable={false}/>
          </li>)}
        </ol>
        <img className="progress-badge" src={progressBadge} alt="Награда за полную кладовую" draggable={false}/>
      </div>

      <motion.div
        className="oak-drop"
        key={`${task.id}-${dropCycle}`}
        data-falling-away={dropFallsAway}
        initial={{ y: 0, opacity: 1 }}
        animate={dropFallsAway ? { y: '70cqh', opacity: 0 } : phase === 'idle' ? { y: '35cqh', opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ duration: dropFallsAway ? .06 : phase === 'idle' ? fallDuration : .12, ease: 'linear' }}
      >
        <img className="oak-parachute" src={oakParachute} alt="" draggable={false}/>
        <strong>{task.word}</strong>
        <img ref={hangingAcornRef} className="hanging-acorn" src={acorn} alt="Жёлудь" draggable={false}/>
      </motion.div>

      {flight && flightStage && <motion.img
        key={flightStage}
        className="flying-acorn"
        src={acorn}
        alt="Белочка переносит жёлудь"
        style={{ left: flightStage === 'to-squirrel' ? flight.startX : flight.catchX, top: flightStage === 'to-squirrel' ? flight.startY : flight.catchY }}
        initial={{ x: 0, y: 0, rotate: 0, scale: flightStage === 'to-squirrel' ? 1 : .82, opacity: 1 }}
        animate={flightStage === 'to-squirrel' ? {
          x: flight.catchX - flight.startX,
          y: flight.catchY - flight.startY,
          rotate: -20,
          scale: .82,
          opacity: 1,
        } : {
          x: flight.chestX - flight.catchX,
          y: flight.chestY - flight.catchY,
          rotate: 330,
          scale: .35,
          opacity: 0,
        }}
        transition={{ duration: flightStage === 'to-squirrel' ? .24 : .26, ease: 'easeInOut' }}
        draggable={false}
      />}

      <div className="treasure-chests" role="group" aria-label="Выбери сундук по количеству слогов">
        {syllableCategories.map((category, index) => <button
          ref={node => { chestRefs.current[index] = node }}
          className={`treasure-chest chest-${index + 1} ${selected === index ? 'selected' : ''}`}
          key={category}
          type="button"
          data-category={category}
          data-index={index}
          disabled={disabled}
          aria-label={`Положить жёлудь в сундук: ${syllableLabel(category)}`}
          onClick={() => choose(category, index)}
        >
          <img src={chestIsOpen(index) ? chestFrames[index].open : chestFrames[index].closed} alt="" draggable={false}/>
          <span>{syllableLabel(category)}</span>
        </button>)}
      </div>

      <motion.div ref={squirrelRef} className={`squirrel-character pose-${pose}`} animate={{ x: travel }} transition={{ duration: phase === 'answering' ? .24 : .18, ease: 'easeInOut' }}>
        <img src={squirrelFrames[pose]} alt="Белочка переносит жёлуди по сундукам" draggable={false}/>
      </motion.div>

      <div className={`answer-mark ${phase === 'correct' || phase === 'completed' ? 'correct' : phase === 'wrong' ? 'wrong' : ''}`} aria-hidden="true">
        {phase === 'correct' || phase === 'completed' ? '✓' : phase === 'wrong' ? '×' : ''}
      </div>
      <div className="squirrel-feedback" role="status" aria-live="polite">{message}</div>
    </section>
  </GameShell>
}
