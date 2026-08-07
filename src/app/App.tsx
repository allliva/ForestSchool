import { useCallback, useEffect, useMemo, useState } from 'react'
import { Welcome } from './Welcome'
import { Home } from './Home'
import { Profile } from './Profile'
import { ModeSelect } from './ModeSelect'
import { Modal } from '../shared/Modal'
import { Results } from '../shared/Results'
import { addSession, clearProfile, createProfile, loadProfile, saveProfile } from '../shared/storage'
import { audio } from '../shared/audio'
import { heartsForPercent } from '../shared/rewards'
import type { GameId, SessionRecord, StudentProfile } from '../shared/types'
import { games } from './gameInfo'
import { FrogGame } from '../games/frog/components/FrogGame'
import { SquirrelGame } from '../games/squirrel/components/SquirrelGame'
import { BeaverGame } from '../games/beaver/components/BeaverGame'
import { AudioSettings } from './AudioSettings'
import { musicUrl as frogMusicUrl } from '../games/frog/audio/theme'

type Screen = 'home' | 'profile' | 'modes' | 'game' | 'results'

export function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(() => loadProfile())
  const [screen, setScreen] = useState<Screen>('home'); const [gameId, setGameId] = useState<GameId>('frog'); const [modeId, setModeId] = useState('words'); const [modal, setModal] = useState<'help'|'audio'|'rename'|null>(null); const [result, setResult] = useState({ correct: 0, total: 10, failed: false })
  const game = useMemo(() => games.find(g => g.id === gameId)!, [gameId]); const mode = game.modes.find(m => m.id === modeId) ?? game.modes[0]
  useEffect(() => { if (profile) { saveProfile(profile); audio.configure(profile.audio) } }, [profile])
  useEffect(() => { audio.startMusic(screen === 'game' ? gameId : 'home', screen === 'game' && gameId === 'frog' ? frogMusicUrl : undefined); return () => audio.stopMusic() }, [gameId, profile?.audio.enabled, profile?.audio.music, screen])

  const chooseGame = (id: GameId) => { audio.play('tap'); setGameId(id); const selected = games.find(g => g.id === id)!; setModeId(selected.modes[0].id); setScreen(selected.modes.length === 1 ? 'game' : 'modes') }
  const finish = useCallback((correct: number, failed = false) => {
    if (!profile) return; const total = 10; const percent = Math.round(correct / total * 100); const hearts = heartsForPercent(percent)
    const record: SessionRecord = { id: crypto.randomUUID(), gameId, gameTitle: game.title, modeId, modeTitle: mode.title, completedAt: new Date().toISOString(), correct, total, percent, hearts }
    setProfile(addSession(profile, record)); setResult({ correct, total, failed }); setScreen('results'); audio.play('finish')
  }, [game.title, gameId, mode.title, modeId, profile])
  const showHelp = (id?: GameId) => { if (id) setGameId(id); setModal('help') }
  if (!profile) return <Welcome onCreate={name => { const next = createProfile(name); setProfile(next); audio.play('correct') }}/>
  const gameProps = { modeId, onFinish: finish, onExit: () => setScreen(game.modes.length === 1 ? 'home' : 'modes'), onHelp: () => showHelp(), onAudio: () => setModal('audio') }
  return <>
    {screen === 'home' && <Home profile={profile} onProfile={() => setScreen('profile')} onPlay={chooseGame} onHelp={showHelp} onAudio={() => setModal('audio')}/>} 
    {screen === 'profile' && <Profile profile={profile} onBack={() => setScreen('home')} onRename={() => setModal('rename')} onReset={() => { if (confirm('Удалить имя, историю и все сердца?')) { clearProfile(); setProfile(null); setScreen('home') } }}/>} 
    {screen === 'modes' && <ModeSelect game={game} onBack={() => setScreen('home')} onSelect={id => { setModeId(id); setScreen('game'); audio.play('tap') }}/>} 
    {screen === 'game' && (gameId === 'frog' ? <FrogGame {...gameProps} onFail={score => finish(score, true)}/> : gameId === 'squirrel' ? <SquirrelGame {...gameProps}/> : <BeaverGame {...gameProps}/>)}
    {screen === 'results' && <Results {...result} showModes={game.modes.length > 1} onAgain={() => setScreen('game')} onModes={() => setScreen(game.modes.length === 1 ? 'game' : 'modes')} onHome={() => setScreen('home')}/>} 
    {modal === 'help' && <Modal title={`Как играть: ${game.title}`} onClose={() => setModal(null)}><ol className="instruction-list">{game.instruction.map(step => <li key={step}>{step}</li>)}</ol><button className="primary-button wide" onClick={() => setModal(null)}>Всё понятно!</button></Modal>}
    {modal === 'audio' && <Modal title="Звук" onClose={() => setModal(null)}><AudioSettings value={profile.audio} onChange={value => { setProfile({ ...profile, audio: value }); audio.configure(value); audio.play('tap') }}/></Modal>}
    {modal === 'rename' && <Modal title="Изменить имя" onClose={() => setModal(null)}><form className="rename-form" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const name = String(data.get('name') ?? '').trim(); if (name) { setProfile({ ...profile, name: name.slice(0,24) }); setModal(null) } }}><input name="name" defaultValue={profile.name} maxLength={24} autoFocus/><button className="primary-button wide">Сохранить</button></form></Modal>}
  </>
}
