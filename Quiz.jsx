import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function Quiz({ level, onComplete, onNavigate }) {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState({})
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initQuiz = async () => {
      try {
        // Fetch questions
        const response = await axios.get(`/api/questions/${encodeURIComponent(level)}?limit=10`)
        setQuestions(response.data)

        // Start exam session
        const sessionResponse = await axios.post('/api/exams/start', {
          user_id: 'user_' + Date.now(),
          level: level,
          question_count: response.data.length
        })
        setSessionId(sessionResponse.data.session_id)
        setLoading(false)
      } catch (error) {
        console.error('Failed to initialize quiz:', error)
        setLoading(false)
      }
    }

    initQuiz()
  }, [level])

  const currentQuestion = questions[currentIndex]
  const isAnswered = submitted[currentQuestion?.id]
  const selectedAnswer = answers[currentQuestion?.id]
  const isCorrect = results[currentQuestion?.id]
  const correctCount = Object.values(results).filter(Boolean).length

  const handleSelectAnswer = (value) => {
    if (!isAnswered) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
    }
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return

    try {
      const response = await axios.post('/api/answers/submit', {
        session_id: sessionId,
        question_id: currentQuestion.id,
        user_answer: selectedAnswer
      })

      setSubmitted(prev => ({ ...prev, [currentQuestion.id]: true }))
      setResults(prev => ({ ...prev, [currentQuestion.id]: response.data.is_correct }))
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Complete quiz
      const score = (correctCount / questions.length) * 100
      try {
        await axios.post('/api/exams/complete', {
          session_id: sessionId,
          score: score
        })
        onComplete(sessionId)
      } catch (error) {
        console.error('Failed to complete quiz:', error)
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">テストを準備中...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">問題が見つかりません</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">英検 {level}</h1>
            <p className="text-gray-600">問題 {currentIndex + 1} / {questions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">正解数</p>
            <p className="text-2xl font-bold text-primary">{correctCount} / {questions.length}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-foreground flex-1">{currentQuestion.question_text}</h2>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full ml-4">
              {currentQuestion.question_type}
            </span>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((option, idx) => {
              const optionKey = String.fromCharCode(65 + idx) // A, B, C, D
              const isCorrectOption = optionKey === currentQuestion.correct_answer
              const isSelectedOption = selectedAnswer === optionKey

              return (
                <div
                  key={idx}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                    isAnswered
                      ? isCorrectOption
                        ? 'border-green-500 bg-green-50'
                        : isSelectedOption
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      : isSelectedOption
                        ? 'border-primary bg-purple-50'
                        : 'border-gray-200 hover:border-primary'
                  }`}
                  onClick={() => handleSelectAnswer(optionKey)}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={optionKey}
                    checked={isSelectedOption}
                    onChange={() => handleSelectAnswer(optionKey)}
                    disabled={isAnswered}
                    className="mr-4"
                  />
                  <label className="flex-1 cursor-pointer">
                    <span className="font-semibold text-primary">{optionKey}.</span> {option}
                  </label>
                  {isAnswered && isCorrectOption && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {isAnswered && isSelectedOption && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
              )
            })}
          </div>

          {/* Explanation */}
          {isAnswered && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">解説</p>
              <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-2 border-2 border-gray-300 rounded-lg hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </button>

          {!isAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              答えを提出
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition"
            >
              {currentIndex === questions.length - 1 ? '結果を表示' : '次へ'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 p-4 bg-white rounded-xl shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-3">問題ナビゲーター</p>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-full aspect-square rounded-lg font-semibold text-sm transition ${
                  idx === currentIndex
                    ? 'bg-primary text-white'
                    : submitted[q.id]
                      ? results[q.id]
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
