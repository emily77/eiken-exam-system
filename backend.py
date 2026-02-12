"""
英検（Eiken）互動式檢定系統 - FastAPI 後端
支持 5級、4級、3級、準2級、準2級プラス、2級
題型：單選題、填空題、作文題
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
from datetime import datetime
import os

app = FastAPI(title="Eiken Exam System API")

# CORS 設置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料庫設置
DATABASE = "eiken.db"

def get_db():
    """取得資料庫連接"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """初始化資料庫"""
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # 建立題目表
    c.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL,
            question_type TEXT NOT NULL,
            question_text TEXT NOT NULL,
            options TEXT,
            correct_answer TEXT NOT NULL,
            explanation TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 建立測驗會話表
    c.execute('''
        CREATE TABLE IF NOT EXISTS exam_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            level TEXT NOT NULL,
            total_questions INTEGER NOT NULL,
            correct_answers INTEGER DEFAULT 0,
            score REAL DEFAULT 0,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 建立用戶答案表
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            user_answer TEXT NOT NULL,
            is_correct BOOLEAN NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )
    ''')
    
    # 建立用戶表
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            total_exams INTEGER DEFAULT 0,
            total_correct INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# 資料模型
class Question(BaseModel):
    level: str
    question_type: str
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = None

class ExamSession(BaseModel):
    user_id: str
    level: str
    question_count: int

class UserAnswer(BaseModel):
    session_id: int
    question_id: int
    user_answer: str

class ExamResult(BaseModel):
    session_id: int
    score: float

# API 端點

@app.on_event("startup")
async def startup_event():
    """應用啟動時初始化資料庫"""
    init_db()

@app.get("/health")
async def health_check():
    """健康檢查"""
    return {"status": "ok", "service": "Eiken Exam System API"}

@app.get("/questions/{level}")
async def get_questions_by_level(level: str, limit: int = 10):
    """按級別獲取題目"""
    conn = get_db()
    c = conn.cursor()
    
    c.execute(
        "SELECT * FROM questions WHERE level = ? LIMIT ?",
        (level, limit)
    )
    rows = c.fetchall()
    conn.close()
    
    questions = []
    for row in rows:
        questions.append({
            "id": row["id"],
            "level": row["level"],
            "question_type": row["question_type"],
            "question_text": row["question_text"],
            "options": json.loads(row["options"]) if row["options"] else None,
            "correct_answer": row["correct_answer"],
            "explanation": row["explanation"]
        })
    
    return questions

@app.get("/questions/detail/{question_id}")
async def get_question(question_id: int):
    """獲取單個題目"""
    conn = get_db()
    c = conn.cursor()
    
    c.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {
        "id": row["id"],
        "level": row["level"],
        "question_type": row["question_type"],
        "question_text": row["question_text"],
        "options": json.loads(row["options"]) if row["options"] else None,
        "correct_answer": row["correct_answer"],
        "explanation": row["explanation"]
    }

@app.post("/questions/")
async def create_question(question: Question):
    """建立新題目"""
    conn = get_db()
    c = conn.cursor()
    
    options_json = json.dumps(question.options) if question.options else None
    
    c.execute('''
        INSERT INTO questions (level, question_type, question_text, options, correct_answer, explanation)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        question.level,
        question.question_type,
        question.question_text,
        options_json,
        question.correct_answer,
        question.explanation
    ))
    
    conn.commit()
    question_id = c.lastrowid
    conn.close()
    
    return {"status": "created", "id": question_id}

@app.post("/exams/start")
async def start_exam(session: ExamSession):
    """開始測驗"""
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''
        INSERT INTO exam_sessions (user_id, level, total_questions)
        VALUES (?, ?, ?)
    ''', (session.user_id, session.level, session.question_count))
    
    conn.commit()
    session_id = c.lastrowid
    conn.close()
    
    return {"session_id": session_id, "status": "started"}

@app.get("/exams/{session_id}")
async def get_exam_session(session_id: int):
    """獲取測驗會話"""
    conn = get_db()
    c = conn.cursor()
    
    c.execute("SELECT * FROM exam_sessions WHERE id = ?", (session_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Exam session not found")
    
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "level": row["level"],
        "total_questions": row["total_questions"],
        "correct_answers": row["correct_answers"],
        "score": row["score"],
        "started_at": row["started_at"],
        "completed_at": row["completed_at"]
    }

@app.post("/answers/submit")
async def submit_answer(answer: UserAnswer):
    """提交答案"""
    conn = get_db()
    c = conn.cursor()
    
    # 驗證會話存在
    c.execute("SELECT * FROM exam_sessions WHERE id = ?", (answer.session_id,))
    session = c.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Exam session not found")
    
    # 獲取正確答案
    c.execute("SELECT correct_answer, explanation FROM questions WHERE id = ?", (answer.question_id,))
    question = c.fetchone()
    if not question:
        conn.close()
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_correct = question["correct_answer"] == answer.user_answer
    
    # 保存答案
    c.execute('''
        INSERT INTO user_answers (session_id, question_id, user_answer, is_correct)
        VALUES (?, ?, ?, ?)
    ''', (answer.session_id, answer.question_id, answer.user_answer, is_correct))
    
    conn.commit()
    conn.close()
    
    return {
        "is_correct": is_correct,
        "correct_answer": question["correct_answer"],
        "explanation": question["explanation"]
    }

@app.post("/exams/complete")
async def complete_exam(result: ExamResult):
    """完成測驗"""
    conn = get_db()
    c = conn.cursor()
    
    # 獲取答案統計
    c.execute(
        "SELECT COUNT(*) as total, SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct FROM user_answers WHERE session_id = ?",
        (result.session_id,)
    )
    stats = c.fetchone()
    
    correct_count = stats["correct"] or 0
    total_count = stats["total"] or 0
    
    # 計算得分
    score = (correct_count / total_count * 100) if total_count > 0 else 0
    
    # 更新會話
    c.execute('''
        UPDATE exam_sessions
        SET correct_answers = ?, score = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (correct_count, score, result.session_id))
    
    conn.commit()
    conn.close()
    
    return {"status": "completed", "score": score}

@app.get("/exams/{session_id}/results")
async def get_exam_results(session_id: int):
    """獲取測驗結果"""
    conn = get_db()
    c = conn.cursor()
    
    # 獲取會話信息
    c.execute("SELECT * FROM exam_sessions WHERE id = ?", (session_id,))
    session = c.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Exam session not found")
    
    # 獲取所有答案
    c.execute('''
        SELECT ua.*, q.question_text, q.correct_answer, q.explanation
        FROM user_answers ua
        JOIN questions q ON ua.question_id = q.id
        WHERE ua.session_id = ?
    ''', (session_id,))
    
    answers = []
    for row in c.fetchall():
        answers.append({
            "id": row["id"],
            "question_id": row["question_id"],
            "question_text": row["question_text"],
            "user_answer": row["user_answer"],
            "correct_answer": row["correct_answer"],
            "is_correct": row["is_correct"],
            "explanation": row["explanation"]
        })
    
    conn.close()
    
    return {
        "session": {
            "id": session["id"],
            "level": session["level"],
            "total_questions": session["total_questions"],
            "correct_answers": session["correct_answers"],
            "score": session["score"]
        },
        "answers": answers
    }

@app.get("/users/{user_id}/stats")
async def get_user_stats(user_id: str):
    """獲取用戶統計"""
    conn = get_db()
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = c.fetchone()
    
    if not user:
        c.execute("INSERT INTO users (id) VALUES (?)", (user_id,))
        conn.commit()
        user = {"id": user_id, "name": None, "email": None, "total_exams": 0, "total_correct": 0}
    
    conn.close()
    
    return {
        "user_id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "total_exams": user["total_exams"],
        "total_correct": user["total_correct"]
    }

@app.get("/users/{user_id}/history")
async def get_user_history(user_id: str, limit: int = 10):
    """獲取用戶測驗歷史"""
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''
        SELECT * FROM exam_sessions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ''', (user_id, limit))
    
    sessions = []
    for row in c.fetchall():
        sessions.append({
            "id": row["id"],
            "level": row["level"],
            "total_questions": row["total_questions"],
            "correct_answers": row["correct_answers"],
            "score": row["score"],
            "started_at": row["started_at"],
            "completed_at": row["completed_at"]
        })
    
    conn.close()
    return sessions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
