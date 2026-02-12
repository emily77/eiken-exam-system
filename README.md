# 英検マスター - 英検互動式檢定系統

優雅で完美なデザインの英検（Eiken）オンライン試験プラットフォーム。5級から2級、準2級プラスまで、段階的に英語能力を磨くことができます。

## 機能特性

### ユーザー機能
- **6つの級別対応**：5級、4級、3級、準2級、準2級プラス、2級
- **複数の問題タイプ**：単選択問題、穴埋め問題、作文問題
- **インタラクティブな答題介面**：即座のフィードバックと詳細な解説
- **成績追跡**：詳細な成績報告と間違い問題の復習
- **進度ダッシュボード**：学習進度の視覚化と統計データ
- **テスト履歴**：すべてのテスト記録の保存と回顧

### 管理者機能
- **問題管理**：問題の追加、編集、削除
- **問題分類**：級別とタイプ別の問題整理
- **統計分析**：ユーザーのテストデータ分析

## 技術スタック

### バックエンド
- **フレームワーク**：FastAPI
- **データベース**：SQLite
- **言語**：Python 3.11+
- **API形式**：RESTful API

### フロントエンド
- **フレームワーク**：React 18
- **ビルドツール**：Vite
- **スタイリング**：Tailwind CSS
- **グラフ**：Recharts
- **HTTPクライアント**：Axios
- **アイコン**：Lucide React

## プロジェクト構造

```
eiken-exam-system/
├── backend.py              # FastAPI メインアプリケーション
├── seed.py                 # データベース初期化スクリプト
├── requirements.txt        # Python依存関係
├── eiken.db               # SQLiteデータベース
├── frontend/              # Reactフロントエンド
│   ├── src/
│   │   ├── pages/         # ページコンポーネント
│   │   │   ├── Home.jsx   # ホームページ
│   │   │   ├── Quiz.jsx   # テストページ
│   │   │   ├── Results.jsx # 結果ページ
│   │   │   └── Dashboard.jsx # ダッシュボード
│   │   ├── App.jsx        # メインアプリケーション
│   │   ├── main.jsx       # エントリーポイント
│   │   └── index.css      # グローバルスタイル
│   ├── package.json       # Node.js依存関係
│   ├── vite.config.js     # Vite設定
│   ├── tailwind.config.js # Tailwind設定
│   ├── postcss.config.js  # PostCSS設定
│   └── index.html         # HTMLテンプレート
└── README.md              # このファイル
```

## データベース構造

### questions テーブル
```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,           -- 級別 (5級、4級、3級、準2級、準2級プラス、2級)
    question_type TEXT NOT NULL,   -- 問題タイプ (single_choice, fill_blank, essay)
    question_text TEXT NOT NULL,   -- 問題文
    options TEXT,                  -- 選択肢 (JSON形式)
    correct_answer TEXT NOT NULL,  -- 正解 (A/B/C/D または テキスト)
    explanation TEXT,              -- 解説
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### exam_sessions テーブル
```sql
CREATE TABLE exam_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    level TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    score REAL DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_answers テーブル
```sql
CREATE TABLE user_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

## インストール・セットアップ

### 前提条件
- Python 3.11以上
- Node.js 18以上
- npm または pnpm

### バックエンド設定

1. **依存関係のインストール**
```bash
cd /home/ubuntu/eiken-exam-system
pip install -r requirements.txt
```

2. **データベース初期化**
```bash
python3 -c "from backend import init_db; init_db()"
```

3. **サンプルデータ投入**
```bash
python3 seed.py
```

4. **サーバー起動**
```bash
python3 -m uvicorn backend:app --host 0.0.0.0 --port 8000
```

サーバーは `http://localhost:8000` で起動します。

### フロントエンド設定

1. **依存関係のインストール**
```bash
cd frontend
npm install
# または
pnpm install
```

2. **開発サーバー起動**
```bash
npm run dev
# または
pnpm dev
```

フロントエンドは `http://localhost:5173` で起動します。

3. **本番ビルド**
```bash
npm run build
# または
pnpm build
```

## API エンドポイント

### 公開エンドポイント

