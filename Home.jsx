import { BookOpen, TrendingUp, Award } from 'lucide-react'

const LEVELS = [
  { id: '5級', label: '5級', description: '初級レベル', color: 'from-blue-400 to-blue-600' },
  { id: '4級', label: '4級', description: '初中級レベル', color: 'from-green-400 to-green-600' },
  { id: '3級', label: '3級', description: '中級レベル', color: 'from-yellow-400 to-yellow-600' },
  { id: '準2級', label: '準2級', description: '中上級レベル', color: 'from-orange-400 to-orange-600' },
  { id: '準2級プラス', label: '準2級プラス', description: '準2級上位', color: 'from-red-400 to-red-600' },
  { id: '2級', label: '2級', description: '上級レベル', color: 'from-purple-400 to-purple-600' },
]

export default function Home({ onStartQuiz, onNavigate }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">英検マスター</h1>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition"
          >
            ダッシュボード
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4 text-foreground">
            英検対策に<span className="text-primary">合格しよう</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            5級から2級まで、段階的に日本英語能力を磨きます。
            インタラクティブな問題と詳細な解析で、効率的に学習できます。
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">豊富な問題</h3>
              <p className="text-gray-600">
                各級別に厳選された問題を多数収録。単語、文法、読解、聴解をカバーしています。
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">進度追跡</h3>
              <p className="text-gray-600">
                学習度をリアルタイムで追跡。各級別の成績と改善点を視覚化します。
              </p>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">即座フィードバック</h3>
              <p className="text-gray-600">
                答えを提出すると、すぐに正解と詳細な解析が表示されます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Level Selection */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">級別を選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEVELS.map((level) => (
              <div
                key={level.id}
                className="group cursor-pointer"
                onClick={() => onStartQuiz(level.id)}
              >
                <div className={`bg-gradient-to-br ${level.color} p-8 rounded-xl text-white shadow-lg hover:shadow-xl transition transform hover:scale-105`}>
                  <h3 className="text-2xl font-bold mb-2">{level.label}</h3>
                  <p className="mb-4 opacity-90">{level.description}</p>
                  <button className="w-full bg-white text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-100 transition">
                    テストを開始
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2026 英検マスター. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
