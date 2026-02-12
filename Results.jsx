import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Home, RotateCcw, CheckCircle, XCircle, Award, Loader2 } from 'lucide-react'

export default function Results({ sessionId, onNavigate }) {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`/api/exams/${sessionId}/results`)
        setResults(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch results:', error)
        setLoading(false)
      }
    }

    fetchResults()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">結果が見つかりません</p>
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

  const { session, answers } = results
  const correctCount = answers.filter(a => a.is_correct).length
  const totalCount = answers.length
  const percentage = (correctCount / totalCount) * 100

  const chartData = [
    { name: '正解', value: correctCount, color: '#10b981' },
    { name: '不正解', value: totalCount - correctCount, color: '#ef4444' },
  ]

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A', message: '素晴らしい！' }
    if (percentage >= 80) return { grade: 'B', message: '良好です' }
    if (percentage >= 70) return { grade: 'C', message: 'まあまあです' }
    if (percentage >= 60) return { grade: 'D', message: 'もう少しです' }
    return { grade: 'F', message: 'もっと練習が必要です' }
  }

  const gradeInfo = getGrade(percentage)

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Award className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">テスト完了</h1>
          <p className="text-gray-600">あなたの結果を確認しましょう</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-8">成績</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chart */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold text-primary">{percentage.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">正解率</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">成績</p>
                <p className="text-5xl font-bold text-primary mb-2">{gradeInfo.grade}</p>
                <p className="text-lg text-foreground">{gradeInfo.message}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">正解</span>
                    <span className="text-sm font-bold text-green-600">{correctCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(correctCount / totalCount) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">不正解</span>
                    <span className="text-sm font-bold text-red-600">{totalCount - correctCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${((totalCount - correctCount) / totalCount) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600">合計問題数</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wrong Answers */}
        {answers.some(a => !a.is_correct) && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">間違えた問題</h2>
            <div className="space-y-6">
              {answers.filter(a => !a.is_correct).map((answer, idx) => (
                <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{answer.question_text}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        あなたの答え: <span className="font-semibold">{answer.user_answer}</span>
                      </p>
                      <p className="text-sm text-green-600">
                        正解: <span className="font-semibold">{answer.correct_answer}</span>
                      </p>
                    </div>
                  </div>
                  {answer.explanation && (
                    <div className="ml-8 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs font-semibold text-blue-900 mb-1">解説</p>
                      <p className="text-sm text-blue-800">{answer.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Correct Answers */}
        {answers.some(a => a.is_correct) && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">正解した問題</h2>
            <div className="space-y-3">
              {answers.filter(a => a.is_correct).map((answer, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-foreground">{answer.question_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-6 py-2 border-2 border-primary text-primary rounded-lg hover:bg-purple-50 transition"
          >
            <Home className="w-4 h-4" />
            ホームに戻る
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            別のテストを受ける
          </button>
        </div>
      </div>
    </div>
  )
}
