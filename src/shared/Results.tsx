import { motion } from 'motion/react'

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
  outcomeTitle?: string
  outcomeText?: string
  remainingHammers?: number
  firstTryRounds?: number
  onAgain: () => void
  onModes: () => void
  onHome: () => void
}

export function Results({ correct, total, mistakes = 0, failed = false, showModes = true, level, levelChange, rewardName, rewardIcon, rewardLost = false, outcomeTitle, outcomeText, remainingHammers, firstTryRounds, onAgain, onModes, onHome }: ResultsProps) {
  const percent = Math.round(correct / total * 100)
  const title = outcomeTitle ?? (failed ? 'Попробуем ещё раз!' : percent === 100 ? 'Безупречно!' : percent >= 75 ? 'Отличная работа!' : 'Хорошее начало!')
  const levelMessage = levelChange > 0 ? 'Победа: +1 уровень' : levelChange < 0 ? 'Поражение: −1 уровень' : failed ? 'Поражение: уровень уже 0' : 'Уровень не изменился'
  return <main className="results-page"><motion.section className="results-card" initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
    <span className="eyebrow">{failed ? 'Поражение' : 'Победа'}</span>
    <h1>{title}</h1>
    {outcomeText && <p className="result-outcome-text">{outcomeText}</p>}
    <div className="result-ring" style={{ '--score': `${percent * 3.6}deg` } as React.CSSProperties}><strong>{percent}%</strong><span>{correct} из {total}</span></div>
    {firstTryRounds !== undefined && <div className="beaver-result-details"><span>Мосты с первой попытки <b>{firstTryRounds} из 10</b></span><span>Осталось молоточков <b>{remainingHammers ?? 0} из 3</b></span></div>}
    <p className="result-mistakes">Ошибок: <b>{mistakes}</b></p>
    <div className={`level-result ${levelChange > 0 ? 'up' : levelChange < 0 ? 'down' : 'same'}`}><b>{levelMessage}</b><span>Текущий уровень: {level}</span></div>
    {rewardName && <motion.div className={`reward-result ${rewardLost ? 'lost' : ''}`} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><span>{rewardLost ? '🩹' : rewardIcon}</span><div><b>{rewardLost ? `${rewardName} потерян или сломан` : `Новая награда: ${rewardName}`}</b><small>{rewardLost ? 'Победи и получи предмет заново.' : 'Предмет добавлен в рюкзак исследователя.'}</small></div></motion.div>}
    <p>{failed ? 'Попытки не ограничены — можно сразу сыграть ещё раз.' : 'Уровень повышен. Продолжай лесное приключение!'}</p>
    <div className="button-row"><button className="primary-button" onClick={onAgain}>Играть снова</button>{showModes && <button className="secondary-button" onClick={onModes}>Другой режим</button>}<button className="text-button" onClick={onHome}>На главную</button></div>
  </motion.section></main>
}