**ヘルスチェック**
```
GET /health
```

**級別で問題を取得**
```
GET /questions/{level}?limit=10
```

**単一の問題を取得**
```
GET /questions/detail/{question_id}
```

### 保護されたエンドポイント

**新しい問題を作成**
```
POST /questions/
Body: {
  "level": "5級",
  "question_type": "single_choice",
  "question_text": "...",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "A",
  "explanation": "..."
}
```

**テストを開始**
```
POST /exams/start
Body: {
  "user_id": "user_123",
  "level": "5級",
  "question_count": 10
}
```

**テストセッションを取得**
```
GET /exams/{session_id}
```

**答えを提出**
```
POST /answers/submit
Body: {
  "session_id": 1,
  "question_id": 1,
  "user_answer": "A"
}
```

**テストを完了**
```
POST /exams/complete
Body: {
  "session_id": 1,
  "score": 80.0
}
```

**テスト結果を取得**
```
GET /exams/{session_id}/results
```

**ユーザー統計を取得**
```
GET /users/{user_id}/stats
```

**ユーザー履歴を取得**
```
GET /users/{user_id}/history?limit=10
```

## 使用方法

### ユーザーの観点

1. **ホームページにアクセス** - 利用可能な級別が表示されます
2. **級別を選択** - 希望する級別をクリック
3. **テストを開始** - 問題が順番に表示されます
4. **答えを選択して提出** - 各問題に答えて「答えを提出」をクリック
5. **結果を確認** - すべての問題に答えた後、成績と解説が表示されます
6. **ダッシュボードで進度を確認** - 学習進度と統計データを確認

### 管理者の観点

1. **APIを使用して問題を追加** - `/questions/` エンドポイントで新規問題を作成
2. **問題を編集・削除** - 必要に応じて既存問題を更新
3. **統計データを分析** - ユーザーのテスト結果を確認

## デザイン

### カラーパレット
- **プライマリ**：#6366f1（インディゴ）
- **セカンダリ**：#a78bfa（パープル）
- **アクセント**：#ec4899（ピンク）
- **背景**：#f8fafc（スレート）
- **テキスト**：#1e293b（ダークスレート）

### デザイン特性
- 優雅で完美なUIデザイン
- レスポンシブデザイン（モバイル、タブレット、デスクトップ対応）
- スムーズなアニメーションと遷移
- 高いアクセシビリティ

## パフォーマンス最適化

- **フロントエンド**：Viteによる高速ビルド、コード分割
- **バックエンド**：非同期処理、効率的なデータベースクエリ
- **キャッシング**：ブラウザキャッシュの活用

## セキュリティ

- **CORS設定**：すべてのオリジンを許可（開発環境）
- **入力検証**：Pydanticによる自動検証
- **SQLインジェクション対策**：パラメータ化クエリの使用

## トラブルシューティング

### バックエンドが起動しない
```bash
# Pythonバージョンを確認
python3 --version

# 依存関係を再インストール
pip install --upgrade -r requirements.txt

# ポート8000が使用中でないか確認
lsof -i :8000
```

### フロントエンドが起動しない
```bash
# Node.jsバージョンを確認
node --version

# キャッシュをクリア
rm -rf node_modules package-lock.json
npm install

# ポート5173が使用中でないか確認
lsof -i :5173
```

### APIが接続できない
- バックエンドが起動しているか確認：`curl http://localhost:8000/health`
- ファイアウォール設定を確認
- CORS設定を確認

## 今後の改善案

1. **ユーザー認証**：ログイン機能の追加
2. **リアルタイム通知**：WebSocketによるリアルタイム更新
3. **AIベースの推奨**：ユーザーの弱点に基づいた問題推奨
4. **モバイルアプリ**：React Nativeでのモバイルアプリ化
5. **多言語対応**：日本語以外の言語サポート
6. **ソーシャル機能**：ユーザー間の競争やグループ学習

## ライセンス

MIT License

## サポート

問題が発生した場合は、GitHubのIssueを作成してください。

## 開発者

英検マスター開発チーム

---

**最終更新**：2026年2月11日
