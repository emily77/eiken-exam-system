import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Home, RotateCcw, CheckCircle, XCircle, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const getResults = trpc.quiz.getQuizResults.useQuery(
    { sessionId: parseInt(sessionId || "0") },
    { enabled: isAuthenticated && !!sessionId }
  );

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (getResults.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!getResults.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">結果が見つかりません</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  const { session, answers } = getResults.data;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalCount = answers.length;
  const percentage = (correctCount / totalCount) * 100;

  const chartData = [
    { name: "正解", value: correctCount, color: "#10b981" },
    { name: "不正解", value: totalCount - correctCount, color: "#ef4444" },
  ];

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A", message: "素晴らしい！" };
    if (percentage >= 80) return { grade: "B", message: "良好です" };
    if (percentage >= 70) return { grade: "C", message: "まあまあです" };
    if (percentage >= 60) return { grade: "D", message: "もう少しです" };
    return { grade: "F", message: "もっと練習が必要です" };
  };

  const gradeInfo = getGrade(percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Award className="w-16 h-16 text-accent" />
          </div>
          <h1 className="text-4xl font-bold mb-2">テスト完了</h1>
          <p className="text-muted-foreground">あなたの結果を確認しましょう</p>
        </div>

        {/* Score Card */}
        <Card className="mb-8 border-border/50">
          <CardHeader>
            <CardTitle>成績</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Display */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 mb-4">
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
                    <p className="text-4xl font-bold text-accent">{percentage.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">正解率</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">成績</p>
                  <p className="text-5xl font-bold text-accent mb-2">{gradeInfo.grade}</p>
                  <p className="text-lg text-foreground">{gradeInfo.message}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">正解</span>
                      <span className="text-sm font-bold text-green-600">{correctCount}</span>
                    </div>
                    <Progress value={(correctCount / totalCount) * 100} className="h-2 bg-green-100" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">不正解</span>
                      <span className="text-sm font-bold text-red-600">{totalCount - correctCount}</span>
                    </div>
                    <Progress
                      value={((totalCount - correctCount) / totalCount) * 100}
                      className="h-2 bg-red-100"
                    />
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground">合計問題数</p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wrong Answers Review */}
        {answers.some((a) => !a.isCorrect) && (
          <Card className="mb-8 border-border/50">
            <CardHeader>
              <CardTitle>間違えた問題</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {answers
                  .filter((a) => !a.isCorrect)
                  .map((answer, idx) => (
                    <div key={idx} className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{answer.question?.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            あなたの答え: <span className="font-semibold">{answer.userAnswer}</span>
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            正解: <span className="font-semibold">{answer.question?.correctAnswer}</span>
                          </p>
                        </div>
                      </div>
                      {answer.question?.explanation && (
                        <div className="ml-8 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">解説</p>
                          <p className="text-sm text-blue-800 dark:text-blue-300">{answer.question.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Correct Answers Summary */}
        {answers.some((a) => a.isCorrect) && (
          <Card className="mb-8 border-border/50">
            <CardHeader>
              <CardTitle>正解した問題</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {answers
                  .filter((a) => a.isCorrect)
                  .map((answer, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-foreground">{answer.question?.question}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            ホームに戻る
          </Button>
          <Button onClick={() => navigate("/")} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            別のテストを受ける
          </Button>
        </div>
      </div>
    </div>
  );
}
