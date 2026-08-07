import { useCallback, useState } from 'react'

export function useSession(total: number, onFinish: (score: number) => void) {
  const [index, setIndex] = useState(0); const [score, setScore] = useState(0); const [mistake, setMistake] = useState(false); const [feedback, setFeedback] = useState<'idle'|'correct'|'wrong'>('idle')
  const wrong = useCallback(() => { setMistake(true); setFeedback('wrong'); window.setTimeout(() => setFeedback('idle'), 550) }, [])
  const correct = useCallback(() => {
    if (feedback === 'correct') return
    const nextScore = score + (mistake ? 0 : 1); setScore(nextScore); setFeedback('correct')
    window.setTimeout(() => { if (index + 1 >= total) onFinish(nextScore); else { setIndex(v => v + 1); setMistake(false); setFeedback('idle') } }, 650)
  }, [feedback, index, mistake, onFinish, score, total])
  return { index, score, feedback, wrong, correct }
}
