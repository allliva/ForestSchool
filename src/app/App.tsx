import { useCallback, useEffect, useMemo, useState } from 'react'
import { Welcome } from './Welcome'
import { Home } from './Home'
import { Profile } from './Profile'
import { ModeSelect } from './ModeSelect'
import { Modal } from '../shared/Modal'
import { Results } from '../shared/Results'
import { addSession, clearProfile, createProfile, loadProfile, saveProfile } from '../shared/storage'
import { audio } from '../shared/audio'
import { explorerRewards } from '../shared/rewards'
import type { GameId, SessionRecord, StudentProfile } from '../shared/types'
import { games } from './gameInfo'
import { FrogGame } from '../games/frog/components/FrogGame'
import { SquirrelGame } from '../games/squirrel/components/SquirrelGame'
import { BeaverGame } from '../games/beaver/components/BeaverGame'
import { AudioSettings } from './AudioSettings'
import { musicUrl as frogMusicUrl } from '../games/frog/audio/theme'
import { musicUrl as squirrelMusicUrl } from '../games/squirrel/audio/theme'
import { musicUrl as beaverMusicUrl } from '../games/beaver/audio/theme'
import { preloadVisualAssets } from '../shared/preloadAssets'

type Screen = 'home' | 'profile' | 'modes' | 'game' | 'results'
type ResultState = { correct: number; total: number; failed: boolean; mistakes: number; level: number; levelChange: number; rewardName?: string; rewardIcon?: string; rewardLost?: boolean; outcomeTitle?: string; outcomeText?: string; remainingHammers?: number; firstTryRounds?: number }

