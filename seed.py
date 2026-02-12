"""
英検題目初始化腳本
"""

import sqlite3
import json

SAMPLE_QUESTIONS = [
    # 5級 - 單選題
    {
        "level": "5級",
        "question_type": "single_choice",
        "question_text": "What is your name?",
        "options": ["My name is Tom", "I am Tom", "Tom is me", "I Tom am"],
        "correct_answer": "A",
        "explanation": "正確的自我介紹方式是 'My name is...' 或 'I am...'"
    },
    {
        "level": "5級",
        "question_type": "single_choice",
        "question_text": "I ___ a student.",
        "options": ["am", "is", "are", "be"],
        "correct_answer": "A",
        "explanation": "主語是 'I' 時，使用 'am'"
    },
    {
        "level": "5級",
        "question_type": "single_choice",
        "question_text": "She goes to school ___ bus.",
        "options": ["by", "on", "in", "at"],
        "correct_answer": "A",
        "explanation": "'by bus' 是正確的交通方式表達"
    },
    
    # 4級 - 單選題
    {
        "level": "4級",
        "question_type": "single_choice",
        "question_text": "If I ___ you were coming, I would have waited.",
        "options": ["had known", "knew", "have known", "would know"],
        "correct_answer": "A",
        "explanation": "虛擬語氣過去式需要使用 'had known'"
    },
    {
        "level": "4級",
        "question_type": "single_choice",
        "question_text": "The book ___ by a famous author.",
        "options": ["was written", "is written", "wrote", "has written"],
        "correct_answer": "A",
        "explanation": "過去被動語態使用 'was written'"
    },
    
    # 3級 - 單選題
    {
        "level": "3級",
        "question_type": "single_choice",
        "question_text": "Despite his ___ experience, he managed to complete the project.",
        "options": ["limited", "limiting", "limit", "limitless"],
        "correct_answer": "A",
        "explanation": "'limited experience' 表示經驗有限"
    },
    {
        "level": "3級",
        "question_type": "single_choice",
        "question_text": "The company has ___ its operations to three countries.",
        "options": ["expanded", "extended", "stretched", "spread"],
        "correct_answer": "B",
        "explanation": "'extended its operations' 是正確的商務用語"
    },
    
    # 準2級 - 單選題
    {
        "level": "準2級",
        "question_type": "single_choice",
        "question_text": "The government's ___ to reduce pollution has been ineffective.",
        "options": ["endeavor", "attempt", "effort", "initiative"],
        "correct_answer": "D",
        "explanation": "'initiative' 在此文脈中最為恰當，表示政策倡議"
    },
    {
        "level": "準2級",
        "question_type": "single_choice",
        "question_text": "His ___ behavior alienated him from his colleagues.",
        "options": ["eccentric", "erratic", "capricious", "volatile"],
        "correct_answer": "B",
        "explanation": "'erratic behavior' 表示不穩定的行為"
    },
    
    # 2級 - 單選題
    {
        "level": "2級",
        "question_type": "single_choice",
        "question_text": "The author's ___ use of metaphor creates a vivid imagery.",
        "options": ["judicious", "meticulous", "fastidious", "assiduous"],
        "correct_answer": "A",
        "explanation": "'judicious' 表示明智的、適當的使用"
    },
    {
        "level": "2級",
        "question_type": "single_choice",
        "question_text": "The witness's testimony was ___, casting doubt on the defendant's alibi.",
        "options": ["corroborated", "substantiated", "corrosive", "cogent"],
        "correct_answer": "D",
        "explanation": "'cogent' 表示有說服力的、令人信服的"
    },
    
    # 5級 - 填空題
    {
        "level": "5級",
        "question_type": "fill_blank",
        "question_text": "I like ___ apples.",
        "options": None,
        "correct_answer": "eating",
        "explanation": "'like + -ing form' 是正確的語法結構"
    },
    
    # 4級 - 填空題
    {
        "level": "4級",
        "question_type": "fill_blank",
        "question_text": "She suggested that he ___ the meeting.",
        "options": None,
        "correct_answer": "attend",
        "explanation": "'suggest that + 原形動詞' 是正確的語法"
    },
    
    # 3級 - 填空題
    {
        "level": "3級",
        "question_type": "fill_blank",
        "question_text": "The problem is ___ to solve without expert help.",
        "options": None,
        "correct_answer": "too complex",
        "explanation": "'too + adjective + to + verb' 表示太...以至於不能..."
    },
    
    # 準2級 - 填空題
    {
        "level": "準2級",
        "question_type": "fill_blank",
        "question_text": "The research ___ that regular exercise improves mental health.",
        "options": None,
        "correct_answer": "demonstrates",
        "explanation": "'demonstrates' 表示研究證明了某事"
    },
    
    # 2級 - 填空題
    {
        "level": "2級",
        "question_type": "fill_blank",
        "question_text": "His ___ for detail was evident in the meticulous presentation.",
        "options": None,
        "correct_answer": "penchant",
        "explanation": "'penchant for' 表示對...的傾向或愛好"
    },
    
    # 準2級プラス - 單選題
    {
        "level": "準2級プラス",
        "question_type": "single_choice",
        "question_text": "The ___ of the new policy has generated considerable controversy among stakeholders.",
        "options": ["implementation", "implication", "impetus", "impediment"],
        "correct_answer": "A",
        "explanation": "'implementation' 表示新政策的實施、實行"
    },
    {
        "level": "準2級プラス",
        "question_type": "single_choice",
        "question_text": "The researcher's ___ methodology ensured the validity of the findings.",
        "options": ["rigorous", "rigidity", "rigid", "rigorously"],
        "correct_answer": "A",
        "explanation": "'rigorous methodology' 表示嚴格的研究方法"
    },
    {
        "level": "準2級プラス",
        "question_type": "single_choice",
        "question_text": "The company's ___ growth over the past decade has been remarkable.",
        "options": ["exponential", "exponent", "export", "expose"],
        "correct_answer": "A",
        "explanation": "'exponential growth' 表示指數級的增長"
    },
    
    # 準2級プラス - 填空題
    {
        "level": "準2級プラス",
        "question_type": "fill_blank",
        "question_text": "The author's ___ argument challenged conventional wisdom.",
        "options": None,
        "correct_answer": "perspicacious",
        "explanation": "'perspicacious' 表示有洞察力的、敏銳的"
    },
    {
        "level": "準2級プラス",
        "question_type": "fill_blank",
        "question_text": "His ___ nature made him an excellent negotiator.",
        "options": None,
        "correct_answer": "diplomatic",
        "explanation": "'diplomatic' 表示外交的、圓滑的"
    },
]

def seed_database():
    """填充示例題目"""
    conn = sqlite3.connect("eiken.db")
    c = conn.cursor()
    
    print("正在填充英検題目...")
    
    for question in SAMPLE_QUESTIONS:
        options_json = json.dumps(question["options"]) if question["options"] else None
        
        c.execute('''
            INSERT INTO questions (level, question_type, question_text, options, correct_answer, explanation)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            question["level"],
            question["question_type"],
            question["question_text"],
            options_json,
            question["correct_answer"],
            question["explanation"]
        ))
    
    conn.commit()
    conn.close()
    
    print(f"✓ 成功填充 {len(SAMPLE_QUESTIONS)} 個題目")

if __name__ == "__main__":
    seed_database()
