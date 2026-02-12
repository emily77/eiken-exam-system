# 英検マスター - Hetzner 部署完全ガイド

このガイドでは、英検マスターシステムを Hetzner クラウドサーバーに部署する詳細な手順を説明します。

## 前提条件

- Hetzner Cloud アカウント（https://www.hetzner.com/cloud）
- SSH キーペア
- ドメイン名（オプション）
- 基本的なLinux知識

## Hetzner Cloud セットアップ

### ステップ 1：Hetzner Cloud コンソールにアクセス

1. https://console.hetzner.cloud にアクセス
2. アカウントにログイン
3. 新しいプロジェクトを作成（例：eiken-exam-platform）

### ステップ 2：SSH キーを作成

```bash
# SSH キーペアを生成
ssh-keygen -t rsa -b 4096 -f ~/.ssh/hetzner_key

# 公開鍵をコピー
cat ~/.ssh/hetzner_key.pub
```

Hetzner コンソールで：
1. 「SSH キー」セクションにアクセス
2. 「SSH キーを追加」をクリック
3. 公開鍵をペースト
4. 名前を入力（例：eiken-deploy-key）
5. 「追加」をクリック

### ステップ 3：サーバーを作成

#### サーバー仕様の選択

**推奨設定：**
- **イメージ**：Ubuntu 22.04
- **タイプ**：CPX11（2 vCPU、4GB RAM、40GB SSD）
- **ロケーション**：シンガポール（アジア向け）または ニュルンベルク（ヨーロッパ向け）
- **ネットワーク**：デフォルト
- **SSH キー**：上記で作成したキーを選択
- **ボリューム**：不要

#### サーバー作成手順

1. Hetzner コンソールで「サーバー」をクリック
2. 「サーバーを作成」をクリック
3. 上記の仕様を選択
4. サーバー名を入力（例：eiken-exam-server）
5. 「サーバーを作成」をクリック

サーバーが起動するまで数分待機します。

### ステップ 4：ファイアウォールを設定

1. Hetzner コンソールで「ファイアウォール」をクリック
2. 「ファイアウォールを作成」をクリック
3. 以下のルールを追加：

| プロトコル | ポート | ソース |
|-----------|--------|--------|
| TCP | 22 | 0.0.0.0/0 |
| TCP | 80 | 0.0.0.0/0 |
| TCP | 443 | 0.0.0.0/0 |
| TCP | 8000 | 0.0.0.0/0 |
| TCP | 5173 | 0.0.0.0/0 |

4. サーバーをファイアウォールに追加

## サーバー初期化

### ステップ 1：サーバーに接続

```bash
# SSH で接続
ssh -i ~/.ssh/hetzner_key root@<server-ip>
```

`<server-ip>` をサーバーの IP アドレスに置き換えてください。

### ステップ 2：システムを更新

```bash
# パッケージリストを更新
apt update && apt upgrade -y

# 必要なパッケージをインストール
apt install -y curl wget git build-essential
```

### ステップ 3：Python をインストール

```bash
# Python 3.11 をインストール
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Python バージョンを確認
python3.11 --version

# デフォルト Python を設定
update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
```

### ステップ 4：Node.js をインストール

```bash
# Node.js 18 をインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# バージョンを確認
node --version
npm --version
```

### ステップ 5：Git を設定

```bash
# Git ユーザー情報を設定
git config --global user.email "deploy@eiken.app"
git config --global user.name "Eiken Deploy"
```

## アプリケーションをデプロイ

### ステップ 1：プロジェクトをクローン

```bash
# ホームディレクトリに移動
cd /home

# リポジトリをクローン
git clone https://github.com/yourusername/eiken-exam-system.git
cd eiken-exam-system
```

### ステップ 2：依存関係をインストール

```bash
# Python 依存関係をインストール
pip install -r requirements.txt

# フロントエンド依存関係をインストール
cd frontend
npm install
npm run build
cd ..
```

### ステップ 3：データベースを初期化

```bash
# データベースを初期化
python3 -c "from backend import init_db; init_db()"

# サンプルデータを投入
python3 seed.py
```

## Systemd サービスを設定

### ステップ 1：バックエンドサービスを作成

