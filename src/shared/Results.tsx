import { motion } from 'motion/react'
import { heartsForPercent } from './rewards'

interface ResultsProps {
  correct: number
  total: number
  mistakes?: number
  failed?: boolean
  showModes?: boolean
  level: number
  levelChange: number
  rewardName?: string
  rewardIcon?: string
  rewardLost?: boolean
  onAgain: () => void
  onModes: () => void
  onHome: () => void
}

export function Results({ correct, total, mistakes = 0, failed = false, showModes = true, level, levelChange, rewardName, rewardIcon, rewardLost = false, onAgain, onModes, onHome }: ResultsProps) {
  const percent = Math.round(correct / total * 100)
  const hearts = heartsForPercent(percent)
  const title = failed ? 'Попробуем ещё раз!' : percent === 100 ? 'Безупречно!' : percent >= 75 ? 'Отличная работа!' : 'Хорошее начало!'
  return <main className="results-page"><motion.section className="results-card" initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><span className="eyebrow">{failed ? 'Поражение' : 'Победа'}</span><h1>{title}</h1><div className="result-ring" style={{ '--score': `${percent * 3.6}deg` } as React.CSSProperties}><strong>{percent}%</strong><span>{correct} из {total}</span></div><p className="result-mistakes">Ошибок: <b>{mistakes}</b></p><div className={`level-result ${levelChange > 0 ? 'up' : 'down'}`}><b>{levelChange > 0 ? '+1 уровень' : levelChange < 0 ? '−1 уровень' : 'Уровень не изменился'}</b><span>Теперь уровень {level}</span></div>{rewardName && <motion.div className={`reward-result ${rewardLost ? 'lost' : ''}`} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><span>{rewardLost ? '🩹' : rewardIcon}</span><div><b>{rewardLost ? `${rewardName} потерян или сломан` : `Новая награда: ${rewardName}`}</b><small>{rewardLost ? 'Победи и получи предмет заново.' : 'Предмет добавлен в рюкзак исследователя.'}</small></div></motion.div>}<div className="hearts" aria-label={`${hearts} сердца`}>{[1,2,3].map(n => <motion.span key={n} animate={n <= hearts ? { scale: [0, 1.25, 1] } : { opacity: .18 }} transition={{ delay: n * .18 }}>♥</motion.span>)}</div><p>{failed ? 'Ничего страшного — следующая победа вернёт уровень!' : hearts === 3 ? 'Три сердца летят в твой профиль!' : `Ты получаешь ${hearts} ${hearts === 1 ? 'сердце' : 'сердца'}.`}</p><div className="button-row"><button className="primary-button" onClick={onAgain}>Сыграть ещё</button>{showModes && <button className="secondary-button" onClick={onModes}>Другой режим</button>}<button className="text-button" onClick={onHome}>На главную</button></div></motion.section></main>
}
