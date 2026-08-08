import { motion } from 'motion/react'
import type { StudentProfile } from '../shared/types'
import { explorerRewards, titleForLevel } from '../shared/rewards'

export function Profile({ profile, onBack, onRename, onReset }: { profile: StudentProfile; onBack: () => void; onRename: () => void; onReset: () => void }) {
  const nextReward = explorerRewards.find(reward => reward.unlockLevel > profile.level)
  const previousThreshold = nextReward ? nextReward.unlockLevel - 2 : 20
  const progress = nextReward ? (profile.level - previousThreshold) / 2 * 100 : 100
  const wins = profile.sessions.filter(session => session.outcome === 'win').length
  const losses = profile.sessions.filter(session => session.outcome === 'loss').length

  return <main className="profile-page">
    <div className="profile-atmosphere" aria-hidden="true"/>
    <header className="profile-header">
      <div className="wordmark">
        <span className="profile-logo-plaque" aria-hidden="true">🌲</span>
        <div><b>Лесная школа</b><small>Дневник исследователя</small></div>
      </div>
      <div className="profile-header-actions">
        <button className="profile-back-button" onClick={onBack}>← На главную</button>
        <button className="profile-reset-button" onClick={onReset}>Сбросить профиль</button>
      </div>
    </header>

    <section className="profile-layout">
      <motion.aside className={`profile-showcase tier-${profile.appearanceTier}`} initial={{ scale: .94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <span className="profile-card-ornament" aria-hidden="true">❧ ◆ ❧</span>
        <div className="magic-particles" aria-hidden="true">✦ · ✧ · ✦</div>
        <div className="avatar-medallion"><div className="big-avatar">{profile.name[0]?.toUpperCase()}</div></div>
        <span className="profile-eyebrow">Исследователь леса</span>
        <h1>{profile.name}</h1>
        <p className="profile-rank">{titleForLevel(profile.level)}</p>
        <div className="profile-level-seal" aria-label={`Уровень ${profile.level}`}><strong>{profile.level}</strong><span>уровень</span></div>
        <button className="profile-rename-button" onClick={onRename}>✎ Изменить имя</button>
      </motion.aside>

      <div className="profile-content">
        <section className="profile-section stats-section" aria-labelledby="stats-title">
          <div className="section-heading"><span aria-hidden="true">❧</span><div><small>Лесной дневник</small><h2 id="stats-title">Мои приключения</h2></div><span aria-hidden="true">❧</span></div>
          <div className="stats-grid">
            <article><span aria-hidden="true">✦</span><strong>{profile.level}</strong><small>текущий уровень</small></article>
            <article><span aria-hidden="true">↻</span><strong>{profile.sessions.length}</strong><small>игр пройдено</small></article>
            <article className="stat-win"><span aria-hidden="true">✓</span><strong>{wins}</strong><small>побед</small></article>
            <article className="stat-loss"><span aria-hidden="true">×</span><strong>{losses}</strong><small>поражений</small></article>
          </div>
        </section>

        <section className="next-tier">
          <div className="next-reward-emblem" aria-hidden="true">{nextReward?.icon ?? '★'}</div>
          <div className="next-reward-copy">
            <small>Следующая ступень</small>
            <h3>{nextReward ? nextReward.item : 'Полный комплект исследователя!'}</h3>
            <p>{nextReward ? `Ещё ${nextReward.unlockLevel - profile.level} ${nextReward.unlockLevel - profile.level === 1 ? 'победа' : 'победы'} до уровня ${nextReward.unlockLevel}. Поражение отнимает один уровень.` : 'Все 10 предметов собраны. Уровень можно повышать дальше!'}</p>
          </div>
          <div className="tier-progress" aria-label={`Прогресс до следующей награды: ${progress}%`}><i style={{ width: `${progress}%` }}/><span>{Math.round(progress)}%</span></div>
        </section>

        <section className="equipment profile-section" aria-labelledby="equipment-title">
          <div className="section-heading"><span aria-hidden="true">❧</span><div><small>Коллекция наград</small><h2 id="equipment-title">Снаряжение исследователя</h2><p>Новый предмет и звание открываются каждые два уровня.</p></div><span aria-hidden="true">❧</span></div>
          <div className="equipment-grid">{explorerRewards.map((reward, index) => {
            const unlocked = profile.level >= reward.unlockLevel
            const lost = !unlocked && profile.highestLevel >= reward.unlockLevel
            const state = unlocked ? 'Получено' : lost ? 'Сломано' : 'Закрыто'
            return <motion.article className={unlocked ? 'unlocked' : lost ? 'lost' : 'locked'} key={reward.item} whileHover={{ y: -4 }}>
              <div className="achievement-medal" aria-hidden="true"><span>{unlocked ? reward.icon : lost ? '🩹' : '🔒'}</span><i>{index + 1}</i></div>
              <small>Уровень {reward.unlockLevel}</small>
              <h3>{reward.item}</h3>
              <p>{unlocked ? reward.title : lost ? 'Получи предмет заново' : reward.title}</p>
              <b className="achievement-state">{state}</b>
            </motion.article>
          })}</div>
        </section>

        <section className="history profile-section" aria-labelledby="history-title">
          <div className="section-heading"><span aria-hidden="true">❧</span><div><small>Летопись</small><h2 id="history-title">История приключений</h2></div><span aria-hidden="true">❧</span></div>
          {profile.sessions.length === 0 ? <div className="empty-state"><span>🌱</span><p>Первая история появится после завершённой игры.</p></div> : profile.sessions.map(session => <article key={session.id}><span className={`history-icon ${session.gameId}`}>{session.gameId === 'frog' ? '🐸' : session.gameId === 'squirrel' ? '🐿️' : '🦫'}</span><div><h3>{session.gameTitle} <i className={`session-outcome ${session.outcome}`}>{session.outcome === 'win' ? 'Победа · +1 уровень' : 'Поражение · −1 уровень'}</i></h3><p>{session.modeTitle} · {new Date(session.completedAt).toLocaleDateString('ru-RU')} · Ошибок: {session.mistakes}</p></div><strong>{session.correct}/{session.total}</strong><em>{session.percent}%</em></article>)}
        </section>
      </div>
    </section>
  </main>
}
