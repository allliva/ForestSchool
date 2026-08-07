import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { GameShell } from '../../../shared/GameShell'
import { CharacterLogo } from '../../../shared/CharacterLogo'
import { useSession } from '../../../shared/useSession'
import { audio } from '../../../shared/audio'
import { sampleUnique } from '../../../shared/storage'
import { beaverTasks } from '../data/tasks'
import '../styles/beaver.css'

const shuffle = <T,>(items: readonly T[]) => [...items].sort(() => Math.random() - .5)

export function BeaverGame({ onFinish, onExit, onHelp, onAudio }: { modeId: string; onFinish: (score: number) => void; onExit: () => void; onHelp: () => void; onAudio: () => void }) {
  const [tasks] = useState(() => sampleUnique(beaverTasks, 10))
  const session = useSession(tasks.length, onFinish)
  const task = tasks[session.index]
  const [available, setAvailable] = useState<string[]>([])
  const [bridge, setBridge] = useState<string[]>([])
  useEffect(() => { setBridge([]); setAvailable(shuffle(task.words)) }, [task])

  const selectWord = (word: string, index: number) => {
    setBridge([...bridge, word]); setAvailable(available.filter((_, itemIndex) => itemIndex !== index)); audio.play('tap')
  }
  const removeBridge = (word: string, index: number) => {
    setBridge(bridge.filter((_, itemIndex) => itemIndex !== index)); setAvailable([...available, word]); audio.play('tap')
  }
  const checkOrder = () => {
    if (bridge.join('|') === task.words.join('|')) { audio.play('correct'); session.correct() }
    else { audio.play('wrong'); session.wrong() }
  }
  const step = window.innerWidth < 650 ? 44 : 76
  const beaverX = session.feedback === 'correct' ? Math.min(560, task.words.length * step + 180) : bridge.length * step

  return <GameShell game="beaver" title="Собери предложение" index={session.index} score={session.score} onExit={onExit} onHelp={onHelp} onAudio={onAudio}>
    <section className={`beaver-stage feedback-${session.feedback}`}>
      <div className="river-sparkles" aria-hidden="true">✦ · ✧ · ✦</div>
      <div className="beaver-prompt"><small>Передавай бобру брёвна по порядку</small><strong>{bridge.length ? bridge.join(' ') : 'Собери правильное предложение'}</strong></div>
      <div className="round-bridge" aria-label="Собранное предложение">
        {bridge.length === 0 && <span className="bridge-hint">Мост пока пуст</span>}
        {bridge.map((word,index) => <motion.button layout className="round-log placed" key={`${word}-${index}`} onClick={() => removeBridge(word,index)}><i className="log-end left"/><b>{word}</b><i className="log-end right"/></motion.button>)}
      </div>
      <div className="log-bank" aria-label="Доступные брёвна">
        {available.map((word,index) => <motion.button layout whileHover={{ y: -8, rotate: index % 2 ? 2 : -2 }} className="round-log" key={`${word}-${index}`} onClick={() => selectWord(word,index)}><i className="log-end left"/><b>{word}</b><i className="log-end right"/></motion.button>)}
      </div>
      <button className="check-bridge" disabled={bridge.length !== task.words.length} onClick={checkOrder}>Проверить мост</button>
      <motion.div className="working-beaver" animate={{ x: beaverX, y: session.feedback === 'correct' ? [0,-18,0] : [0,-3,0], rotate: session.feedback === 'wrong' ? [0,-5,5,0] : 0 }} transition={{ duration: .6 }}>
        <CharacterLogo game="beaver"/><motion.span animate={bridge.length ? { rotate: [0,-18,8,0] } : { rotate: 0 }}>🪵</motion.span>
      </motion.div>
      <div className="feedback-bubble" aria-live="polite">{session.feedback === 'correct' ? 'Готово! Бобёр перебегает по мосту!' : session.feedback === 'wrong' ? 'Мост качается. Переставь круглые брёвна!' : ''}</div>
    </section>
  </GameShell>
}