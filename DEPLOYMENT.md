# 英検マスター - Manus プラットフォーム部署ガイド

このドキュメントでは、英検マスターシステムを Manus プラットフォームに部署する方法を説明します。

## 前提条件

- Manus アカウント
- Git がインストールされている
- 基本的なコマンドラインスキル

## 部署ステップ

### 1. リポジトリの準備

```bash
# プロジェクトディレクトリに移動
cd /home/ubuntu/eiken-exam-system

# Gitリポジトリを初期化（まだ初期化されていない場合）
git init
git add .
git commit -m "Initial commit: Eiken exam system"
```

### 2. Manus へのデプロイ

Manus プラットフォームは、以下の方法でデプロイできます：

#### オプション A：Manus CLI を使用

```bash
# Manus CLIをインストール（まだインストールされていない場合）
npm install -g @manus/cli

# ログイン
manus login

# デプロイ
manus deploy
```

#### オプション B：Manus Web UI を使用

1. Manus ダッシュボードにアクセス
2. 「新しいプロジェクト」をクリック
3. リポジトリを接続
4. デプロイ設定を確認
5. 「デプロイ」をクリック

### 3. 環境変数の設定

Manus プラットフォームで以下の環境変数を設定してください：

```env
# バックエンド設定
BACKEND_URL=https://your-backend-domain.manus.app
DATABASE_URL=sqlite:///eiken.db

# フロントエンド設定
VITE_API_URL=https://your-backend-domain.manus.app
```

### 4. ビルド設定

#### バックエンド（Python/FastAPI）

`Procfile` を作成：
```
web: python3 -m uvicorn backend:app --host 0.0.0.0 --port $PORT
```

#### フロントエンド（React/Vite）

`frontend/package.json` の `build` スクリプトが正しく設定されていることを確認：
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 5. データベースマイグレーション

Manus プラットフォームでは、以下のコマンドでデータベースを初期化できます：

```bash
# リモートサーバーで実行
python3 -c "from backend import init_db; init_db()"
python3 seed.py
```

## ドメイン設定

### カスタムドメインの設定

1. Manus ダッシュボードで「ドメイン」セクションにアクセス
2. カスタムドメインを追加
3. DNS レコードを設定
4. SSL 証明書を自動生成

### デフォルトドメイン

Manus は自動的に以下の形式でドメインを生成します：
```
https://eiken-exam-system.manus.app
```

## CI/CD パイプライン

Manus は自動的に以下の CI/CD パイプラインを設定します：

1. **コミット検出**：GitHub/GitLab へのプッシュを監視
2. **ビルド**：`npm run build` と `python3 -m uvicorn backend:app` を実行
3. **テスト**：テストスイートを実行（存在する場合）
4. **デプロイ**：本番環境にデプロイ

## モニタリング

Manus ダッシュボードで以下の情報を確認できます：

- **アップタイム**：サービスの可用性
- **レスポンス時間**：API のレスポンス時間
- **エラーレート**：エラーの発生率
- **トラフィック**：アクセス数とデータ転送量

## ログの確認

```bash
# リアルタイムログを表示
manus logs -f

# 特定のサービスのログを表示
manus logs backend
manus logs frontend
```

## トラブルシューティング

### デプロイが失敗する

1. ビルドログを確認
2. 依存関係が正しくインストールされているか確認
3. 環境変数が正しく設定されているか確認

### パフォーマンスが低い

1. Manus ダッシュボードでメトリクスを確認
2. データベースクエリを最適化
3. キャッシング戦略を改善

### データベース接続エラー

1. `DATABASE_URL` が正しく設定されているか確認
2. データベースサーバーが起動しているか確認
3. ファイアウォール設定を確認

## ロールバック

以前のバージョンに戻す場合：

```bash
# デプロイ履歴を表示
manus deployments list

# 特定のバージョンにロールバック
manus deployments rollback <deployment-id>
```

## スケーリング

Manus プラットフォームでは、以下の方法でスケーリングできます：

1. **自動スケーリング**：トラフィックに基づいて自動的にスケール
2. **手動スケーリング**：ダッシュボードでインスタンス数を調整
3. **リージョン選択**：複数のリージョンにデプロイ

## セキュリティ

### SSL/TLS

Manus は自動的に Let's Encrypt から SSL 証明書を取得します。

### DDoS 保護

Manus はすべてのプロジェクトに対して DDoS 保護を提供します。

### ファイアウォール

Manus ダッシュボールで IP ホワイトリスト/ブラックリストを設定できます。

## バックアップ

Manus は自動的に以下の頻度でバックアップを作成します：

- **日次バックアップ**：毎日実行
- **週次バックアップ**：毎週実行
- **月次バックアップ**：毎月実行

バックアップは 30 日間保持されます。

## サポート

問題が発生した場合は、Manus サポートチームにお問い合わせください。

---

**最終更新**：2026年2月11日
