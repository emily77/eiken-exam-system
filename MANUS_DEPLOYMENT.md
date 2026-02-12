# 英検マスター - Manus プラットフォーム部署ガイド

このガイドでは、英検マスターシステムを Manus プラットフォームに部署する詳細な手順を説明します。

## 前提条件

- Manus アカウント（https://manus.im）
- Git がインストールされている
- GitHub アカウント（オプション）

## 部署方法

### 方法 1：Manus Web UI を使用（推奨）

#### ステップ 1：Manus ダッシュボードにアクセス

1. https://manus.im にアクセス
2. アカウントにログイン
3. ダッシュボードを開く

#### ステップ 2：新しいプロジェクトを作成

1. 「新しいプロジェクト」をクリック
2. 「Git リポジトリからインポート」を選択
3. リポジトリ URL を入力：
   ```
   https://github.com/yourusername/eiken-exam-system.git
   ```

#### ステップ 3：プロジェクト設定を確認

- **プロジェクト名**：eiken-exam-platform
- **説明**：英検マスター - 英検オンライン試験プラットフォーム
- **リージョン**：アジア（推奨）
- **ビルドコマンド**：`./build.sh`
- **スタートコマンド**：`python3 -m uvicorn backend:app --host 0.0.0.0 --port $PORT`

#### ステップ 4：環境変数を設定

Manus ダッシュボールで以下の環境変数を設定：

```env
DATABASE_URL=sqlite:///eiken.db
PYTHONUNBUFFERED=1
FRONTEND_URL=https://your-domain.manus.app
```

#### ステップ 5：デプロイを実行

1. 「デプロイ」ボタンをクリック
2. デプロイの進行状況を監視
3. デプロイ完了後、URL が表示される

### 方法 2：Git を使用（高度なユーザー向け）

#### ステップ 1：リポジトリを準備

```bash
cd /home/ubuntu/eiken-exam-system

# Git リポジトリを初期化
git init
git add .
git commit -m "Initial commit: Eiken exam system"

# リモートリポジトリを追加
git remote add origin https://github.com/yourusername/eiken-exam-system.git
git branch -M main
git push -u origin main
```

#### ステップ 2：Manus CLI をインストール

```bash
npm install -g @manus/cli
```

#### ステップ 3：Manus にログイン

```bash
manus login
```

#### ステップ 4：プロジェクトをデプロイ

```bash
manus deploy --name eiken-exam-platform
```

## デプロイ後の設定

### ドメイン設定

#### デフォルトドメイン

Manus は自動的に以下の形式でドメインを生成します：
```
https://eiken-exam-platform.manus.app
```

#### カスタムドメイン設定

1. Manus ダッシュボールで「ドメイン」セクションにアクセス
2. 「カスタムドメインを追加」をクリック
3. ドメイン名を入力（例：eiken.example.com）
4. DNS レコードを設定
5. SSL 証明書を自動生成

### SSL/TLS 設定

Manus は自動的に Let's Encrypt から SSL 証明書を取得します。追加の設定は不要です。

### ストレージ設定

SQLite データベースは Manus の永続ストレージに保存されます。自動的にバックアップされます。

## デプロイ後のテスト

### 1. ヘルスチェック

```bash
curl https://eiken-exam-platform.manus.app/health
```

期待される出力：
```json
{
  "status": "ok",
  "service": "Eiken Exam System API"
}
```

### 2. フロントエンドへのアクセス

ブラウザで以下の URL にアクセス：
```
https://eiken-exam-platform.manus.app
```

英検マスターのホームページが表示されることを確認

### 3. API テスト

```bash
curl https://eiken-exam-platform.manus.app/questions/5%E7%B4%9A?limit=2
```

問題データが返されることを確認

## モニタリング

### ログの確認

Manus ダッシュボールで以下の情報を確認できます：

1. **デプロイログ**：ビルドとデプロイの進行状況
2. **アプリケーションログ**：実行時のログ
3. **エラーログ**：エラーと例外

### メトリクスの確認

1. **アップタイム**：サービスの可用性
2. **レスポンス時間**：API のレスポンス時間
3. **エラーレート**：エラーの発生率
4. **CPU 使用率**：CPU の使用状況
5. **メモリ使用量**：メモリの使用状況

### リアルタイムログ

```bash
manus logs -f
```

## トラブルシューティング

### デプロイが失敗する

**問題**：ビルドエラーが発生

