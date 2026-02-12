# 英検マスター - 完全部署パッケージ

このドキュメントは、英検マスターシステムの完全な部署パッケージの内容を説明します。

## 📦 パッケージ内容

### 1. アプリケーションコード

#### バックエンド
- **backend.py** - FastAPI メインアプリケーション
  - 11 個の API エンドポイント
  - SQLite データベース統合
  - CORS 設定
  - エラーハンドリング

- **seed.py** - データベース初期化スクリプト
  - 21 個のサンプル問題を投入
  - 6 つの級別に対応
  - 3 つの問題タイプをサポート

#### フロントエンド
- **frontend/src/App.jsx** - メインアプリケーション
- **frontend/src/pages/Home.jsx** - ホームページ
- **frontend/src/pages/Quiz.jsx** - テストページ
- **frontend/src/pages/Results.jsx** - 結果ページ
- **frontend/src/pages/Dashboard.jsx** - ダッシュボード
- **frontend/src/main.jsx** - React エントリーポイント
- **frontend/src/index.css** - グローバルスタイル

### 2. 設定ファイル

#### Python 設定
- **requirements.txt** - Python 依存関係
  - FastAPI 0.104.1
  - Uvicorn 0.24.0
  - Pydantic 2.5.0

#### Node.js 設定
- **frontend/package.json** - Node.js 依存関係
  - React 18.2.0
  - Vite 5.0.0
  - Tailwind CSS 3.3.0
  - Recharts 2.10.0
  - Axios 1.6.0

#### ビルド設定
- **frontend/vite.config.js** - Vite ビルド設定
- **frontend/tailwind.config.js** - Tailwind CSS 設定
- **frontend/postcss.config.js** - PostCSS 設定
- **frontend/index.html** - HTML テンプレート

### 3. デプロイメント設定

#### Hetzner デプロイメント
- **HETZNER_DEPLOYMENT.md** - 完全な Hetzner デプロイガイド
  - サーバーセットアップ手順
  - Python/Node.js インストール
  - Systemd サービス設定
  - Nginx リバースプロキシ設定
  - SSL/TLS 証明書設定
  - バックアップと復旧
  - モニタリング設定

#### Docker デプロイメント
- **Dockerfile** - Docker イメージ定義
  - Python 3.11 ベース
  - Node.js インストール
  - ビルドプロセス自動化
  - ヘルスチェック設定

- **docker-compose.yml** - Docker Compose 設定
  - バックエンドサービス
  - Nginx サービス
  - ボリューム管理
  - ネットワーク設定

#### Nginx 設定
- **nginx.conf** - Nginx リバースプロキシ設定
  - API ルーティング
  - フロントエンド配信
  - キャッシング設定
  - レート制限設定
  - セキュリティヘッダー

#### その他の設定
- **Procfile** - Heroku/Manus デプロイメント設定
- **runtime.txt** - Python バージョン指定
- **build.sh** - 自動ビルドスクリプト
- **manus.config.json** - Manus デプロイメント設定
- **.gitignore** - Git 除外ファイル設定

### 4. ドキュメント

#### 主要ドキュメント
- **README.md** - プロジェクト概要
  - 機能説明
  - 技術スタック
  - インストール手順
  - 使用方法

- **API_DOCS.md** - API 完全ドキュメント
  - 11 個のエンドポイント説明
  - リクエスト/レスポンス例
  - エラーコード説明
  - Python/JavaScript サンプルコード

- **SETUP_GUIDE.md** - ローカル開発セットアップ
  - システム要件
  - ステップバイステップセットアップ
  - テスト手順
  - トラブルシューティング

#### デプロイメントドキュメント
- **HETZNER_DEPLOYMENT.md** - Hetzner 完全デプロイガイド（上記参照）
- **MANUS_DEPLOYMENT.md** - Manus プラットフォームデプロイガイド
- **DEPLOYMENT.md** - 一般的なデプロイメントガイド
- **DEPLOYMENT_CHECKLIST.md** - デプロイメントチェックリスト

