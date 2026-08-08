import { motion } from 'motion/react'
import type { GameId, StudentProfile } from '../shared/types'
import { games } from './gameInfo'
import { titleForLevel } from '../shared/rewards'
import frogProgressFront from '../games/frog/assets/frog-progress-front.png'
import frogPond from '../games/frog/assets/frog-pond.webp'
import squirrelCelebrate from '../games/squirrel/assets/squirrel-celebrate-v2.webp'
import squirrelClearing from '../games/squirrel/assets/autumn-clearing.webp'
import beaverCardCover from '../games/beaver/assets/beaver-card-cover.webp'
import beaverClearing from '../games/beaver/assets/home-background.webp'

const cardVisuals: Record<GameId, { scene: string; emblem: string; alt: string }> = {
  frog: { scene: frogPond, emblem: '🪷', alt: 'Весёлая лягушка на лесном пруду' },
  squirrel: { scene: squirrelClearing, emblem: '🌰', alt: 'Рыжая белочка у лесной кладовой' },
  beaver: { scene: beaverClearing, emblem: '🪵', alt: 'Бобр строит мост через лесную реку' },
}

export function Home({ profile, onProfile, onPlay, onHelp, onAudio }: {
  profile: StudentProfile
  onProfile: () => void
  onPlay: (game: GameId) => void
  onHelp: (game: GameId) => void
  onAudio: () => void
}) {
  return <main className="home-page">
    <div className="home-atmosphere" aria-hidden="true"/>
    <header className="home-header">
      <div className="wordmark"><span className="home-logo-plaque" aria-hidden="true">🌲</span><div><b>Лесная школа</b><small>Учимся играя</small></div></div>
      <div className="header-actions">
        <button className="icon-button home-sound" onClick={onAudio} aria-label="Настройки звука">{profile.audio.enabled ? '♫' : '♪̸'}</button>
        <button className={'profile-pill tier-' + profile.appearanceTier} onClick={onProfile} aria-label={`Профиль ${profile.name}, уровень ${profile.level}`}><span className="avatar">{profile.name[0]?.toUpperCase()}</span><span><b>{profile.name}</b><small>{titleForLevel(profile.level)}</small></span><em>Ур. {profile.level}</em></button>
      </div>
    </header>

    <section className="hero">
      <span className="home-ornament" aria-hidden="true">❧ <i>◆</i> ❧</span>
      <h1>Кого сегодня позовём на <i>помощь?</i></h1>
      <p><span aria-hidden="true">🍃</span> Выбирай лесного друга и отправляйся на короткую тренировку из десяти заданий. <span aria-hidden="true">🍃</span></p>
    </section>

    <section className="game-grid" aria-label="Выбор игры">
      {games.map((game, index) => {
        const visual = cardVisuals[game.id]
        return <motion.article
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
          whileHover={{ y: -7 }}
        >
          <span className="card-frame-ornaments" aria-hidden="true"><i/><i/><i/><i/></span>
          <span className="card-emblem" aria-hidden="true">{visual.emblem}</span>
          <div className="card-illustration" style={{ backgroundImage: `url(${visual.scene})` }}>
            {game.id === 'frog'
              ? <img className="character-logo frog-home-logo" src={frogProgressFront} alt={visual.alt}/>
              : game.id === 'squirrel'
                ? <img className="character-logo squirrel-home-logo" src={squirrelCelebrate} alt={visual.alt}/>
                : <img className="character-logo beaver-home-cover" src={beaverCardCover} alt={visual.alt}/>
            }
          </div>
          <div className="card-parchment">
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <div className="card-actions">
              <button className="primary-button" onClick={event => { event.stopPropagation(); onPlay(game.id) }}>Играть <span aria-hidden="true">🍃</span></button>
              <button className="secondary-button" onClick={event => { event.stopPropagation(); onHelp(game.id) }}>Как играть</button>
            </div>
          </div>
        </motion.article>
      })}
    </section>

    <footer className="home-footer"><span aria-hidden="true">★</span> Учись <i>•</i> Играй <i>•</i> Открывай <span aria-hidden="true">★</span></footer>
  </main>
}
