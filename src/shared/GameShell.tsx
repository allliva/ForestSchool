import type { ReactNode } from 'react'
import type { GameId } from './types'

export function GameShell({ game, children, onExit, onHelp, onAudio }: { game: GameId; children: ReactNode; onExit: () => void; onHelp: () => void; onAudio: () => void }) {
  return <main className={`game-page ${game}-theme`}>
    <nav className="game-overlay-controls" aria-label="Управление игрой">
      <button className="game-icon-button home-control" onClick={onExit} aria-label="На главную">⌂</button>
      <span className="game-control-right"><button className="game-icon-button" onClick={onHelp} aria-label="Как играть">?</button><button className="game-icon-button" onClick={onAudio} aria-label="Настройки звука">♫</button></span>
    </nav>
    {children}
  </main>
}