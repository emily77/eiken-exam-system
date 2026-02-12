# 英検マスター - セットアップ・テストガイド

このガイドでは、英検マスターシステムを完全にセットアップしてテストする方法を説明します。

## システム要件

### 最小要件
- CPU: 2コア以上
- メモリ: 2GB以上
- ディスク: 1GB以上

### 推奨要件
- CPU: 4コア以上
- メモリ: 4GB以上
- ディスク: 5GB以上

### ソフトウェア要件
- Python 3.11以上
- Node.js 18以上
- npm 9以上 または pnpm 8以上
- Git 2.30以上

## ステップバイステップセットアップ

### ステップ 1: リポジトリのクローン

```bash
# プロジェクトディレクトリに移動
cd /home/ubuntu/eiken-exam-system

# または、新しくクローンする場合
git clone <repository-url> eiken-exam-system
cd eiken-exam-system
```

### ステップ 2: バックエンド環境の構築

#### 2.1 Python 環境の準備

```bash
# Python バージョンを確認
python3 --version
# Python 3.11.0 以上が必要です

# 仮想環境を作成（推奨）
python3 -m venv venv

# 仮想環境を有効化
source venv/bin/activate  # Linux/Mac
# または
venv\Scripts\activate  # Windows
```

#### 2.2 依存関係のインストール

```bash
# 依存関係をインストール
pip install -r requirements.txt

# インストール確認
pip list | grep -E "fastapi|uvicorn|pydantic"
```

#### 2.3 データベースの初期化

```bash
# データベースを初期化
python3 -c "from backend import init_db; init_db()"
echo "✓ Database initialized"

# サンプルデータを投入
python3 seed.py
echo "✓ Sample data loaded"

# データベースを確認
sqlite3 eiken.db ".tables"
```

#### 2.4 バックエンドサーバーの起動

```bash
# 開発モードで起動
python3 -m uvicorn backend:app --host 0.0.0.0 --port 8000 --reload

# または、本番モードで起動
python3 -m uvicorn backend:app --host 0.0.0.0 --port 8000
```

サーバーが起動すると、以下のメッセージが表示されます：
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### ステップ 3: フロントエンド環境の構築

#### 3.1 Node.js 環境の準備

```bash
# Node.js バージョンを確認
node --version
npm --version
# Node.js 18以上、npm 9以上が必要です

# pnpm を使用する場合（推奨）
npm install -g pnpm
pnpm --version
```

#### 3.2 フロントエンドディレクトリに移動

```bash
cd frontend
```

#### 3.3 依存関係のインストール

```bash
# npm を使用する場合
npm install

# または、pnpm を使用する場合
pnpm install

# インストール確認
npm list react react-dom vite
```

#### 3.4 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev
# または
pnpm dev
```

サーバーが起動すると、以下のメッセージが表示されます：
```
VITE v5.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### ステップ 4: ブラウザでアクセス

1. ブラウザを開く
2. `http://localhost:5173` にアクセス
3. 英検マスターのホームページが表示されることを確認

## テスト手順

### テスト 1: ホームページの確認

1. ホームページにアクセス
2. 以下の要素が表示されていることを確認：
   - ロゴと「英検マスター」タイトル
   - 6つの級別ボタン（5級、4級、3級、準2級、準2級プラス、2級）
   - 「ダッシュボード」ボタン
   - 機能説明セクション

### テスト 2: テストの実施

1. 任意の級別（例：5級）をクリック
2. 以下を確認：
   - テスト開始画面が表示される
   - 問題が順番に表示される
   - 選択肢が表示される
   - 進度バーが表示される

3. 答えを選択して「答えを提出」をクリック
4. 以下を確認：
   - 正解が表示される
   - 解説が表示される
   - 「次へ」ボタンが有効になる

5. すべての問題に答えた後、結果ページが表示されることを確認

### テスト 3: 結果ページの確認

1. 以下の要素が表示されていることを確認：
   - スコア（パーセンテージ）
   - 成績（A/B/C/D/F）
   - 正解数と不正解数
   - 円グラフ
   - 間違えた問題の一覧
   - 「ホームに戻る」ボタン

### テスト 4: ダッシュボードの確認

1. ホームページの「ダッシュボード」ボタンをクリック
2. 以下の要素が表示されていることを確認：
   - 総テスト数
   - 総正解数
   - 平均正解率
   - レベル別パフォーマンスグラフ
   - 最近のテスト成績グラフ
   - テスト履歴テーブル