#### プロジェクトドキュメント
- **PROJECT_SUMMARY.md** - プロジェクト詳細概要
  - 実装機能一覧
  - データベーススキーマ
  - API エンドポイント一覧
  - パフォーマンス特性

- **DEPLOYMENT_PACKAGE.md** - このファイル

### 5. データベース

- **eiken.db** - SQLite データベース
  - questions テーブル（21 個のサンプル問題）
  - exam_sessions テーブル
  - user_answers テーブル
  - users テーブル

### 6. スクリプト

- **build.sh** - 自動ビルドスクリプト
  - Python 依存関係インストール
  - データベース初期化
  - フロントエンドビルド

- **seed.py** - データベース初期化スクリプト
  - テーブル作成
  - サンプルデータ投入

## 📊 ファイル構成

```
eiken-exam-system/
├── backend.py                      # FastAPI バックエンド
├── seed.py                         # DB 初期化スクリプト
├── eiken.db                        # SQLite データベース
├── requirements.txt                # Python 依存関係
├── runtime.txt                     # Python バージョン
├── Procfile                        # Heroku/Manus 設定
├── Dockerfile                      # Docker イメージ定義
├── docker-compose.yml              # Docker Compose 設定
├── nginx.conf                      # Nginx 設定
├── build.sh                        # ビルドスクリプト
├── manus.config.json               # Manus 設定
├── .gitignore                      # Git 除外設定
├── frontend/                       # React フロントエンド
│   ├── package.json               # Node.js 依存関係
│   ├── vite.config.js             # Vite 設定
│   ├── tailwind.config.js         # Tailwind 設定
│   ├── postcss.config.js          # PostCSS 設定
│   ├── index.html                 # HTML テンプレート
│   ├── src/
│   │   ├── main.jsx               # React エントリーポイント
│   │   ├── App.jsx                # メインコンポーネント
│   │   ├── index.css              # グローバルスタイル
│   │   └── pages/
│   │       ├── Home.jsx           # ホームページ
│   │       ├── Quiz.jsx           # テストページ
│   │       ├── Results.jsx        # 結果ページ
│   │       └── Dashboard.jsx      # ダッシュボード
│   └── dist/                      # ビルド出力（デプロイ時に生成）
├── README.md                       # プロジェクト説明
├── SETUP_GUIDE.md                 # セットアップガイド
├── API_DOCS.md                    # API ドキュメント
├── HETZNER_DEPLOYMENT.md          # Hetzner デプロイガイド
├── MANUS_DEPLOYMENT.md            # Manus デプロイガイド
├── DEPLOYMENT.md                  # 一般デプロイガイド
├── DEPLOYMENT_CHECKLIST.md        # チェックリスト
├── PROJECT_SUMMARY.md             # プロジェクト概要
└── DEPLOYMENT_PACKAGE.md          # このファイル
```

## 🚀 デプロイメント方法

### 方法 1：Hetzner Cloud（推奨）

**所要時間**：約 30 分

1. HETZNER_DEPLOYMENT.md を参照
2. サーバーを作成
3. スクリプトに従ってセットアップ
4. アプリケーションをデプロイ

**コスト**：月額 €4.90 から

### 方法 2：Docker（最も簡単）

**所要時間**：約 10 分

```bash
# Docker イメージをビルド
docker build -t eiken-exam-system .

# Docker Compose で起動
docker-compose up -d

# ブラウザでアクセス
# http://localhost
```

### 方法 3：ローカル開発

**所要時間**：約 15 分

1. SETUP_GUIDE.md を参照
2. Python と Node.js をインストール
3. 依存関係をインストール
4. アプリケーションを起動

## 📋 必要なリソース

### ハードウェア要件

| リソース | 最小 | 推奨 |
|---------|------|------|
| CPU | 1 コア | 2 コア以上 |
| メモリ | 1 GB | 4 GB以上 |
| ストレージ | 500 MB | 10 GB以上 |
| 帯域幅 | 100 Mbps | 1 Gbps以上 |

### ソフトウェア要件

