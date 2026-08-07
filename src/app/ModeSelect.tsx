import { CharacterLogo } from '../shared/CharacterLogo'
import type { GameInfo } from './gameInfo'

export function ModeSelect({ game, onSelect, onBack }: { game: GameInfo; onSelect: (id: string) => void; onBack: () => void }) {
  return <main className={`mode-page ${game.id}-mode-page`}><header><button className="glass-button" onClick={onBack}>← На главную</button></header><section className="mode-hero"><CharacterLogo game={game.id}/><span className="eyebrow">Выбери тренировку</span><h1>{game.title}</h1><p>{game.description}</p></section><section className="mode-grid">{game.modes.map((mode, i) => <button className="mode-card" onClick={() => onSelect(mode.id)} key={mode.id}><span className="mode-icon">{mode.icon}</span><small>Режим {i + 1}</small><h2>{mode.title}</h2><p>{mode.description}</p><em>Начать →</em></button>)}</section></main>
}
