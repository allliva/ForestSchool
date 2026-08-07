import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { motion } from 'motion/react'
import { GameShell } from '../../../shared/GameShell'
import { useSession } from '../../../shared/useSession'
import { audio } from '../../../shared/audio'
import { sampleUnique } from '../../../shared/storage'
import { frogTasks, hiddenWord } from '../data/tasks'
import frogProgressFront from '../assets/frog-progress-front.png'
import frogSprite0 from '../assets/frog-sprite-0.png'
import frogSprite1 from '../assets/frog-sprite-1.png'
import frogSprite2 from '../assets/frog-sprite-2.png'
import frogSprite3 from '../assets/frog-sprite-3.png'
import frogSprite4 from '../assets/frog-sprite-4.png'
import frogSprite5 from '../assets/frog-sprite-5.png'
import frogCrown from '../assets/frog-crown-3d.png'
import flySprite from '../assets/frog-letter-fly.png'
import '../styles/frog.css'
import '../styles/frog-character.css'

const alphabet = [...'абвгдежзиклмнопрстуфхцчшэюя']
const frogFrames = [frogSprite0, frogSprite1, frogSprite2, frogSprite3, frogSprite4, frogSprite5]
const mouthHeightPosition = .28
const captureDuration = .74

function randomLetters(correct: string, suggestions: string[]) {
  const pool = new Set([correct, ...suggestions])
  while (pool.size < 7) pool.add(alphabet[Math.floor(Math.random() * alphabet.length)])
  return [...pool].sort(() => Math.random() - .5).slice(0, 7)
}

interface TongueShot { startX: number; startY: number; endX: number; endY: number }

