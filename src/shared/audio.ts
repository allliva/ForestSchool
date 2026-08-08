import type { AudioSettings } from './types'

export type SoundName = 'tap' | 'tongue' | 'chest' | 'catch' | 'correct' | 'wrong' | 'reward' | 'finish'

class ForestAudio {
  private ctx?: AudioContext
  private timer?: number
  private track?: HTMLAudioElement
  private settings: AudioSettings = { enabled: true, music: .22, effects: .55 }
  private theme = 0

  configure(settings: AudioSettings) { this.settings = settings; if (this.track) this.track.volume = settings.music; if (!settings.enabled) this.stopMusic() }
  private context() { this.ctx ??= new AudioContext(); if (this.ctx.state === 'suspended') void this.ctx.resume(); return this.ctx }
  play(name: SoundName) {
    if (!this.settings.enabled) return
    const ctx = this.context(); const now = ctx.currentTime
    const map: Record<SoundName, [number[], OscillatorType, number]> = {
      tap: [[520], 'sine', .07],
      tongue: [[330, 460], 'sine', .08],
      chest: [[185, 245], 'triangle', .09],
      catch: [[620, 820], 'sine', .08],
      correct: [[520, 720, 920], 'sine', .12],
      wrong: [[210, 160], 'triangle', .14],
      reward: [[660, 880, 1100], 'sine', .18],
      finish: [[440, 660, 880, 1040], 'triangle', .2],
    }
    const [notes, type, duration] = map[name]
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain(); const start = now + index * duration * .65
      osc.type = type; osc.frequency.value = frequency; gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(Math.max(.001, this.settings.effects * .12), start + .015); gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
      osc.connect(gain).connect(ctx.destination); osc.start(start); osc.stop(start + duration + .02)
    })
  }
  startMusic(theme: 'home' | 'frog' | 'squirrel' | 'beaver', trackUrl?: string) {
    this.stopMusic(); if (!this.settings.enabled || this.settings.music <= 0) return
    if (trackUrl) {
      const track = new Audio(trackUrl); track.loop = true; track.preload = 'auto'; track.volume = this.settings.music
      this.track = track; track.load(); void track.play().catch(() => undefined); return
    }
    const roots = { home: 262, frog: 294, squirrel: 330, beaver: 220 }; this.theme = roots[theme]
    const tick = () => { if (!this.settings.enabled) return; const ctx = this.context(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.value = this.theme * [1, 1.25, 1.5, 2][Math.floor(Math.random() * 4)]; gain.gain.value = this.settings.music * .025; osc.connect(gain).connect(ctx.destination); osc.start(); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .55); osc.stop(ctx.currentTime + .6) }
    tick(); this.timer = window.setInterval(tick, 1300)
  }
  stopMusic() {
    if (this.timer) window.clearInterval(this.timer); this.timer = undefined
    if (this.track) { this.track.pause(); this.track.currentTime = 0 }; this.track = undefined
  }
}

export const audio = new ForestAudio()