| ソフトウェア | バージョン |
|-------------|-----------|
| Python | 3.11+ |
| Node.js | 18+ |
| Nginx | 1.18+ |
| Docker | 20.10+ |
| Docker Compose | 1.29+ |

### 外部サービス

| サービス | 用途 | コスト |
|---------|------|--------|
| Hetzner Cloud | ホスティング | €4.90/月 |
| ドメイン | ドメイン名 | $10-15/年 |
| Let's Encrypt | SSL 証明書 | 無料 |

## 🔧 カスタマイズ

### 色スキーム変更

**ファイル**：`frontend/src/index.css`

```css
/* プライマリカラーを変更 */
--primary: #6366f1;  /* インディゴ */

/* セカンダリカラーを変更 */
--secondary: #a78bfa;  /* パープル */
```

### ロゴ変更

**ファイル**：`frontend/src/pages/Home.jsx`

```jsx
// ロゴ画像を置き換え
<img src="/logo.png" alt="Logo" />
```

### ドメイン名変更

**ファイル**：`HETZNER_DEPLOYMENT.md` の DNS セクション

```
eiken.example.com → your-domain.com
```

### ポート番号変更

**ファイル**：`backend.py` と `Procfile`

```python
# バックエンド
python3 -m uvicorn backend:app --port 9000

# Nginx 設定
upstream backend {
    server 127.0.0.1:9000;
}
```

## 📈 スケーリング

### 垂直スケーリング（サーバーアップグレード）

Hetzner コンソールでサーバータイプをアップグレード：
- CPX11 → CPX21 → CPX31 → CPX41

### 水平スケーリング（複数サーバー）

1. 複数のサーバーを作成
2. Hetzner Load Balancer を設定
3. バックエンドサーバーを追加
4. ヘルスチェックを設定

## 🔐 セキュリティ

### 推奨設定

1. **SSH セキュリティ**
   - キーベース認証のみ
   - ルートログインを無効化
   - ポート 22 を変更（オプション）

2. **ファイアウォール**
   - 必要なポートのみ開放
   - DDoS 保護を有効化
   - レート制限を設定

3. **SSL/TLS**
   - Let's Encrypt で証明書を取得
   - HTTPS のみを使用
   - HSTS を有効化

4. **アプリケーション**
   - 入力検証を実装
   - SQL インジェクション対策
   - XSS 対策
   - CSRF 対策

## 🆘 サポート

### トラブルシューティング

1. **SETUP_GUIDE.md** - ローカル開発の問題
2. **HETZNER_DEPLOYMENT.md** - Hetzner デプロイの問題
3. **API_DOCS.md** - API の問題

### よくある質問

**Q: どのデプロイメント方法が最適ですか？**
A: Hetzner Cloud が最もコスト効率的で推奨されます。

**Q: バックアップはどのように実行しますか？**
A: HETZNER_DEPLOYMENT.md の「バックアップとモニタリング」セクションを参照。

**Q: スケーリングはどのように実行しますか？**
A: 上記の「スケーリング」セクションを参照。

**Q: セキュリティはどのように確保しますか？**
A: 上記の「セキュリティ」セクションを参照。

## 📞 連絡先

問題が発生した場合は、以下の方法でサポートを受けてください：

1. **GitHub Issues**：プロジェクトリポジトリ
2. **Hetzner サポート**：https://support.hetzner.com
3. **メール**：support@eiken.app（オプション）

## 📝 ライセンス

MIT License - 自由に使用、修正、配布できます。

## 🎉 デプロイメント完了

このパッケージには、英検マスターシステムを本番環境に部署するために必要なすべてのファイルとドキュメントが含まれています。

**次のステップ**：
1. HETZNER_DEPLOYMENT.md を読む
2. Hetzner Cloud アカウントを作成
3. サーバーをセットアップ
4. アプリケーションをデプロイ
5. DEPLOYMENT_CHECKLIST.md でテスト

---

**パッケージバージョン**：1.0.0
**最終更新**：2026年2月11日
**準備状態**：本番環境デプロイ準備完了