export function FrogGame({ onFinish, onFail, onExit, onHelp, onAudio }: { modeId: string; onFinish: (score: number) => void; onFail: (score: number) => void; onExit: () => void; onHelp: () => void; onAudio: () => void }) {
  const tasks = useMemo(() => sampleUnique(frogTasks, 10), [])
  const session = useSession(tasks.length, onFinish)
  const task = tasks[session.index]
  const flies = useMemo(() => randomLetters(task.missing, task.options), [task])
  const stageRef = useRef<HTMLElement>(null)
  const frogRef = useRef<HTMLDivElement>(null)
  const flyAreaRef = useRef<HTMLDivElement>(null)
  const flyNodeRefs = useRef<Array<HTMLDivElement | null>>([])
  const captureTimerRef = useRef<number | null>(null)
  const wrongEffectTimerRef = useRef<number | null>(null)
  const messageTimerRef = useRef<number | null>(null)
  const defeatTimerRef = useRef<number | null>(null)
  const [caught, setCaught] = useState<number | null>(null)
  const [tongue, setTongue] = useState<TongueShot | null>(null)
  const [resultImpact, setResultImpact] = useState<{ x: number; y: number; correct: boolean } | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [look, setLook] = useState({ frame: 0, mirror: false })

  useEffect(() => {
    const area = flyAreaRef.current
    const nodes = flyNodeRefs.current.slice(0, flies.length)
    if (!area || nodes.some(node => !node)) return
    const elements = nodes as HTMLDivElement[]
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const particles = elements.map(element => ({
      x: 0, y: 0,
      width: element.offsetWidth,
      height: element.offsetHeight,
      vx: 0, vy: 0,
    }))
    const bounds = () => ({ width: area.clientWidth, height: area.clientHeight })
    const layoutSpeedFactor = (size: { width: number; height: number }) => Math.max(.72, Math.min(2.4, size.width / 1050))
    const flightSpeedScale = 2 / 3
    const overlaps = (x: number, y: number, width: number, height: number, placed: typeof particles) =>
      placed.some(other => {
        const dx = x + width / 2 - (other.x + other.width / 2)
        const dy = y + height / 2 - (other.y + other.height / 2)
        return Math.hypot(dx, dy) < (Math.min(width, height) + Math.min(other.width, other.height)) * .46
      })
    const placed: typeof particles = []
    const initialBounds = bounds()
    particles.forEach((particle, index) => {
      let x = 0
      let y = 0
      let attempts = 0
      do {
        x = Math.random() * Math.max(1, initialBounds.width - particle.width)
        y = Math.random() * Math.max(1, initialBounds.height - particle.height)
        attempts += 1
      } while (attempts < 180 && overlaps(x, y, particle.width, particle.height, placed))
      if (attempts >= 180) {
        const columns = Math.ceil(Math.sqrt(particles.length * initialBounds.width / Math.max(1, initialBounds.height)))
        const rows = Math.ceil(particles.length / columns)
        x = (index % columns) * Math.max(0, initialBounds.width - particle.width) / Math.max(1, columns - 1)
        y = Math.floor(index / columns) * Math.max(0, initialBounds.height - particle.height) / Math.max(1, rows - 1)
      }
      particle.x = x
      particle.y = y
      placed.push(particle)
    })
    let previousBounds = initialBounds
    const syncParticleLayout = () => {
      const nextBounds = bounds()
      const velocityScaleX = previousBounds.width > 0 ? nextBounds.width / previousBounds.width : 1
      const velocityScaleY = previousBounds.height > 0 ? nextBounds.height / previousBounds.height : 1
      particles.forEach((particle, index) => {
        const previousMaxX = Math.max(0, previousBounds.width - particle.width)
        const previousMaxY = Math.max(0, previousBounds.height - particle.height)
        const relativeX = previousMaxX > 0 ? particle.x / previousMaxX : .5
        const relativeY = previousMaxY > 0 ? particle.y / previousMaxY : .5
        particle.width = elements[index].offsetWidth
        particle.height = elements[index].offsetHeight
        particle.vx *= velocityScaleX
        particle.vy *= velocityScaleY
        const nextMaxX = Math.max(0, nextBounds.width - particle.width)
        const nextMaxY = Math.max(0, nextBounds.height - particle.height)
        particle.x = Math.max(0, Math.min(nextMaxX, relativeX * nextMaxX))
        particle.y = Math.max(0, Math.min(nextMaxY, relativeY * nextMaxY))
        elements[index].style.transform = 'translate3d(' + particle.x + 'px,' + particle.y + 'px,0)'
      })
      previousBounds = nextBounds
    }
    const resizeObserver = new ResizeObserver(syncParticleLayout)
    resizeObserver.observe(area)
    elements.forEach(element => resizeObserver.observe(element))
    window.addEventListener('resize', syncParticleLayout)
    window.visualViewport?.addEventListener('resize', syncParticleLayout)
    const chooseDirections = () => {
      const currentBounds = bounds()
      const areaRect = area.getBoundingClientRect()
      const frogRect = frogRef.current?.getBoundingClientRect()
      const frogCenter = frogRect ? {
        x: frogRect.left - areaRect.left + frogRect.width / 2,
        y: frogRect.top - areaRect.top + frogRect.height * .42,
        radius: frogRect.width * .72,
      } : null
      particles.forEach((particle, particleIndex) => {
        const centerX = particle.x + particle.width / 2
        const centerY = particle.y + particle.height / 2
        const radius = Math.min(particle.width, particle.height) / 2
        const probeDistance = Math.max(particle.width * 1.8, Math.min(currentBounds.width, currentBounds.height) * .2)
        const candidates = Array.from({ length: 12 }, () => {
          const angle = Math.random() * Math.PI * 2
          const futureX = centerX + Math.cos(angle) * probeDistance
          const futureY = centerY + Math.sin(angle) * probeDistance
          const inside = futureX >= radius && futureX <= currentBounds.width - radius
            && futureY >= radius && futureY <= currentBounds.height - radius
          const wallClearance = Math.max(0, Math.min(
            futureX - radius,
            currentBounds.width - radius - futureX,
            futureY - radius,
            currentBounds.height - radius - futureY,
          ))
          const directionX = Math.cos(angle)
          const directionY = Math.sin(angle)
          const crowding = particles.reduce((score, other, otherIndex) => {
            if (otherIndex === particleIndex) return score
            const dx = other.x + other.width / 2 - centerX
            const dy = other.y + other.height / 2 - centerY
            const distance = Math.max(1, Math.hypot(dx, dy))
            const alignment = (dx * directionX + dy * directionY) / distance
            if (alignment <= .35) return score
            const proximity = Math.max(0, 1 - distance / (probeDistance * 2.4))
            return score + alignment * alignment * (.65 + proximity * 2.35)
          }, 0)
          const frogCrowding = frogCenter ? (() => {
            const dx = frogCenter.x - centerX
            const dy = frogCenter.y - centerY
            const distance = Math.max(1, Math.hypot(dx, dy))
            const alignment = (dx * directionX + dy * directionY) / distance
            return alignment > .45 && distance < probeDistance * 2
              ? alignment * (1 - distance / (probeDistance * 2))
              : 0
          })() : 0
          const edgePreference = .45 + Math.min(2.2, wallClearance / Math.max(1, radius))
          const emptySectorBonus = crowding < .08 ? 3.4 : 1
          const weight = inside
            ? Math.max(.018, edgePreference * emptySectorBonus / (1 + crowding * 16 + frogCrowding * 5))
            : .008
          return { angle, weight }
        })
        let ticket = Math.random() * candidates.reduce((sum, candidate) => sum + candidate.weight, 0)
        let direction = candidates[candidates.length - 1]
        for (const candidate of candidates) {
          ticket -= candidate.weight
          if (ticket <= 0) {
            direction = candidate
            break
          }
        }
        const speed = (34 + Math.random() * 18) * (1 + session.index * 4 / 9) * layoutSpeedFactor(currentBounds) * flightSpeedScale
        particle.vx = Math.cos(direction.angle) * speed
        particle.vy = Math.sin(direction.angle) * speed
      })
    }
    chooseDirections()
    let animationFrame = 0
    let previousTime = performance.now()
    const move = (time: number) => {
      const dt = Math.min(.035, (time - previousTime) / 1000)
      previousTime = time
      const currentBounds = bounds()
      particles.forEach(particle => {
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt
        const maxX = Math.max(0, currentBounds.width - particle.width)
        const maxY = Math.max(0, currentBounds.height - particle.height)
        if (particle.x <= 0 || particle.x >= maxX) {
          particle.x = Math.max(0, Math.min(maxX, particle.x))
          particle.vx *= -1
        }
        if (particle.y <= 0 || particle.y >= maxY) {
          particle.y = Math.max(0, Math.min(maxY, particle.y))
          particle.vy *= -1
        }
      })
      const areaRect = area.getBoundingClientRect()
      const frogRect = frogRef.current?.getBoundingClientRect()
      if (frogRect) {
        const frogX = frogRect.left - areaRect.left + frogRect.width / 2
        const frogY = frogRect.top - areaRect.top + frogRect.height * .42
        particles.forEach(particle => {
          const centerX = particle.x + particle.width / 2
          const centerY = particle.y + particle.height / 2
          const dx = centerX - frogX
          const dy = centerY - frogY
          const distance = Math.max(.01, Math.hypot(dx, dy))
          const safeDistance = frogRect.width * .72 + Math.min(particle.width, particle.height) * .58
          if (distance < safeDistance) {
            const nx = dx / distance
            const ny = dy / distance
            const push = safeDistance - distance
            particle.x += nx * push
            particle.y += ny * push
            particle.vx += nx * 52
            particle.vy += ny * 52
          }
        })
      }
      for (let firstIndex = 0; firstIndex < particles.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < particles.length; secondIndex += 1) {
          const first = particles[firstIndex]
          const second = particles[secondIndex]
          let dx = second.x + second.width / 2 - (first.x + first.width / 2)
          let dy = second.y + second.height / 2 - (first.y + first.height / 2)
          let distance = Math.hypot(dx, dy)
          const minimumDistance = Math.min(first.width, first.height) * .32 + Math.min(second.width, second.height) * .32
          if (distance >= minimumDistance) continue
          if (distance < .01) {
            const separationAngle = (firstIndex * 2.4 + secondIndex) % (Math.PI * 2)
            dx = Math.cos(separationAngle)
            dy = Math.sin(separationAngle)
            distance = 1
          }
          const normalX = dx / distance
          const normalY = dy / distance
          const correction = (minimumDistance - distance) * .5
          first.x -= normalX * correction
          first.y -= normalY * correction
          second.x += normalX * correction
          second.y += normalY * correction
          first.vx -= normalX * 8
          first.vy -= normalY * 8
          second.vx += normalX * 8
          second.vy += normalY * 8
        }
      }
      particles.forEach((particle, index) => {
        const speed = Math.hypot(particle.vx, particle.vy)
        const maximumSpeed = 64 * (1 + session.index * 4 / 9) * layoutSpeedFactor(currentBounds) * flightSpeedScale
        if (speed > maximumSpeed) {
          particle.vx = particle.vx / speed * maximumSpeed
          particle.vy = particle.vy / speed * maximumSpeed
        }
        particle.x = Math.max(0, Math.min(Math.max(0, currentBounds.width - particle.width), particle.x))
        particle.y = Math.max(0, Math.min(Math.max(0, currentBounds.height - particle.height), particle.y))
        elements[index].style.transform = 'translate3d(' + particle.x + 'px,' + particle.y + 'px,0)'
      })
      animationFrame = requestAnimationFrame(move)
    }
    particles.forEach((particle, index) => {
      elements[index].style.transform = 'translate3d(' + particle.x + 'px,' + particle.y + 'px,0)'
    })
    let directionTimer = 0
    const scheduleDirectionChange = () => {
      directionTimer = window.setTimeout(() => {
        chooseDirections()
        scheduleDirectionChange()
      }, 340 + Math.random() * 480)
    }
    if (!reducedMotion) {
      scheduleDirectionChange()
      animationFrame = requestAnimationFrame(move)
    }
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncParticleLayout)
      window.visualViewport?.removeEventListener('resize', syncParticleLayout)
      if (directionTimer) window.clearTimeout(directionTimer)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [flies.length, session.index, task.id])

  useEffect(() => {
    setCaught(null)
    setTongue(null)
    return () => {
      if (captureTimerRef.current !== null) window.clearTimeout(captureTimerRef.current)
      if (wrongEffectTimerRef.current !== null) window.clearTimeout(wrongEffectTimerRef.current)
    }
  }, [task.id])

  useEffect(() => () => {
    if (messageTimerRef.current !== null) window.clearTimeout(messageTimerRef.current)
  }, [])

  useEffect(() => () => {
    if (defeatTimerRef.current !== null) window.clearTimeout(defeatTimerRef.current)
  }, [])
  const trackPointer = (event: React.PointerEvent<HTMLElement>) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    const nx = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)))
    const zone = Math.min(11, Math.max(0, Math.floor((nx + 1) / 2 * 12)))
    setLook(zone < 6 ? { frame: 5 - zone, mirror: true } : { frame: zone - 6, mirror: false })
  }

  const choose = (letter: string, index: number, event: MouseEvent<HTMLButtonElement>) => {
    if (tongue) return
    const stageRect = stageRef.current?.getBoundingClientRect()
    const frogRect = frogRef.current?.getBoundingClientRect()
    const targetRect = event.currentTarget.getBoundingClientRect()
    if (!stageRect || !frogRect) return
    const isCorrect = letter === task.missing
    audio.play('tap')
    audio.play('tongue')
    setResultImpact(null)
    const mouthX = frogRect.left + frogRect.width * .5 - stageRect.left
    const mouthY = frogRect.top + frogRect.height * mouthHeightPosition - stageRect.top
    setTongue({
      startX: mouthX,
      startY: mouthY,
      endX: targetRect.left + targetRect.width * .5 - stageRect.left,
      endY: targetRect.top + targetRect.height * .53 - stageRect.top,
    })
    setCaught(index)
    captureTimerRef.current = window.setTimeout(() => {
      captureTimerRef.current = null
      if (isCorrect) {
        setProgress(value => Math.min(10, value + 1))
        setProgressMessage('Верно! Лягушка шагает вперёд.')
        if (messageTimerRef.current !== null) window.clearTimeout(messageTimerRef.current)
        messageTimerRef.current = window.setTimeout(() => {
          messageTimerRef.current = null
          setProgressMessage('')
        }, 900)
        setResultImpact({ x: mouthX, y: mouthY, correct: true })
        if (wrongEffectTimerRef.current !== null) window.clearTimeout(wrongEffectTimerRef.current)
        wrongEffectTimerRef.current = window.setTimeout(() => {
          wrongEffectTimerRef.current = null
          setResultImpact(null)
        }, 520)
        audio.play('correct')
        session.correct()
        return
      }
      const cannotStepBack = progress === 0
      audio.play('wrong')
      setProgress(value => Math.max(0, value - 1))
      setProgressMessage(cannotStepBack ? 'Отступать некуда — попытка завершена.' : 'Ошибка — лягушка шагает назад.')
      if (messageTimerRef.current !== null) window.clearTimeout(messageTimerRef.current)
      messageTimerRef.current = window.setTimeout(() => {
        messageTimerRef.current = null
        setProgressMessage('')
      }, 900)
      setResultImpact({ x: mouthX, y: mouthY, correct: false })
      setCaught(null)
      session.wrong()
      wrongEffectTimerRef.current = window.setTimeout(() => {
        wrongEffectTimerRef.current = null
        setResultImpact(null)
      }, 520)
      if (cannotStepBack) {
        defeatTimerRef.current = window.setTimeout(() => {
          defeatTimerRef.current = null
          onFail(session.score)
        }, 720)
      } else {
        setTongue(null)
      }    }, captureDuration * 1000)
  }

  const tongueVector = tongue ? (() => {
    const dx = tongue.endX - tongue.startX
    const dy = tongue.endY - tongue.startY
    return {
      distance: Math.hypot(dx, dy),
      angle: Math.atan2(dy, dx) * 180 / Math.PI,
    }
  })() : null

  const frogFrame = frogFrames[look.frame]

  return <GameShell game="frog" title="Словарные слова" index={session.index} score={session.score} onExit={onExit} onHelp={onHelp} onAudio={onAudio}>
    <section ref={stageRef} className={'frog-stage feedback-' + session.feedback} onPointerMove={trackPointer} onPointerLeave={() => setLook({ frame: 0, mirror: false })}>
      <div className="mist mist-one"/><div className="mist mist-two"/>
      <div className="frog-quest-progress" aria-label={'Лягушка прошла ' + progress + ' из 10 шагов до короны'}>
        <div className="quest-track">
          {Array.from({ length: 10 }, (_, index) => <i key={index} className={index < progress ? 'reached' : ''}><span>{index + 1}</span></i>)}
          <motion.img className={'progress-frog ' + session.feedback} src={frogProgressFront} alt="" animate={{ left: String(Math.min(progress, 9) / 9 * 100) + '%', y: session.feedback === 'correct' ? [0, -9, 0] : session.feedback === 'wrong' ? [0, 7, -3, 0] : 0 }} transition={{ type: 'spring', stiffness: 125, damping: 15 }}/>
        </div>
        <motion.img className="quest-crown" src={frogCrown} alt="Корона — цель" animate={progress === 10 ? { scale: [1, 1.3, 1.08], rotate: [0, -7, 7, 0] } : { scale: 1 }}/>
      </div>
      <motion.div className="word-lily" key={task.id} initial={{ scale: .72, y: 28 }} animate={{ scale: 1, y: 0 }}>
        <small>Подсказка: {task.hint}</small><strong>{session.feedback === 'correct' ? task.word : hiddenWord(task)}</strong><span>Поймай муху с нужной буквой</span>
      </motion.div>
      <div ref={flyAreaRef} className="flies" aria-label="Летающие варианты букв">
        {flies.map((letter, index) => <div ref={node => { flyNodeRefs.current[index] = node }} className="fly-flight" key={task.id + '-' + letter}><motion.button className={'letter-fly ' + (caught === index ? 'caught' : '')} aria-label={'Муха с буквой ' + letter} onClick={event => choose(letter, index, event)} animate={caught === index ? { opacity: [1, 1, 1, 1, 1, 1, 0], scale: [1, 1.08, .94, 1.07, .96, 1, .92], rotate: [0, -12, 12, -10, 9, 0, 0] } : { opacity: 1, scale: 1, rotate: 0 }} transition={caught === index ? { duration: captureDuration * .34, times: [0, .12, .24, .36, .5, .75, 1], ease: 'easeOut' } : { duration: .2 }}><img src={flySprite} alt="" draggable={false}/><b className="fly-letter">{letter}</b></motion.button></div>)}
      </div>
      {tongue && tongueVector && <motion.svg className="generated-tongue" style={{ left: tongue.startX, top: tongue.startY - 15, width: tongueVector.distance, height: 30, rotate: String(tongueVector.angle) + 'deg' }} viewBox={'0 0 ' + tongueVector.distance + ' 30'} preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="tongue-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c83f66"/><stop offset=".45" stopColor="#ff7898"/><stop offset="1" stopColor="#ff9bb0"/></linearGradient></defs>
        <motion.line x1="0" y1="15" x2={tongueVector.distance} y2="15" stroke="#a72f55" strokeWidth="22" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: captureDuration, times: [0, .34, .44, 1], ease: 'easeInOut' }}/>
        <motion.line x1="0" y1="15" x2={tongueVector.distance} y2="15" stroke="url(#tongue-gradient)" strokeWidth="16" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: captureDuration, times: [0, .34, .44, 1], ease: 'easeInOut' }}/>
        <motion.line x1="4" y1="11" x2={Math.max(4, tongueVector.distance - 5)} y2="11" stroke="#ffc1cf" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 0], opacity: [0, .75, .75, 0] }} transition={{ duration: captureDuration, times: [0, .34, .44, 1], ease: 'easeInOut' }}/>
      </motion.svg>}
      {tongue && caught !== null && <motion.div className="captured-fly" style={{ left: tongue.endX, top: tongue.endY }} initial={{ x: 0, y: 0, scale: 1, opacity: 0 }} animate={{ x: [0, 0, 0, 0, tongue.startX - tongue.endX], y: [0, 0, 0, 0, tongue.startY - tongue.endY], scale: [1, 1, 1, 1, .22], opacity: [0, 0, 1, 1, 0] }} transition={{ duration: captureDuration, times: [0, .3, .34, .44, 1], ease: 'easeInOut' }} aria-hidden="true"><img src={flySprite} alt=""/><b className="fly-letter">{flies[caught]}</b></motion.div>}
      {resultImpact && <motion.div className={'letter-result-effect ' + (resultImpact.correct ? 'correct' : 'wrong')} style={{ left: resultImpact.x, top: resultImpact.y }} initial={{ scale: .2, opacity: 0, rotate: -25 }} animate={{ scale: [1, 1.45, .8], opacity: [0, 1, 0], rotate: [-25, 12, 0] }} transition={{ duration: .52, ease: 'easeOut' }} aria-hidden="true"><span>{resultImpact.correct ? '✓' : '×'}</span><i/><i/><i/></motion.div>}
      <div className="frog-tracker">
        <div ref={frogRef} className="frog-sprite">
          <img key={String(look.frame) + '-' + String(look.mirror)} src={frogFrame} className={look.mirror ? 'mirrored' : ''} alt="Лягушка со спины следит за курсором" draggable={false}/>
        </div>
      </div>
      <div className="feedback-bubble" aria-live="polite">{progressMessage}</div>
    </section>
  </GameShell>
}