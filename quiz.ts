import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getQuestionsByLevel,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createQuizSession,
  getQuizSessionById,
  updateQuizSession,
  getUserQuizSessions,
  createUserAnswer,
  getSessionAnswers,
  getUserStats,
} from "../db";

export const quizRouter = router({
  // Get questions by level
  getQuestionsByLevel: publicProcedure
    .input(z.object({ level: z.enum(["N1", "N2", "N3", "N4", "N5"]), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await getQuestionsByLevel(input.level, input.limit);
    }),

  // Get single question
  getQuestion: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getQuestionById(input.id);
    }),

  // Create question (admin only)
  createQuestion: protectedProcedure
    .input(
      z.object({
        level: z.enum(["N1", "N2", "N3", "N4", "N5"]),
        type: z.enum(["vocabulary", "grammar", "reading", "listening"]),
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create questions");
      }
      return await createQuestion(input);
    }),

  // Update question (admin only)
  updateQuestion: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        level: z.enum(["N1", "N2", "N3", "N4", "N5"]).optional(),
        type: z.enum(["vocabulary", "grammar", "reading", "listening"]).optional(),
        question: z.string().optional(),
        options: z.array(z.string()).optional(),
        correctAnswer: z.string().optional(),
        explanation: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can update questions");
      }
      const { id, ...data } = input;
      await updateQuestion(id, data);
      return { success: true };
    }),

  // Delete question (admin only)
  deleteQuestion: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can delete questions");
      }
      await deleteQuestion(input.id);
      return { success: true };
    }),

  // Start quiz session
  startQuiz: protectedProcedure
    .input(z.object({ level: z.enum(["N1", "N2", "N3", "N4", "N5"]), questionCount: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await createQuizSession({
        userId: ctx.user.id,
        level: input.level,
        totalQuestions: input.questionCount,
        startedAt: new Date(),
      });
      return result;
    }),

  // Get quiz session
  getQuizSession: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const session = await getQuizSessionById(input.id);
      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Session not found or unauthorized");
      }
      return session;
    }),

  // Submit answer
  submitAnswer: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        questionId: z.number(),
        userAnswer: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify session belongs to user
      const session = await getQuizSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Get correct answer
      const question = await getQuestionById(input.questionId);
      if (!question) {
        throw new Error("Question not found");
      }

      const isCorrect = question.correctAnswer === input.userAnswer;

      // Save answer
      await createUserAnswer({
        sessionId: input.sessionId,
        questionId: input.questionId,
        userAnswer: input.userAnswer,
        isCorrect,
      });

      return {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    }),

  // Complete quiz
  completeQuiz: protectedProcedure
    .input(z.object({ sessionId: z.number(), score: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const session = await getQuizSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const answers = await getSessionAnswers(input.sessionId);
      const correctCount = answers.filter((a) => a.isCorrect).length;

      const scorePercentage = (correctCount / session.totalQuestions) * 100;
      await updateQuizSession(input.sessionId, {
        completedAt: new Date(),
        correctAnswers: correctCount,
        score: scorePercentage.toString() as any,
      });

      return { success: true };
    }),

  // Get quiz history
  getQuizHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      return await getUserQuizSessions(ctx.user.id, input.limit || 10);
    }),

  // Get quiz results
  getQuizResults: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const session = await getQuizSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const answers = await getSessionAnswers(input.sessionId);

      // Get detailed answer info
      const detailedAnswers = await Promise.all(
        answers.map(async (answer) => {
          const question = await getQuestionById(answer.questionId);
          return {
            ...answer,
            question,
          };
        })
      );

      return {
        session,
        answers: detailedAnswers,
      };
    }),

  // Get user stats
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    return await getUserStats(ctx.user.id);
  }),
});