export function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(() => loadProfile())
  const [visualsReady, setVisualsReady] = useState(false)
  const [screen, setScreen] = useState<Screen>('home'); const [gameId, setGameId] = useState<GameId>('frog'); const [modeId, setModeId] = useState('words'); const [modal, setModal] = useState<'help'|'audio'|'rename'|null>(null); const [result, setResult] = useState<ResultState>({ correct: 0, total: 10, failed: false, mistakes: 0, level: profile?.level ?? 0, levelChange: 0 })
  const game = useMemo(() => games.find(g => g.id === gameId)!, [gameId]); const mode = game.modes.find(m => m.id === modeId) ?? game.modes[0]
  useEffect(() => {
    let active = true
    void preloadVisualAssets().finally(() => { if (active) setVisualsReady(true) })
    return () => { active = false }
  }, [])
  useEffect(() => { if (profile) { saveProfile(profile); audio.configure(profile.audio) } }, [profile])
  useEffect(() => {
    const trackUrl = screen === 'game' ? gameId === 'frog' ? frogMusicUrl : gameId === 'squirrel' ? squirrelMusicUrl : beaverMusicUrl : undefined
    audio.startMusic(screen === 'game' ? gameId : 'home', trackUrl)
    return () => audio.stopMusic()
  }, [gameId, profile?.audio.enabled, profile?.audio.music, screen])

  const chooseGame = (id: GameId) => { audio.play('tap'); setGameId(id); const selected = games.find(g => g.id === id)!; setModeId(selected.modes[0].id); setScreen(selected.modes.length === 1 ? 'game' : 'modes') }
  const finish = useCallback((correct: number, mistakes = 0, failed = false) => {
    if (!profile) return; const total = 10; const percent = Math.round(correct / total * 100)
    const record: SessionRecord = { id: crypto.randomUUID(), gameId, gameTitle: game.title, modeId, modeTitle: mode.title, completedAt: new Date().toISOString(), correct, total, percent, mistakes, outcome: failed ? 'loss' : 'win' }
    const nextProfile = addSession(profile, record)
    const levelChange = nextProfile.level - profile.level
    const unlockedReward = nextProfile.appearanceTier > profile.appearanceTier ? explorerRewards[nextProfile.appearanceTier - 1] : undefined
    const lostReward = nextProfile.appearanceTier < profile.appearanceTier ? explorerRewards[profile.appearanceTier - 1] : undefined
    setProfile(nextProfile)
    setResult({ correct, total, failed, mistakes, level: nextProfile.level, levelChange, rewardName: unlockedReward?.item ?? lostReward?.item, rewardIcon: unlockedReward?.icon, rewardLost: Boolean(lostReward), outcomeTitle: gameId === 'beaver' ? failed ? 'У бобра закончились молоточки!' : 'Бобр добрался домой!' : undefined, outcomeText: gameId === 'beaver' ? failed ? 'Попробуем пройти путь ещё раз?' : 'Все 10 мостов построены!' : undefined, remainingHammers: gameId === 'beaver' ? Math.max(0, 5 - mistakes) : undefined, firstTryRounds: gameId === 'beaver' ? correct : undefined })
    setScreen('results'); audio.play('finish')
  }, [game.title, gameId, mode.title, modeId, profile])
  const showHelp = (id?: GameId) => { if (id) setGameId(id); setModal('help') }
  if (!visualsReady) return <main className="asset-loader" aria-live="polite"><div className="loader-leaf">◆</div><b>Лесная школа</b><span>Готовим лесную поляну…</span></main>
  if (!profile) return <Welcome onCreate={name => { const next = createProfile(name); setProfile(next); audio.play('correct') }}/>
  const gameProps = { modeId, onFinish: finish, onExit: () => setScreen(game.modes.length === 1 ? 'home' : 'modes'), onHelp: () => showHelp(), onAudio: () => setModal('audio') }
  return <>
    {screen === 'home' && <Home profile={profile} onProfile={() => setScreen('profile')} onPlay={chooseGame} onHelp={showHelp} onAudio={() => setModal('audio')}/>}
    {screen === 'profile' && <Profile profile={profile} onBack={() => setScreen('home')} onRename={() => setModal('rename')} onReset={() => { if (confirm('Удалить имя, историю, уровни и предметы?')) { clearProfile(); setProfile(null); setScreen('home') } }}/>}
    {screen === 'modes' && <ModeSelect game={game} onBack={() => setScreen('home')} onSelect={id => { setModeId(id); setScreen('game'); audio.play('tap') }}/>}
    {screen === 'game' && (gameId === 'frog' ? <FrogGame {...gameProps} onFail={(score, mistakes) => finish(score, mistakes, true)}/> : gameId === 'squirrel' ? <SquirrelGame {...gameProps} level={profile.level} onFail={(score, mistakes) => finish(score, mistakes, true)}/> : <BeaverGame {...gameProps} onFail={(score, mistakes) => finish(score, mistakes, true)}/>)}
    {screen === 'results' && <Results {...result} showModes={game.modes.length > 1} onAgain={() => setScreen('game')} onModes={() => setScreen(game.modes.length === 1 ? 'game' : 'modes')} onHome={() => setScreen('home')}/>}
    {modal === 'help' && <Modal title={`Как играть: ${game.title}`} onClose={() => setModal(null)}><ol className="instruction-list">{game.instruction.map(step => <li key={step}>{step}</li>)}</ol><button className="primary-button wide" onClick={() => setModal(null)}>Всё понятно!</button></Modal>}
    {modal === 'audio' && <Modal title="Звук" onClose={() => setModal(null)}><AudioSettings value={profile.audio} onChange={value => { setProfile({ ...profile, audio: value }); audio.configure(value); audio.play('tap') }}/></Modal>}
    {modal === 'rename' && <Modal title="Изменить имя" onClose={() => setModal(null)}><form className="rename-form" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const name = String(data.get('name') ?? '').trim(); if (name) { setProfile({ ...profile, name: name.slice(0,24) }); setModal(null) } }}><input name="name" defaultValue={profile.name} maxLength={24} autoFocus/><button className="primary-button wide">Сохранить</button></form></Modal>}
  </>
}
