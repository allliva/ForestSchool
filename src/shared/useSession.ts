import { useCallback, useState } from 'react'

export function useSession(total: number | null, onFinish: (score: number, mistakes: number) => void) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [mistake, setMistake] = useState(false)
  const [feedback, setFeedback] = useState<'idle'|'correct'|'wrong'>('idle')
  const wrong = useCallback(() => {
    setMistakes(value => value + 1)
    setMistake(true)
    setFeedback('wrong')
    window.setTimeout(() => setFeedback('idle'), 550)
  }, [])
  const correct = useCallback((awardPoint = true) => {
    if (feedback === 'correct') return
    const nextScore = score + (awardPoint && !mistake ? 1 : 0)
    setScore(nextScore)
    setFeedback('correct')
    window.setTimeout(() => {
      if (total !== null && index + 1 >= total) onFinish(nextScore, mistakes)
      else {
        setIndex(value => value + 1)
        setMistake(false)
        setFeedback('idle')
      }
    }, 650)
  }, [feedback, index, mistake, mistakes, onFinish, score, total])
  return { index, score, mistakes, mistake, feedback, wrong, correct }
}