```bash
# サービスファイルを作成
sudo tee /etc/systemd/system/eiken-backend.service > /dev/null << EOF
[Unit]
Description=Eiken Exam System Backend
After=network.target

[Service]
Type=notify
User=root
WorkingDirectory=/home/eiken-exam-system
ExecStart=/usr/bin/python3 -m uvicorn backend:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### ステップ 2：サービスを有効化して起動

```bash
# サービスを有効化
sudo systemctl enable eiken-backend.service

# サービスを起動
sudo systemctl start eiken-backend.service

# サービスステータスを確認
sudo systemctl status eiken-backend.service
```

## Nginx をリバースプロキシとして設定

### ステップ 1：Nginx をインストール

```bash
# Nginx をインストール
apt install -y nginx

# Nginx を起動
systemctl start nginx
systemctl enable nginx
```

### ステップ 2：Nginx 設定を作成

```bash
# Nginx 設定ファイルを作成
sudo tee /etc/nginx/sites-available/eiken-exam-platform > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    # バックエンド API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # フロントエンド
    location / {
        root /home/eiken-exam-system/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # ヘルスチェック
    location /health {
        proxy_pass http://127.0.0.1:8000;
        access_log off;
    }
}
EOF
```

### ステップ 3：Nginx を有効化

```bash
# シンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/eiken-exam-platform /etc/nginx/sites-enabled/

# デフォルトサイトを無効化
sudo rm /etc/nginx/sites-enabled/default

# Nginx 設定をテスト
sudo nginx -t

# Nginx を再起動
sudo systemctl restart nginx
```

## SSL/TLS 証明書を設定（Let's Encrypt）

### ステップ 1：Certbot をインストール

```bash
# Certbot をインストール
apt install -y certbot python3-certbot-nginx
```

### ステップ 2：証明書を取得

```bash
# 証明書を取得（ドメイン名を使用）
sudo certbot certonly --nginx -d eiken.example.com -d www.eiken.example.com

# または、IP アドレスのみの場合（スキップ可能）
# sudo certbot certonly --standalone -d <your-domain>
```

### ステップ 3：Nginx を更新

```bash
# Nginx 設定を更新
sudo tee /etc/nginx/sites-available/eiken-exam-platform > /dev/null << 'EOF'
server {
    listen 80;
    server_name eiken.example.com www.eiken.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eiken.example.com www.eiken.example.com;

    ssl_certificate /etc/letsencrypt/live/eiken.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eiken.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    # バックエンド API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # フロントエンド
    location / {
        root /home/eiken-exam-system/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # ヘルスチェック
    location /health {
        proxy_pass http://127.0.0.1:8000;
        access_log off;
    }
}
EOF
```

### ステップ 4：Nginx を再起動

```bash
# Nginx を再起動
sudo systemctl restart nginx

# SSL 証明書を確認
sudo certbot certificates
```

### ステップ 5：自動更新を設定

```bash
# Certbot タイマーを有効化
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# タイマーステータスを確認
sudo systemctl status certbot.timer
```

## ドメイン設定

### DNS レコードを設定

ドメインプロバイダーで以下の DNS レコードを設定：

```
Type    Name    Value
A       @       <server-ip>
A       www     <server-ip>
CNAME   api     <server-ip>
```

`<server-ip>` をサーバーの IP アドレスに置き換えてください。

## バックアップとモニタリング

### ステップ 1：自動バックアップスクリプトを作成

```bash
# バックアップスクリプトを作成
sudo tee /usr/local/bin/backup-eiken.sh > /dev/null << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups/eiken"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/home/eiken-exam-system/eiken.db"

# ディレクトリを作成
mkdir -p $BACKUP_DIR

# データベースをバックアップ
cp $DB_FILE $BACKUP_DIR/eiken_$DATE.db

# 古いバックアップを削除（30日以上前）
find $BACKUP_DIR -name "eiken_*.db" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/eiken_$DATE.db"
EOF

# スクリプトを実行可能にする
sudo chmod +x /usr/local/bin/backup-eiken.sh
```

### ステップ 2：Cron ジョブを設定

```bash
# Cron ジョブを編集
sudo crontab -e

# 以下の行を追加（毎日午前 2 時にバックアップ）
0 2 * * * /usr/local/bin/backup-eiken.sh
```

### ステップ 3：ログローテーションを設定

```bash
# ログローテーション設定を作成
sudo tee /etc/logrotate.d/eiken > /dev/null << 'EOF'
/var/log/eiken/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
EOF
```

## モニタリング

### ステップ 1：サービスステータスを確認

```bash
# バックエンドサービスのステータス
sudo systemctl status eiken-backend.service

# Nginx のステータス
sudo systemctl status nginx

# ログを確認
sudo journalctl -u eiken-backend.service -f
```

### ステップ 2：ヘルスチェック

```bash
# API ヘルスチェック
curl https://eiken.example.com/health

# フロントエンドアクセス
curl -I https://eiken.example.com
```

### ステップ 3：リソース使用状況を確認

```bash
# CPU とメモリ使用状況
top

# ディスク使用状況
df -h

# ネットワーク接続
netstat -an | grep ESTABLISHED | wc -l
```

## トラブルシューティング

### バックエンドが起動しない

```bash
# ログを確認
sudo journalctl -u eiken-backend.service -n 50

# ポートが使用中でないか確認
sudo lsof -i :8000

# サービスを再起動
sudo systemctl restart eiken-backend.service
```

### Nginx が起動しない

```bash
# 設定をテスト
sudo nginx -t

# ログを確認
sudo tail -f /var/log/nginx/error.log

# サービスを再起動
sudo systemctl restart nginx
```

### SSL 証明書エラー

```bash
# 証明書を確認
sudo certbot certificates

# 証明書を更新
sudo certbot renew --dry-run

# 証明書を強制更新
sudo certbot renew --force-renewal
```

## パフォーマンス最適化

### Nginx キャッシング

```bash
# Nginx 設定にキャッシング設定を追加
sudo tee -a /etc/nginx/sites-available/eiken-exam-platform > /dev/null << 'EOF'

# キャッシング設定
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=eiken_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache eiken_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_use_stale error timeout invalid_header updating;
}
EOF
```

### データベース最適化

```bash
# SQLite データベースを最適化
python3 << 'EOF'
import sqlite3

