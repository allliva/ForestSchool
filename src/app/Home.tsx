import { motion } from 'motion/react'
import { CharacterLogo } from '../shared/CharacterLogo'
import type { GameId, StudentProfile } from '../shared/types'
import { games } from './gameInfo'
import { titleForLevel } from '../shared/rewards'
import frogProgressFront from '../games/frog/assets/frog-progress-front.png'
import squirrelCelebrate from '../games/squirrel/assets/squirrel-celebrate-v2.webp'

export function Home({ profile, onProfile, onPlay, onHelp, onAudio }: {
  profile: StudentProfile
  onProfile: () => void
  onPlay: (game: GameId) => void
  onHelp: (game: GameId) => void
  onAudio: () => void
}) {
  return <main className="home-page">
    <header className="home-header">
      <div className="wordmark"><span className="brand-mark small">ЛШ</span><div><b>Лесная школа</b><small>Учимся играя</small></div></div>
      <div className="header-actions">
        <button className="icon-button" onClick={onAudio} aria-label="Настройки звука">{profile.audio.enabled ? '♫' : '♪̸'}</button>
        <button className={'profile-pill tier-' + profile.appearanceTier} onClick={onProfile}><span className="avatar">{profile.name[0]?.toUpperCase()}</span><span><b>{profile.name}</b><small>{titleForLevel(profile.level)}</small></span><em>Ур. {profile.level}</em></button>
      </div>
    </header>
    <section className="hero"><span className="eyebrow">Три тропинки — три умения</span><h1>Кого сегодня<br/><i>позовём на помощь?</i></h1><p>Выбирай лесного друга и отправляйся на короткую тренировку из десяти заданий.</p></section>
    <section className="game-grid" aria-label="Выбор игры">
      {games.map((game, index) => <motion.article
        className={'game-card ' + game.id + '-card'}
        key={game.id}
        role="button"
        tabIndex={0}
        aria-label={'Играть в «' + game.title + '»'}
        onClick={() => onPlay(game.id)}
        onKeyDown={event => {
          if (event.currentTarget !== event.target) return
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPlay(game.id) }
        }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * .12 }}
        whileHover={{ y: -8 }}
      >
        <div className="card-glow"/>
        <span className="card-number">0{index + 1}</span>
        {game.id === 'frog'
          ? <img className="character-logo frog-home-logo" src={frogProgressFront} alt="Весёлая лягушка"/>
          : game.id === 'squirrel'
            ? <img className="character-logo squirrel-home-logo" src={squirrelCelebrate} alt="Радостная рыжая белочка"/>
            : <CharacterLogo game={game.id}/>}
        <span className="skill-tag">{game.subtitle}</span>
        <h2>{game.title}</h2>
        <p>{game.description}</p>
        <div className="card-actions">
          <button className="primary-button" onClick={event => { event.stopPropagation(); onPlay(game.id) }}>Играть <span>→</span></button>
          <button className="secondary-button" onClick={event => { event.stopPropagation(); onHelp(game.id) }}>Как играть</button>
        </div>
      </motion.article>)}
    </section>
    <footer>Сделано с заботой о маленьких исследователях · Работает без интернета</footer>
  </main>
}
