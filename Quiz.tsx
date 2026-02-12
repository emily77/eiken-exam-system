import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  level: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
}

interface QuizState {
  sessionId: number | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>;
  submitted: Record<number, boolean>;
  results: Record<number, boolean>;
  completed: boolean;
}

export default function Quiz() {
  const { level } = useParams<{ level: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [quizState, setQuizState] = useState<QuizState>({
    sessionId: null,
    questions: [],
    currentIndex: 0,
    answers: {},
    submitted: {},
    results: {},
    completed: false,
  });

  const getQuestions = trpc.quiz.getQuestionsByLevel.useQuery(
    { level: level as any, limit: 10 },
    { enabled: isAuthenticated && !!level }
  );

  const startQuiz = trpc.quiz.startQuiz.useMutation();
  const submitAnswer = trpc.quiz.submitAnswer.useMutation();
  const completeQuiz = trpc.quiz.completeQuiz.useMutation();

  // Mock session ID for demo
  const mockSessionId = Math.floor(Math.random() * 10000) + 1;

  // Initialize quiz
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (getQuestions.data && !quizState.sessionId) {
      startQuiz.mutate(
        { level: level as any, questionCount: getQuestions.data.length },
        {
          onSuccess: (result: any) => {
            setQuizState((prev) => ({
              ...prev,
              sessionId: result?.insertId || 1,
              questions: getQuestions.data || [],
            }));
          },
          onError: (error) => {
            toast.error("テスト開始に失敗しました");
            navigate("/");
          },
        }
      );
    }
  }, [getQuestions.data, isAuthenticated, level, navigate, quizState.sessionId]);

  const currentQuestion = quizState.questions[quizState.currentIndex];
  const isAnswered = quizState.submitted[currentQuestion?.id];
  const isCorrect = quizState.results[currentQuestion?.id];
  const selectedAnswer = quizState.answers[currentQuestion?.id];

  const handleSelectAnswer = (value: string) => {
    if (!isAnswered) {
      setQuizState((prev) => ({
        ...prev,
        answers: { ...prev.answers, [currentQuestion.id]: value },
      }));
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast.error("答えを選択してください");
      return;
    }

    submitAnswer.mutate(
      {
        sessionId: quizState.sessionId!,
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
      },
      {
        onSuccess: (result) => {
          setQuizState((prev) => ({
            ...prev,
            submitted: { ...prev.submitted, [currentQuestion.id]: true },
            results: { ...prev.results, [currentQuestion.id]: result.isCorrect },
          }));
        },
      }
    );
  };

  const handleNext = () => {
    if (quizState.currentIndex < quizState.questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    } else {
      handleCompleteQuiz();
    }
  };

  const handlePrevious = () => {
    if (quizState.currentIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
      }));
    }
  };

  const handleCompleteQuiz = () => {
    const correctCount = Object.values(quizState.results).filter(Boolean).length;
    completeQuiz.mutate(
      {
        sessionId: quizState.sessionId!,
        score: (correctCount / quizState.questions.length) * 100,
      },
      {
        onSuccess: () => {
          navigate(`/results/${quizState.sessionId}`);
        },
      }
    );
  };

  if (getQuestions.isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">テストを準備中...</p>
        </div>
      </div>
    );
  }

  const progress = ((quizState.currentIndex + 1) / quizState.questions.length) * 100;
  const correctCount = Object.values(quizState.results).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-8">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">JLPT {level}</h1>
            <p className="text-muted-foreground">
              問題 {quizState.currentIndex + 1} / {quizState.questions.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">正解数</p>
            <p className="text-2xl font-bold text-accent">
              {correctCount} / {quizState.questions.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-8 h-2" />

        {/* Question Card */}
        <Card className="mb-8 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {currentQuestion.type}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Options */}
            <RadioGroup value={selectedAnswer || ""} onValueChange={handleSelectAnswer} disabled={isAnswered}>
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const optionKey = String.fromCharCode(65 + idx); // A, B, C, D
                  const isCorrectOption = optionKey === currentQuestion.correctAnswer;
                  const isSelectedOption = selectedAnswer === optionKey;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isAnswered
                          ? isCorrectOption
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                            : isSelectedOption
                              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                              : "border-border/50 bg-background"
                          : isSelectedOption
                            ? "border-accent bg-accent/5"
                            : "border-border/50 hover:border-accent/50 bg-background"
                      }`}
                    >
                      <RadioGroupItem value={optionKey} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        <span className="font-semibold text-accent">{optionKey}.</span> {option}
                      </Label>
                      {isAnswered && isCorrectOption && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {isAnswered && isSelectedOption && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  );
                })}
              </div>
            </RadioGroup>

            {/* Explanation */}
            {isAnswered && currentQuestion.explanation && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">解説</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={quizState.currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </Button>

          {!isAnswered ? (
            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="gap-2 flex-1">
              答えを提出
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="gap-2 flex-1"
              variant={quizState.currentIndex === quizState.questions.length - 1 ? "default" : "outline"}
            >
              {quizState.currentIndex === quizState.questions.length - 1 ? "結果を表示" : "次へ"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 p-4 bg-card border border-border/50 rounded-lg">
          <p className="text-sm font-semibold text-foreground mb-3">問題ナビゲーター</p>
          <div className="grid grid-cols-10 gap-2">
            {quizState.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setQuizState((prev) => ({ ...prev, currentIndex: idx }))}
                className={`w-full aspect-square rounded-lg font-semibold text-sm transition-all ${
                  idx === quizState.currentIndex
                    ? "bg-accent text-white"
                    : quizState.submitted[q.id]
                      ? quizState.results[q.id]
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
