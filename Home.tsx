import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { BookOpen, BarChart3, Trophy, Zap } from "lucide-react";

const JLPT_LEVELS = [
  { level: "N5", title: "初級", description: "基礎日語", difficulty: "初心者向け" },
  { level: "N4", title: "初中級", description: "日常会話", difficulty: "初級者向け" },
  { level: "N3", title: "中級", description: "ビジネス日語", difficulty: "中級者向け" },
  { level: "N2", title: "中上級", description: "高度な表現", difficulty: "上級者向け" },
  { level: "N1", title: "上級", description: "専門知識", difficulty: "最上級向け" },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleStartQuiz = (level: string) => {
    if (isAuthenticated) {
      navigate(`/quiz/${level}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">JLPT マスター</h1>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                ダッシュボード
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
              ログイン
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
            JLPT 能力試験に
            <br />
            <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              合格しよう
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            N1から N5まで、段階的に日本語能力を磨きます。
            <br />
            インタラクティブな問題と詳細な解析で、効率的に学習できます。
          </p>
          {!isAuthenticated && (
            <Button size="lg" onClick={() => (window.location.href = getLoginUrl())} className="gap-2">
              <Zap className="w-5 h-5" />
              今すぐ始める
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="border-border/50 hover:border-accent/30 transition-colors">
            <CardHeader>
              <BookOpen className="w-8 h-8 text-accent mb-2" />
              <CardTitle>豊富な問題</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                各級別に厳選された問題を多数収録。単語、文法、読解、聴解をカバーしています。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-accent/30 transition-colors">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-accent mb-2" />
              <CardTitle>進度追蹤</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                学習進度をリアルタイムで追蹤。各級別の成績と改善点を視覚化します。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-accent/30 transition-colors">
            <CardHeader>
              <Trophy className="w-8 h-8 text-accent mb-2" />
              <CardTitle>即座フィードバック</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                答えを提出すると、すぐに正解と詳細な解析が表示されます。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Level Selection */}
      {isAuthenticated ? (
        <section className="container py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2">テストレベルを選択</h3>
              <p className="text-muted-foreground">あなたのレベルに合わせて、テストを開始しましょう</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {JLPT_LEVELS.map((item) => (
                <Card
                  key={item.level}
                  className="cursor-pointer border-border/50 hover:border-accent hover:shadow-lg transition-all group"
                  onClick={() => handleStartQuiz(item.level)}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl text-accent group-hover:scale-110 transition-transform">
                      {item.level}
                    </CardTitle>
                    <CardDescription>{item.title}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <p className="text-xs text-accent/70">{item.difficulty}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="container py-20">
          <div className="max-w-2xl mx-auto text-center bg-card border border-border/50 rounded-lg p-12">
            <h3 className="text-2xl font-bold mb-4">テストを開始するにはログインしてください</h3>
            <p className="text-muted-foreground mb-8">
              アカウントを作成またはログインして、JLPT テストを受けることができます。
            </p>
            <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
              ログイン / 登録
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20 py-12 bg-card/50">
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2026 JLPT マスター. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
