import { describe, it, expect, beforeEach, vi } from "vitest";
import { quizRouter } from "./quiz";
import * as db from "../db";

// Mock database functions
vi.mock("../db", () => ({
  getQuestionsByLevel: vi.fn(),
  getQuestionById: vi.fn(),
  createQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
  createQuizSession: vi.fn(),
  getQuizSessionById: vi.fn(),
  updateQuizSession: vi.fn(),
  getUserQuizSessions: vi.fn(),
  createUserAnswer: vi.fn(),
  getSessionAnswers: vi.fn(),
  getUserStats: vi.fn(),
}));

type ProtectedContext = {
  user: {
    id: number;
    openId: string;
    email: string;
    name: string;
    loginMethod: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
    lastSignedIn: Date;
    totalQuizzes: number;
    totalCorrect: number;
  };
};

type PublicContext = {
  user: null;
};

describe("quizRouter", () => {
  const mockUser: ProtectedContext["user"] = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "oauth",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    totalQuizzes: 0,
    totalCorrect: 0,
  };

  const mockAdmin: ProtectedContext["user"] = {
    ...mockUser,
    role: "admin",
  };

  const mockQuestion = {
    id: 1,
    level: "N5" as const,
    type: "vocabulary" as const,
    question: "これは何ですか？",
    options: ["本", "ペン", "机", "椅子"],
    correctAnswer: "A",
    explanation: "これは本です。",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getQuestionsByLevel", () => {
    it("should return questions for a given level", async () => {
      const mockQuestions = [mockQuestion];
      vi.mocked(db.getQuestionsByLevel).mockResolvedValue(mockQuestions);

      const caller = quizRouter.createCaller({ user: null } as PublicContext);
      const result = await caller.getQuestionsByLevel({ level: "N5", limit: 10 });

      expect(result).toEqual(mockQuestions);
      expect(db.getQuestionsByLevel).toHaveBeenCalledWith("N5", 10);
    });
  });

  describe("getQuestion", () => {
    it("should return a single question by id", async () => {
      vi.mocked(db.getQuestionById).mockResolvedValue(mockQuestion);

      const caller = quizRouter.createCaller({ user: null } as PublicContext);
      const result = await caller.getQuestion({ id: 1 });

      expect(result).toEqual(mockQuestion);
      expect(db.getQuestionById).toHaveBeenCalledWith(1);
    });
  });

  describe("createQuestion", () => {
    it("should create a question when user is admin", async () => {
      vi.mocked(db.createQuestion).mockResolvedValue({ insertId: 1 } as any);

      const caller = quizRouter.createCaller({ user: mockAdmin } as ProtectedContext);
      const result = await caller.createQuestion({
        level: "N5",
        type: "vocabulary",
        question: "これは何ですか？",
        options: ["本", "ペン", "机", "椅子"],
        correctAnswer: "A",
        explanation: "これは本です。",
      });

      expect(result).toEqual({ insertId: 1 });
      expect(db.createQuestion).toHaveBeenCalled();
    });

    it("should throw error when user is not admin", async () => {
      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);

      await expect(
        caller.createQuestion({
          level: "N5",
          type: "vocabulary",
          question: "これは何ですか？",
          options: ["本", "ペン", "机", "椅子"],
          correctAnswer: "A",
        })
      ).rejects.toThrow("Only admins can create questions");
    });
  });

  describe("updateQuestion", () => {
    it("should update a question when user is admin", async () => {
      vi.mocked(db.updateQuestion).mockResolvedValue(undefined);

      const caller = quizRouter.createCaller({ user: mockAdmin } as ProtectedContext);
      const result = await caller.updateQuestion({
        id: 1,
        question: "更新された質問",
      });

      expect(result).toEqual({ success: true });
      expect(db.updateQuestion).toHaveBeenCalledWith(1, { question: "更新された質問" });
    });

    it("should throw error when user is not admin", async () => {
      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);

      await expect(
        caller.updateQuestion({
          id: 1,
          question: "更新された質問",
        })
      ).rejects.toThrow("Only admins can update questions");
    });
  });

  describe("deleteQuestion", () => {
    it("should delete a question when user is admin", async () => {
      vi.mocked(db.deleteQuestion).mockResolvedValue(undefined);

      const caller = quizRouter.createCaller({ user: mockAdmin } as ProtectedContext);
      const result = await caller.deleteQuestion({ id: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deleteQuestion).toHaveBeenCalledWith(1);
    });

    it("should throw error when user is not admin", async () => {
      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);

      await expect(caller.deleteQuestion({ id: 1 })).rejects.toThrow(
        "Only admins can delete questions"
      );
    });
  });

  describe("startQuiz", () => {
    it("should create a quiz session", async () => {
      vi.mocked(db.createQuizSession).mockResolvedValue({ insertId: 1 } as any);

      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);
      const result = await caller.startQuiz({
        level: "N5",
        questionCount: 10,
      });

      expect(result).toEqual({ insertId: 1 });
      expect(db.createQuizSession).toHaveBeenCalled();
    });
  });

  describe("submitAnswer", () => {
    it("should submit correct answer", async () => {
      vi.mocked(db.getQuizSessionById).mockResolvedValue({
        id: 1,
        userId: 1,
        level: "N5",
        totalQuestions: 10,
        correctAnswers: 0,
        score: "0",
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
      });
      vi.mocked(db.getQuestionById).mockResolvedValue(mockQuestion);
      vi.mocked(db.createUserAnswer).mockResolvedValue({ insertId: 1 } as any);

      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);
      const result = await caller.submitAnswer({
        sessionId: 1,
        questionId: 1,
        userAnswer: "A",
      });

      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswer).toBe("A");
      expect(db.createUserAnswer).toHaveBeenCalled();
    });

    it("should submit incorrect answer", async () => {
      vi.mocked(db.getQuizSessionById).mockResolvedValue({
        id: 1,
        userId: 1,
        level: "N5",
        totalQuestions: 10,
        correctAnswers: 0,
        score: "0",
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
      });
      vi.mocked(db.getQuestionById).mockResolvedValue(mockQuestion);
      vi.mocked(db.createUserAnswer).mockResolvedValue({ insertId: 1 } as any);

      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);
      const result = await caller.submitAnswer({
        sessionId: 1,
        questionId: 1,
        userAnswer: "B",
      });

      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswer).toBe("A");
    });

    it("should throw error if session does not belong to user", async () => {
      vi.mocked(db.getQuizSessionById).mockResolvedValue({
        id: 1,
        userId: 999, // Different user
        level: "N5",
        totalQuestions: 10,
        correctAnswers: 0,
        score: "0",
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
      });

      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);

      await expect(
        caller.submitAnswer({
          sessionId: 1,
          questionId: 1,
          userAnswer: "A",
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("completeQuiz", () => {
    it("should complete quiz and calculate score", async () => {
      vi.mocked(db.getQuizSessionById).mockResolvedValue({
        id: 1,
        userId: 1,
        level: "N5",
        totalQuestions: 10,
        correctAnswers: 0,
        score: "0",
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
      });
      vi.mocked(db.getSessionAnswers).mockResolvedValue([
        { id: 1, sessionId: 1, questionId: 1, userAnswer: "A", isCorrect: true, createdAt: new Date() },
        { id: 2, sessionId: 1, questionId: 2, userAnswer: "B", isCorrect: false, createdAt: new Date() },
      ]);
      vi.mocked(db.updateQuizSession).mockResolvedValue(undefined);

      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);
      const result = await caller.completeQuiz({
        sessionId: 1,
        score: 50,
      });

      expect(result).toEqual({ success: true });
      expect(db.updateQuizSession).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          completedAt: expect.any(Date),
          correctAnswers: 1,
          score: "10",
        })
      );
    });
  });

  describe("getQuizHistory", () => {
    it("should return user quiz history", async () => {
      const mockSessions = [
        {
          id: 1,
          userId: 1,
          level: "N5",
          totalQuestions: 10,
          correctAnswers: 8,
          score: "80",
          startedAt: new Date(),
          completedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      vi.mocked(db.getUserQuizSessions).mockResolvedValue(mockSessions);

      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);
      const result = await caller.getQuizHistory({ limit: 10 });

      expect(result).toEqual(mockSessions);
      expect(db.getUserQuizSessions).toHaveBeenCalledWith(1, 10);
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", async () => {
      vi.mocked(db.getUserStats).mockResolvedValue(mockUser);

      const caller = quizRouter.createCaller({ user: mockUser } as ProtectedContext);
      const result = await caller.getUserStats();

      expect(result).toEqual(mockUser);
      expect(db.getUserStats).toHaveBeenCalledWith(1);
    });
  });
});
