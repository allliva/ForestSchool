import { useState } from 'react'
import { motion } from 'motion/react'

export function Welcome({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState('')
  return <main className="welcome-page"><div className="forest-layers" aria-hidden="true"><i/><i/><i/></div><motion.section className="welcome-card" initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><div className="brand-mark">ЛШ</div><span className="eyebrow">Добро пожаловать</span><h1>Лесная школа</h1><p>Здесь зверята учат русский язык, строят мосты и собирают волшебные сердца.</p><form onSubmit={e => { e.preventDefault(); if (name.trim()) onCreate(name) }}><label htmlFor="student-name">Как тебя зовут?</label><input id="student-name" autoFocus maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="Напиши своё имя"/><button className="primary-button wide" disabled={!name.trim()}>Войти в лес</button></form></motion.section></main>
}