conn = sqlite3.connect('/home/eiken-exam-system/eiken.db')
cursor = conn.cursor()

# インデックスを作成
cursor.execute('CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_exam_sessions_user ON exam_sessions(user_id)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_answers_session ON user_answers(session_id)')

# データベースを最適化
cursor.execute('VACUUM')
cursor.execute('ANALYZE')

conn.commit()
conn.close()

print("Database optimization completed")
EOF
```

## スケーリング

### 負荷分散（複数サーバー）

複数のサーバーで実行する場合：

1. **Hetzner Load Balancer** を作成
2. バックエンドサーバーを複数追加
3. ヘルスチェックを設定
4. SSL 証明書を設定

詳細は Hetzner ドキュメントを参照してください。

## セキュリティ

### ファイアウォール設定

```bash
# UFW を有効化
sudo ufw enable

# ポート 22 を許可
sudo ufw allow 22/tcp

# ポート 80 と 443 を許可
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# ポート 8000 を許可（内部のみ）
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 8000

# ステータスを確認
sudo ufw status
```

### SSH セキュリティ

```bash
# SSH 設定を編集
sudo nano /etc/ssh/sshd_config

# 以下の設定を変更：
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# SSH を再起動
sudo systemctl restart sshd
```

### 定期的な更新

```bash
# 自動更新を有効化
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## よくある質問

**Q: サーバーの IP アドレスはどこで確認できますか？**
A: Hetzner コンソールのサーバー詳細ページで確認できます。

**Q: ドメイン名がない場合はどうしますか？**
A: IP アドレスで直接アクセスできます。ただし、SSL 証明書は取得できません。

**Q: バックアップはどのように復元しますか？**
A: `cp /backups/eiken/eiken_YYYYMMDD_HHMMSS.db /home/eiken-exam-system/eiken.db`

**Q: サーバーを再起動した場合、アプリケーションは自動的に起動しますか？**
A: はい、Systemd サービスが自動的に起動します。

**Q: ログはどこに保存されますか？**
A: `/var/log/nginx/` と `journalctl` で確認できます。

---

**最終更新**：2026年2月11日
