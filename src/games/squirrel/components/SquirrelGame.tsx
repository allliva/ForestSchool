import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { GameShell } from '../../../shared/GameShell'
import { useSession } from '../../../shared/useSession'
import { audio } from '../../../shared/audio'
import { sampleUnique } from '../../../shared/storage'
import { answerForTask, squirrelTasks, syllableCategories } from '../data/tasks'
import '../styles/squirrel.css'

export function SquirrelGame({ onFinish, onExit, onHelp, onAudio }: { modeId: string; onFinish: (score: number) => void; onExit: () => void; onHelp: () => void; onAudio: () => void }) {
  const tasks = useMemo(() => sampleUnique(squirrelTasks, 10), [])
  const session = useSession(tasks.length, onFinish)
  const task = tasks[session.index]
  const [deliveryTarget, setDeliveryTarget] = useState<number | null>(null)
  useEffect(() => setDeliveryTarget(null), [task.id])

  const choose = (category: string, index: number) => {
    if (category === answerForTask(task)) {
      setDeliveryTarget(index); audio.play('correct'); session.correct()
    } else { audio.play('wrong'); session.wrong() }
  }
  const travel = deliveryTarget === null ? 0 : (window.innerWidth < 650 ? 68 + deliveryTarget * 102 : 190 + deliveryTarget * 245)

  return <GameShell game="squirrel" title="Сколько слогов?" index={session.index} score={session.score} onExit={onExit} onHelp={onHelp} onAudio={onAudio}>
    <section className={`squirrel-stage feedback-${session.feedback}`}>
      <div className="falling-leaves" aria-hidden="true"><i>◆</i><i>◆</i><i>◆</i></div>
      <motion.div className="nut-card" key={task.id} drag dragSnapToOrigin
        onDragEnd={(_, info) => { const target = document.elementFromPoint(info.point.x, info.point.y)?.closest<HTMLElement>('[data-category]'); if (target?.dataset.category && target.dataset.index) choose(target.dataset.category, Number(target.dataset.index)) }}
        initial={{ y: -120, rotate: -10 }}
        animate={deliveryTarget === null ? { y: 0, rotate: 0, x: 0, scale: 1, opacity: 1 } : { y: 270, x: (deliveryTarget - 1) * (window.innerWidth < 650 ? 100 : 240), scale: .18, opacity: 0 }}
      ><span>{task.emoji}</span><strong>{task.word}</strong><small>Прохлопай слово</small></motion.div>
      <div className="treasure-chests" role="group" aria-label="Сундуки для ответа">
        {syllableCategories.map((category, index) => <button className={`treasure-chest chest-${index}`} key={category} data-category={category} data-index={index} onClick={() => choose(category,index)}>
          <span className="chest-lid"><i/></span><span className="chest-body"><b>{category}</b><small>Положить орех</small></span>
        </button>)}
      </div>
      <motion.div className="squirrel-runner" animate={deliveryTarget === null ? { x: 0, y: [0,-5,0] } : { x: travel, y: [0,-18,0], rotate: [0,7,-4,0] }} transition={{ duration: deliveryTarget === null ? 1.3 : .6 }}>
        <span className="squirrel-tail"/><span className="squirrel-body">🐿️</span><i className="carried-nut">🌰</i>
      </motion.div>
      <div className="feedback-bubble" aria-live="polite">{session.feedback === 'correct' ? 'Белочка несёт орех в сундук!' : session.feedback === 'wrong' ? 'Этот сундук не подходит. Прохлопай ещё раз!' : ''}</div>
    </section>
  </GameShell>
}