import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Home, TrendingUp, BookOpen, Target } from 'lucide-react'

const LEVELS = ['5級', '4級', '3級', '準2級', '準2級プラス', '2級']

export default function Dashboard({ onNavigate }) {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for demo
        const mockHistory = [
          { id: 1, level: '5級', total_questions: 10, correct_answers: 9, score: 90, started_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 2, level: '4級', total_questions: 10, correct_answers: 8, score: 80, started_at: new Date(Date.now() - 172800000).toISOString() },
          { id: 3, level: '3級', total_questions: 10, correct_answers: 7, score: 70, started_at: new Date(Date.now() - 259200000).toISOString() },
        ]
        setHistory(mockHistory)

        const mockStats = {
          user_id: 'user_demo',
          total_exams: 3,
          total_correct: 24,
        }
        setStats(mockStats)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">ダッシュボードを読み込み中...</p>
      </div>
    )
  }

  const levelStats = LEVELS.map((level) => {
    const levelSessions = history.filter(s => s.level === level)
    const avgScore = levelSessions.length > 0
      ? levelSessions.reduce((sum, s) => sum + s.score, 0) / levelSessions.length
      : 0
    return {
      level,
      平均スコア: Math.round(avgScore),
      テスト数: levelSessions.length,
    }
  })

  const recentSessions = history.slice(0, 10).map((s) => ({
    date: new Date(s.started_at).toLocaleDateString('ja-JP'),
    スコア: Math.round(s.score),
    level: s.level,
  }))

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">ダッシュボード</h1>
            <p className="text-gray-600">ようこそ</p>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-purple-50 transition"
          >
            <Home className="w-4 h-4" />
            ホーム
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">総テスト数</h3>
            </div>
            <p className="text-4xl font-bold text-primary">{stats?.total_exams || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">総正解数</h3>
            </div>
            <p className="text-4xl font-bold text-primary">{stats?.total_correct || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">平均正解率</h3>
            </div>
            <p className="text-4xl font-bold text-primary">
              {stats?.total_exams ? Math.round((stats.total_correct / (stats.total_exams * 10)) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Level Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">レベル別パフォーマンス</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levelStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="平均スコア" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">最近のテスト成績</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recentSessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="スコア" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Test History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">テスト履歴</h2>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">まだテストを受けていません</p>
              <button
                onClick={() => onNavigate('home')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition"
              >
                テストを開始
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">日付</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">レベル</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">正解数</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">スコア</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((session) => (
                    <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm">{new Date(session.started_at).toLocaleDateString('ja-JP')}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-3 py-1 bg-purple-100 text-primary rounded-full font-semibold">
                          {session.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {session.correct_answers} / {session.total_questions}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-primary">
                        {Math.round(session.score)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
