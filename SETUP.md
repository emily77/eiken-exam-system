# JLPT 互動式測驗網站 - 設置指南

## 專案概述

JLPT マスター 是一個優雅的互動式日本語能力測驗平台，支持 N1-N5 五個級別的測驗。用戶可以進行單選題測驗、即時答案驗證、成績追蹤和進度分析。

## 技術棧

- **前端**：React 19 + Tailwind CSS 4 + Vite
- **後端**：Express 4 + tRPC 11
- **資料庫**：MySQL + Drizzle ORM
- **認證**：Manus OAuth
- **圖表**：Recharts
- **UI 組件**：shadcn/ui + Radix UI

## 功能特性

### 用戶功能
- **級別選擇**：支持 N1-N5 五個 JLPT 級別
- **互動式答題**：單選題型，即時反饋和解析
- **成績追蹤**：詳細的成績報告和錯題回顧
- **進度儀表板**：視覺化的學習進度和統計數據
- **測驗歷史**：保存所有測驗記錄供回顧

### 管理員功能
- **題庫管理**：新增、編輯、刪除題目
- **題目分類**：按級別和類型組織題目
- **統計分析**：用戶測驗數據分析

## 資料庫架構

### 主要表結構

**questions** - 題目表
- id: 主鍵
- level: 級別 (N1-N5)
- type: 題型 (vocabulary, grammar, reading, listening)
- question: 題目內容
- options: 選項 (JSON 陣列)
- correctAnswer: 正確答案 (A/B/C/D)
- explanation: 詳細解析

**quizSessions** - 測驗會話表
- id: 主鍵
- userId: 用戶 ID
- level: 測驗級別
- totalQuestions: 總題數
- correctAnswers: 正確答案數
- score: 得分百分比
- startedAt: 開始時間
- completedAt: 完成時間

**userAnswers** - 用戶答案表
- id: 主鍵
- sessionId: 測驗會話 ID
- questionId: 題目 ID
- userAnswer: 用戶選擇
- isCorrect: 是否正確

## API 路由

### 公開路由

**獲取級別題目**
```
GET /api/trpc/quiz.getQuestionsByLevel
Input: { level: "N5", limit?: 10 }
```

**獲取單個題目**
```
GET /api/trpc/quiz.getQuestion
Input: { id: 1 }
```

### 受保護路由

**開始測驗**
```
POST /api/trpc/quiz.startQuiz
Input: { level: "N5", questionCount: 10 }
```

**提交答案**
```
POST /api/trpc/quiz.submitAnswer
Input: { sessionId: 1, questionId: 1, userAnswer: "A" }
```

**完成測驗**
```
POST /api/trpc/quiz.completeQuiz
Input: { sessionId: 1, score: 80 }
```

**獲取測驗歷史**
```
GET /api/trpc/quiz.getQuizHistory
Input: { limit?: 10 }
```

**獲取測驗結果**
```
GET /api/trpc/quiz.getQuizResults
Input: { sessionId: 1 }
```

### 管理員路由

**建立題目**
```
POST /api/trpc/quiz.createQuestion
Input: { 
  level: "N5",
  type: "vocabulary",
  question: "...",
  options: [...],
  correctAnswer: "A",
  explanation: "..."
}
```

**更新題目**
```
POST /api/trpc/quiz.updateQuestion
Input: { id: 1, ...updates }
```

**刪除題目**
```
POST /api/trpc/quiz.deleteQuestion
Input: { id: 1 }
```

## 前端頁面

### Home.tsx - 首頁
- 優雅的著陸頁面
- 級別選擇卡片
- 功能介紹
- 快速開始按鈕

### Quiz.tsx - 測驗頁面
- 題目顯示
- 單選選項
- 進度條
- 題目導航
- 即時反饋

### Results.tsx - 結果頁面
- 成績展示（圓形圖表）
- 正確率百分比
- 錯題回顧
- 詳細解析

### Dashboard.tsx - 儀表板
- 統計卡片（總測驗數、正確數、平均正確率）
- 級別表現圖表
- 最近成績趨勢
- 測驗歷史表格

## 視覺設計

### 色彩方案
- **主題**：優雅的紫色/靛藍色
- **背景**：淡色背景 (oklch(0.98 0.001 0))
- **強調色**：紫色 (oklch(0.56 0.19 263))
- **文字**：深色文字 (oklch(0.22 0.01 263))

### 設計特點
- 響應式設計
- 流暢的動畫和過渡
- 清晰的視覺層級
- 無障礙設計

## 開發工作流

### 1. 安裝依賴
```bash
pnpm install
```

### 2. 設置環境變數
系統環境變數已自動注入：
- DATABASE_URL
- JWT_SECRET
- VITE_APP_ID
- OAUTH_SERVER_URL
- 等等

### 3. 初始化資料庫
```bash
pnpm db:push
```

### 4. 填充示例數據
```bash
pnpm seed
```

### 5. 啟動開發服務器
```bash
pnpm dev
```

### 6. 運行測試
```bash
pnpm test
```

## 測試

### 後端測試
- 位置：`server/routers/quiz.test.ts`
- 覆蓋：所有 tRPC 路由
- 運行：`pnpm test`

### 測試用例
- 獲取題目
- 建立/更新/刪除題目（管理員）
- 開始測驗
- 提交答案
- 完成測驗
- 獲取歷史和統計

## 部署

### 構建
```bash
pnpm build
```

### 生產環境啟動
```bash
pnpm start
```

## 項目結構

```
jlpt-quiz-app/
├── client/                 # 前端代碼
│   ├── src/
│   │   ├── pages/         # 頁面組件
│   │   ├── components/    # 可重用組件
│   │   ├── lib/           # 工具函數
│   │   └── App.tsx        # 主應用
│   └── public/            # 靜態資源
├── server/                # 後端代碼
│   ├── routers/           # tRPC 路由
│   ├── db.ts              # 資料庫查詢
│   └── _core/             # 核心框架
├── drizzle/               # 資料庫模式
├── scripts/               # 工具腳本
└── package.json           # 項目配置
```

## 常見問題

### Q: 如何新增題目？
A: 管理員可以通過 `quiz.createQuestion` API 新增題目，或使用 `pnpm seed` 填充示例數據。

### Q: 如何修改題目？
A: 管理員可以使用 `quiz.updateQuestion` API 修改題目。

### Q: 如何查看用戶成績？
A: 用戶可以在儀表板查看自己的成績和進度。

### Q: 支持哪些題型？
A: 目前支持單選題 (vocabulary, grammar, reading, listening)。

## 貢獻指南

1. 建立新分支：`git checkout -b feature/new-feature`
2. 提交更改：`git commit -m "Add new feature"`
3. 推送分支：`git push origin feature/new-feature`
4. 建立 Pull Request

## 許可證

MIT License

## 聯繫方式

如有問題或建議，請提交 Issue 或 Pull Request。