### テスト 5: API エンドポイントのテスト

#### 5.1 ヘルスチェック

```bash
curl -s http://localhost:8000/health | python3 -m json.tool
```

期待される出力：
```json
{
  "status": "ok",
  "service": "Eiken Exam System API"
}
```

#### 5.2 問題の取得

```bash
curl -s "http://localhost:8000/questions/5%E7%B4%9A?limit=2" | python3 -m json.tool | head -30
```

期待される出力：
```json
[
  {
    "id": 1,
    "level": "5級",
    "question_type": "single_choice",
    "question_text": "...",
    "options": [...],
    "correct_answer": "A",
    "explanation": "..."
  }
]
```

#### 5.3 テストセッションの開始

```bash
curl -s -X POST http://localhost:8000/exams/start \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "level": "5級",
    "question_count": 10
  }' | python3 -m json.tool
```

期待される出力：
```json
{
  "session_id": 1,
  "status": "started"
}
```

#### 5.4 答えの提出

```bash
curl -s -X POST http://localhost:8000/answers/submit \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "question_id": 1,
    "user_answer": "A"
  }' | python3 -m json.tool
```

期待される出力：
```json
{
  "is_correct": true,
  "correct_answer": "A",
  "explanation": "..."
}
```

## トラブルシューティング

### バックエンドが起動しない

**問題**：`ModuleNotFoundError: No module named 'fastapi'`

**解決方法**：
```bash
# 依存関係を再インストール
pip install --upgrade -r requirements.txt

# Python バージョンを確認
python3 --version
```

### フロントエンドが起動しない

**問題**：`npm ERR! code ERESOLVE`

**解決方法**：
```bash
# キャッシュをクリア
npm cache clean --force

# node_modules を削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

### API が接続できない

**問題**：`Failed to fetch`

**解決方法**：
1. バックエンドが起動しているか確認：
   ```bash
   curl http://localhost:8000/health
   ```

2. ポート 8000 が使用中でないか確認：
   ```bash
   lsof -i :8000
   ```

3. ファイアウォール設定を確認

### データベースエラー

**問題**：`sqlite3.OperationalError: no such table`

**解決方法**：
```bash
# データベースを再初期化
rm -f eiken.db
python3 -c "from backend import init_db; init_db()"
python3 seed.py
```

## パフォーマンステスト

### 負荷テスト

```bash
# Apache Bench を使用
ab -n 1000 -c 10 http://localhost:8000/health

# または、wrk を使用
wrk -t4 -c100 -d30s http://localhost:8000/health
```

### メモリ使用量の確認

```bash
# Python プロセスのメモリ使用量を確認
ps aux | grep uvicorn

# Node.js プロセスのメモリ使用量を確認
ps aux | grep vite
```

## セキュリティテスト

### SQL インジェクションテスト

```bash
# SQL インジェクション攻撃をシミュレート
curl -s "http://localhost:8000/questions/5%E7%B4%9A%27%20OR%20%271%27%3D%271"
```

期待される結果：エラーが返される（攻撃が防御される）

### CORS テスト

```bash
# CORS リクエストをテスト
curl -s -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:8000/questions/5%E7%B4%9A
```

## ログの確認

### バックエンドログ

```bash
# リアルタイムログを表示
tail -f server.log

# 特定のエラーを検索
grep "ERROR" server.log
```

### フロントエンドログ

```bash
# ブラウザのコンソールを開く（F12 キー）
# または、開発者ツールで確認
```

## 本番環境への準備

### 1. 環境変数の設定

```bash
# .env ファイルを作成
cat > .env << EOF
DATABASE_URL=sqlite:///eiken.db
API_URL=http://localhost:8000
EOF
```

### 2. ビルド

```bash
# フロントエンドをビルド
cd frontend
npm run build

# ビルド結果を確認
ls -la dist/
```

### 3. 本番サーバーの起動

```bash
# バックエンド
python3 -m uvicorn backend:app --host 0.0.0.0 --port 8000

# フロントエンド（静的ファイルサーバー）
python3 -m http.server 5173 --directory frontend/dist
```

## デプロイメント

Manus プラットフォームへのデプロイメント手順については、`DEPLOYMENT.md` を参照してください。

## サポート

問題が発生した場合は、以下の情報を収集してサポートに報告してください：

1. Python バージョン
2. Node.js バージョン
3. エラーメッセージ
4. ログファイル
5. 実行したコマンド

---

**最終更新**：2026年2月11日
