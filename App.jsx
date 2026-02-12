import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import Dashboard from './pages/Dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  const handleStartQuiz = (level) => {
    setSelectedLevel(level)
    setCurrentPage('quiz')
  }

  const handleQuizComplete = (id) => {
    setSessionId(id)
    setCurrentPage('results')
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-purple-50">
      {currentPage === 'home' && (
        <Home onStartQuiz={handleStartQuiz} onNavigate={handleNavigate} />
      )}
      {currentPage === 'quiz' && (
        <Quiz level={selectedLevel} onComplete={handleQuizComplete} onNavigate={handleNavigate} />
      )}
      {currentPage === 'results' && (
        <Results sessionId={sessionId} onNavigate={handleNavigate} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard onNavigate={handleNavigate} />
      )}
    </div>
  )
}

export default App
