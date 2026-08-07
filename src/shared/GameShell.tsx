import type { ReactNode } from 'react'
import { CharacterLogo } from './CharacterLogo'
import type { GameId } from './types'

export function GameShell({ game, title, index, total = 10, score, children, onExit, onHelp, onAudio }: { game: GameId; title: string; index: number; total?: number; score: number; children: ReactNode; onExit: () => void; onHelp: () => void; onAudio: () => void }) {
  return <main className={`game-page ${game}-theme`}>
    <header className="game-bar"><button className="glass-button" onClick={onExit}>← Выйти</button><div className="game-identity"><CharacterLogo game={game} small/><div><span>{title}</span><div className="progress-track"><i style={{ width: `${Math.min(100, index / total * 100)}%` }}/></div></div></div><div className="game-bar-actions"><button className="glass-button sound-button" onClick={onAudio} aria-label="Настройки звука">♫ Звук</button><button className="glass-button" onClick={onHelp}>? Правила</button></div></header>
    <div className="game-stats"><span>Задание <b>{Math.min(index + 1, total)}</b> / {total}</span><span>Верно с первой попытки: <b>{score}</b></span></div>
    {children}
  </main>
}
