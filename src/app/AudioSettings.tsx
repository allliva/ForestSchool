import type { AudioSettings as AudioSettingsType } from '../shared/types'

export function AudioSettings({ value, onChange }: { value: AudioSettingsType; onChange: (value: AudioSettingsType) => void }) {
  return <div className="audio-settings"><label className="switch-row"><span><b>Звуки включены</b><small>Музыка и игровые подсказки</small></span><input type="checkbox" checked={value.enabled} onChange={e => onChange({ ...value, enabled: e.target.checked })}/></label><label><span>Музыка</span><input type="range" min="0" max="1" step="0.05" value={value.music} disabled={!value.enabled} onChange={e => onChange({ ...value, music: Number(e.target.value) })}/></label><label><span>Эффекты</span><input type="range" min="0" max="1" step="0.05" value={value.effects} disabled={!value.enabled} onChange={e => onChange({ ...value, effects: Number(e.target.value) })}/></label></div>
}
