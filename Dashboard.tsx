import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2, Home, TrendingUp, BookOpen, Target } from "lucide-react";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const quizHistory = trpc.quiz.getQuizHistory.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const userStats = trpc.quiz.getUserStats.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (quizHistory.isLoading || userStats.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    );
  }

  const sessions = quizHistory.data || [];
  const stats = userStats.data;

  // Prepare data for charts
  const levelStats = LEVELS.map((level) => {
    const levelSessions = sessions.filter((s) => s.level === level);
    const avgScore = levelSessions.length > 0 ? levelSessions.reduce((sum, s) => sum + parseFloat(s.score as any), 0) / levelSessions.length : 0;
    return {
      level,
      平均スコア: Math.round(avgScore),
      テスト数: levelSessions.length,
    };
  });

  const recentSessions = sessions.slice(0, 10).map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString("ja-JP"),
    スコア: Math.round(parseFloat(s.score as any)),
    level: s.level,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ダッシュボード</h1>
            <p className="text-muted-foreground">ようこそ、{user?.name}さん</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            ホーム
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                総テスト数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">{stats?.totalQuizzes || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                総正解数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">{stats?.totalCorrect || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                平均正解率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">
                {stats?.totalQuizzes ? Math.round((stats.totalCorrect / stats.totalQuizzes) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Level Performance */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>レベル別パフォーマンス</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={levelStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="level" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="平均スコア" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Performance */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>最近のテスト成績</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recentSessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="スコア" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Test History */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>テスト履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">まだテストを受けていません</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  テストを開始
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">日付</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">レベル</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">正解数</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">スコア</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 text-sm">{new Date(session.createdAt).toLocaleDateString("ja-JP")}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full font-semibold">
                            {session.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {session.correctAnswers} / {session.totalQuestions}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-accent">
                          {Math.round(parseFloat(session.score as any))}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