**解決方法**：
1. ビルドログを確認
2. `build.sh` が実行可能か確認
3. Python と Node.js のバージョンを確認
4. 依存関係が正しくインストールされているか確認

```bash
# ローカルでビルドをテスト
./build.sh
```

### アプリケーションが起動しない

**問題**：ポート 8000 が使用中

**解決方法**：
1. Procfile を確認
2. `$PORT` 環境変数が正しく設定されているか確認
3. ポート設定を確認

### データベースエラー

**問題**：`sqlite3.OperationalError: no such table`

**解決方法**：
1. データベース初期化スクリプトが実行されているか確認
2. `build.sh` が正しく実行されているか確認
3. ストレージ権限を確認

### フロントエンドが表示されない

**問題**：404 エラーが表示される

**解決方法**：
1. フロントエンドのビルドが成功しているか確認
2. `frontend/dist` ディレクトリが存在するか確認
3. バックエンドが静的ファイルを正しく提供しているか確認

## スケーリング

### 自動スケーリング

Manus は自動的にトラフィックに基づいてスケールします。追加の設定は不要です。

### 手動スケーリング

Manus ダッシュボールで以下の設定を変更できます：

1. **インスタンス数**：同時実行インスタンス数
2. **メモリ**：インスタンスあたりのメモリ
3. **CPU**：インスタンスあたりの CPU

## バックアップと復元

### 自動バックアップ

Manus は自動的に以下の頻度でバックアップを作成します：

- **日次バックアップ**：毎日実行
- **週次バックアップ**：毎週実行
- **月次バックアップ**：毎月実行

バックアップは 30 日間保持されます。

### 手動バックアップ

```bash
# データベースをダウンロード
manus download-db eiken-exam-platform
```

### データの復元

```bash
# バックアップから復元
manus restore-db eiken-exam-platform backup-file.db
```

## セキュリティ

### HTTPS 強制

Manus は自動的にすべてのトラフィックを HTTPS にリダイレクトします。

### DDoS 保護

Manus はすべてのプロジェクトに対して DDoS 保護を提供します。

### ファイアウォール

Manus ダッシュボールで IP ホワイトリスト/ブラックリストを設定できます。

## パフォーマンス最適化

### キャッシング

1. **ブラウザキャッシング**：静的ファイルのキャッシュ
2. **CDN キャッシング**：Manus CDN による自動キャッシング
3. **アプリケーションキャッシング**：Redis キャッシング（オプション）

### 圧縮

Manus は自動的に以下の圧縮を適用します：

- **Gzip 圧縮**：テキストファイル
- **Brotli 圧縮**：モダンブラウザ

## 環境変数の管理

### 開発環境

```env
DATABASE_URL=sqlite:///eiken.db
PYTHONUNBUFFERED=1
```

### 本番環境

```env
DATABASE_URL=sqlite:///eiken.db
PYTHONUNBUFFERED=1
FRONTEND_URL=https://eiken-exam-platform.manus.app
DEBUG=false
```

## CI/CD パイプライン

Manus は自動的に以下の CI/CD パイプラインを設定します：

1. **コミット検出**：GitHub へのプッシュを監視
2. **ビルド**：`./build.sh` を実行
3. **テスト**：テストスイートを実行（存在する場合）
4. **デプロイ**：本番環境にデプロイ

## ロールバック

以前のバージョンに戻す場合：

```bash
# デプロイ履歴を表示
manus deployments list

# 特定のバージョンにロールバック
manus deployments rollback <deployment-id>
```

## サポート

問題が発生した場合は、以下の方法でサポートを受けられます：

1. **Manus ドキュメント**：https://docs.manus.im
2. **Manus サポート**：https://help.manus.im
3. **GitHub Issues**：プロジェクトリポジトリ

## よくある質問

**Q: データベースはどこに保存されますか？**
A: SQLite データベースは Manus の永続ストレージに保存されます。

**Q: バックアップはどのように機能しますか？**
A: Manus は自動的に日次、週次、月次のバックアップを作成します。

**Q: カスタムドメインを使用できますか？**
A: はい、Manus ダッシュボールでカスタムドメインを設定できます。

**Q: SSL 証明書は自動的に更新されますか？**
A: はい、Manus は自動的に Let's Encrypt 証明書を更新します。

**Q: スケーリングは自動的に行われますか？**
A: はい、Manus は自動的にトラフィックに基づいてスケールします。

---

**最終更新**：2026年2月11日
