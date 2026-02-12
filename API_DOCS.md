# 英検マスター - API ドキュメント

## ベース URL

```
http://localhost:8000
```

## 認証

現在のバージョンでは認証は不要です。本番環境では JWT トークン認証の実装を推奨します。

## レスポンス形式

すべてのレスポンスは JSON 形式です。

### 成功レスポンス

```json
{
  "status": "success",
  "data": {}
}
```

### エラーレスポンス

```json
{
  "detail": "エラーメッセージ"
}
```

## エンドポイント

### 1. ヘルスチェック

**リクエスト**
```
GET /health
```

**レスポンス**
```json
{
  "status": "ok",
  "service": "Eiken Exam System API"
}
```

---

### 2. 級別で問題を取得

**リクエスト**
```
GET /questions/{level}?limit=10
```

**パラメータ**
- `level` (string, required): 級別 (5級、4級、3級、準2級、準2級プラス、2級)
- `limit` (integer, optional): 取得する問題数（デフォルト: 10）

**レスポンス**
```json
[
  {
    "id": 1,
    "level": "5級",
    "question_type": "single_choice",
    "question_text": "What is your name?",
    "options": ["My name is Tom", "I am Tom", "Tom is me", "I Tom am"],
    "correct_answer": "A",
    "explanation": "正確な自己紹介方法..."
  }
]
```

---

### 3. 単一の問題を取得

**リクエスト**
```
GET /questions/detail/{question_id}
```

**パラメータ**
- `question_id` (integer, required): 問題 ID

**レスポンス**
```json
{
  "id": 1,
  "level": "5級",
  "question_type": "single_choice",
  "question_text": "What is your name?",
  "options": ["My name is Tom", "I am Tom", "Tom is me", "I Tom am"],
  "correct_answer": "A",
  "explanation": "正確な自己紹介方法..."
}
```

---

### 4. 新しい問題を作成

**リクエスト**
```
POST /questions/
Content-Type: application/json

{
  "level": "5級",
  "question_type": "single_choice",
  "question_text": "What is your name?",
  "options": ["My name is Tom", "I am Tom", "Tom is me", "I Tom am"],
  "correct_answer": "A",
  "explanation": "正確な自己紹介方法..."
}
```

**パラメータ**
- `level` (string, required): 級別
- `question_type` (string, required): 問題タイプ (single_choice, fill_blank, essay)
- `question_text` (string, required): 問題文
- `options` (array, optional): 選択肢（単選択問題の場合は必須）
- `correct_answer` (string, required): 正解
- `explanation` (string, optional): 解説

**レスポンス**
```json
{
  "status": "created",
  "id": 1
}
```

---

### 5. テストを開始

**リクエスト**
```
POST /exams/start
Content-Type: application/json

{
  "user_id": "user_123",
  "level": "5級",
  "question_count": 10
}
```

**パラメータ**
- `user_id` (string, required): ユーザー ID
- `level` (string, required): 級別
- `question_count` (integer, required): 問題数

**レスポンス**
```json
{
  "session_id": 1,
  "status": "started"
}
```

---

### 6. テストセッションを取得

**リクエスト**
```
GET /exams/{session_id}
```

**パラメータ**
- `session_id` (integer, required): セッション ID

**レスポンス**
```json
{
  "id": 1,
  "user_id": "user_123",
  "level": "5級",
  "total_questions": 10,
  "correct_answers": 8,
  "score": 80.0,
  "started_at": "2026-02-11T12:00:00",
  "completed_at": null
}
```

---

### 7. 答えを提出

**リクエスト**
```
POST /answers/submit
Content-Type: application/json

{
  "session_id": 1,
  "question_id": 1,
  "user_answer": "A"
}
```

**パラメータ**
- `session_id` (integer, required): セッション ID
- `question_id` (integer, required): 問題 ID
- `user_answer` (string, required): ユーザーの答え

**レスポンス**
```json
{
  "is_correct": true,
  "correct_answer": "A",
  "explanation": "正確な自己紹介方法..."
}
```

---

### 8. テストを完了

**リクエスト**
```
POST /exams/complete
Content-Type: application/json

{
  "session_id": 1,
  "score": 80.0
}
```

