import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, questions, quizSessions, userAnswers, Question, InsertQuestion, QuizSession, InsertQuizSession, UserAnswer, InsertUserAnswer } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * JLPT Quiz Queries
 */

export async function getQuestionsByLevel(level: string, limit?: number) {
  const db = await getDb();
  if (!db) return [];

  const baseQuery = db.select().from(questions).where(eq(questions.level, level as any));
  if (limit) {
    return await baseQuery.limit(limit);
  }
  return await baseQuery;
}

export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuestion(data: InsertQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(questions).values(data);
  return result;
}

export async function updateQuestion(id: number, data: Partial<InsertQuestion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(questions).set(data).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(questions).where(eq(questions.id, id));
}

export async function createQuizSession(data: InsertQuizSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(quizSessions).values(data);
  return result;
}

export async function getQuizSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(quizSessions).where(eq(quizSessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateQuizSession(id: number, data: Partial<InsertQuizSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(quizSessions).set(data).where(eq(quizSessions.id, id));
}

export async function getUserQuizSessions(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(quizSessions)
    .where(eq(quizSessions.userId, userId))
    .orderBy(desc(quizSessions.createdAt))
    .limit(limit);
}

export async function createUserAnswer(data: InsertUserAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userAnswers).values(data);
  return result;
}

export async function getSessionAnswers(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(userAnswers).where(eq(userAnswers.sessionId, sessionId));
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user.length > 0 ? user[0] : null;
}