**パラメータ**
- `session_id` (integer, required): セッション ID
- `score` (float, required): 得点

**レスポンス**
```json
{
  "status": "completed",
  "score": 80.0
}
```

---

### 9. テスト結果を取得

**リクエスト**
```
GET /exams/{session_id}/results
```

**パラメータ**
- `session_id` (integer, required): セッション ID

**レスポンス**
```json
{
  "session": {
    "id": 1,
    "level": "5級",
    "total_questions": 10,
    "correct_answers": 8,
    "score": 80.0
  },
  "answers": [
    {
      "id": 1,
      "question_id": 1,
      "question_text": "What is your name?",
      "user_answer": "A",
      "correct_answer": "A",
      "is_correct": true,
      "explanation": "正確な自己紹介方法..."
    }
  ]
}
```

---

### 10. ユーザー統計を取得

**リクエスト**
```
GET /users/{user_id}/stats
```

**パラメータ**
- `user_id` (string, required): ユーザー ID

**レスポンス**
```json
{
  "user_id": "user_123",
  "name": null,
  "email": null,
  "total_exams": 5,
  "total_correct": 42
}
```

---

### 11. ユーザー履歴を取得

**リクエスト**
```
GET /users/{user_id}/history?limit=10
```

**パラメータ**
- `user_id` (string, required): ユーザー ID
- `limit` (integer, optional): 取得する履歴数（デフォルト: 10）

**レスポンス**
```json
[
  {
    "id": 1,
    "level": "5級",
    "total_questions": 10,
    "correct_answers": 8,
    "score": 80.0,
    "started_at": "2026-02-11T12:00:00",
    "completed_at": "2026-02-11T12:15:00"
  }
]
```

---

## エラーコード

| コード | メッセージ | 説明 |
|--------|-----------|------|
| 400 | Bad Request | リクエストが不正です |
| 404 | Not Found | リソースが見つかりません |
| 500 | Internal Server Error | サーバーエラーが発生しました |

## レート制限

現在のバージョンではレート制限はありません。本番環境では実装を推奨します。

## ベストプラクティス

1. **エラーハンドリング**：すべてのレスポンスをチェックしてください
2. **タイムアウト**：長時間のリクエストにはタイムアウトを設定してください
3. **キャッシング**：GET リクエストの結果をキャッシュしてください
4. **バッチ処理**：複数のリクエストをバッチ処理してください

## サンプルコード

### Python

```python
import requests

# テストを開始
response = requests.post('http://localhost:8000/exams/start', json={
    'user_id': 'user_123',
    'level': '5級',
    'question_count': 10
})
session_id = response.json()['session_id']

# 問題を取得
response = requests.get('http://localhost:8000/questions/5級?limit=10')
questions = response.json()

# 答えを提出
for question in questions:
    response = requests.post('http://localhost:8000/answers/submit', json={
        'session_id': session_id,
        'question_id': question['id'],
        'user_answer': 'A'
    })
    result = response.json()
    print(f"Question {question['id']}: {result['is_correct']}")

# テストを完了
response = requests.post('http://localhost:8000/exams/complete', json={
    'session_id': session_id,
    'score': 80.0
})

# 結果を取得
response = requests.get(f'http://localhost:8000/exams/{session_id}/results')
results = response.json()
print(results)
```

### JavaScript

```javascript
// テストを開始
const startResponse = await fetch('http://localhost:8000/exams/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user_123',
    level: '5級',
    question_count: 10
  })
});
const { session_id } = await startResponse.json();

// 問題を取得
const questionsResponse = await fetch('http://localhost:8000/questions/5級?limit=10');
const questions = await questionsResponse.json();

// 答えを提出
for (const question of questions) {
  const submitResponse = await fetch('http://localhost:8000/answers/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id,
      question_id: question.id,
      user_answer: 'A'
    })
  });
  const result = await submitResponse.json();
  console.log(`Question ${question.id}: ${result.is_correct}`);
}

// テストを完了
await fetch('http://localhost:8000/exams/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id,
    score: 80.0
  })
});

// 結果を取得
const resultsResponse = await fetch(`http://localhost:8000/exams/${session_id}/results`);
const results = await resultsResponse.json();
console.log(results);
```

---

**最終更新**：2026年2月11日
