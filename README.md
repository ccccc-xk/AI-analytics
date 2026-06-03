# AI Analytics - 智能数据分析平台

**数据驱动决策的一站式分析工具** — 上传数据、智能可视化、AI 对话洞察、分享与 PDF 导出。

<a href="https://ai-analytics-opal.vercel.app"><img src="https://img.shields.io/badge/Demo-Vercel-000?style=for-the-badge&logo=vercel" alt="Demo Vercel"></a>
<a href="https://ai-analytics-2d8.pages.dev"><img src="https://img.shields.io/badge/Demo-Cloudflare-F38020?style=for-the-badge&logo=cloudflare" alt="Demo Cloudflare"></a>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19">
<img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript 6">
<img src="https://img.shields.io/badge/Ant_Design-6-0170FE?style=for-the-badge&logo=antdesign" alt="Ant Design 6">
<img src="https://img.shields.io/badge/ECharts-5-AA344D?style=for-the-badge" alt="ECharts 5">
<img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase">
<img src="https://img.shields.io/badge/Zustand-5-443E38?style=for-the-badge" alt="Zustand 5">

---

## 项目概述

本平台面向**数据分析人员与业务团队**，提供从数据上传到智能洞察的完整分析链路。用户上传 CSV / Excel / JSON 等格式的数据文件后，系统通过智能列分类算法自动识别数据类型，配合 ECharts 生成折线图、柱状图、饼图等可视化图表，并可通过 DeepSeek AI 实现流式对话分析。支持 Token 分享看板和 PDF 报告导出。

**适用场景**：

- 业务数据快速可视化与报告生成
- 多格式数据集分析与跨团队共享
- AI 驱动的数据洞察与决策辅助
- 团队协作数据报告一键导出

---

## 核心能力

| 能力域 | 说明 |
| :--- | :--- |
| **多格式数据上传** | CSV、TSV、Excel (.xlsx/.xls)、JSON，Excel 智能表头检测与多工作表选择 |
| **智能列分类** | 采样 500 行自动识别数值 / 分类 / 编号 / 日期四类列，辅助图表轴选择 |
| **可视化图表** | 折线图、柱状图、饼图，工具栏（保存图片 / 数据视图 / 缩放 / 还原） |
| **AI 对话分析** | DeepSeek API 流式输出，SSE 协议，数据上下文自动构建 |
| **数据搜索过滤** | 数据表格全列模糊匹配，实时过滤，数值列排序 |
| **Token 分享** | 随机 Token 分享链接，无需登录即可查看只读看板 |
| **PDF 报告导出** | HTML 渲染 + html2canvas，完美支持中文 |
| **用户系统** | 注册登录、头像上传、修改密码、个人资料编辑 |
| **双平台部署** | Vercel（海外）+ Cloudflare Pages（国内），Serverless API 代理 |

---

## 技术栈

| 技术 | 版本 | 选型理由 |
| :--- | :---: | :--- |
| React | 19 | 性能优化，最新版本，社区生态成熟 |
| TypeScript | 6.0 | 类型安全，减少运行时错误，提升可维护性 |
| Vite | 8 | 极速开发服务器，内置代理解决 CORS |
| Ant Design | 6 | 企业级 UI 组件库，开箱即用 |
| Supabase | - | 开源 Firebase 替代，Auth + PostgreSQL + RLS 一站式 |
| Zustand | 5 | 轻量级状态管理，无样板代码，支持函数式更新 |
| ECharts | 5 | 功能强大的图表库，支持丰富图表类型 |
| PapaParse | 5 | 前端 CSV/TSV 解析 |
| SheetJS | - | Excel 文件解析，支持多工作表 |
| jsPDF + html2canvas | - | PDF 导出，HTML 渲染方案支持中文 |
| React Router | v7 | 声明式路由，支持嵌套与懒加载 |
| DeepSeek API | - | 国产大语言模型，OpenAI 兼容格式，支持流式输出 |

---

## 项目结构

```
src/
├── api/                    # API 封装层（关注点分离）
│   ├── projects.ts         # 项目 CRUD
│   ├── datasets.ts         # 数据集接口（分批加载，1000 条/次）
│   ├── shares.ts           # 分享链接接口
│   └── mimo.ts             # DeepSeek AI API（流式调用，环境隔离）
├── components/
│   ├── ProtectedRoute.tsx  # 路由守卫
│   ├── CsvUploader.tsx     # 多格式上传（CSV/TSV/Excel/JSON）
│   ├── DataPreview.tsx     # 数据预览（搜索 + 动态列宽 + PDF）
│   ├── ChatPanel.tsx       # AI 对话面板（流式输出）
│   └── charts/
│       ├── ChartBuilder.tsx  # 图表配置（智能轴选择）
│       └── ChartRenderer.tsx # ECharts 渲染器（ErrorBoundary）
├── hooks/                  # 自定义 Hooks
│   ├── useAuth.ts          # 认证逻辑
│   ├── useProjects.ts      # 项目管理
│   ├── useDatasets.ts      # 数据集操作（分批加载）
│   ├── useCharts.ts        # 智能列分类 + 图表数据提取
│   └── useChat.ts          # AI 对话（流式 + 中断）
├── layouts/
│   └── AppLayout.tsx       # 侧边栏 + 顶部栏
├── pages/
│   ├── Dashboard.tsx       # 仪表盘（实时统计 + 最近项目）
│   ├── ProjectsPage.tsx    # 项目管理
│   ├── ProjectAnalysis.tsx # 数据分析（表格/图表/AI 三标签页）
│   ├── Admin.tsx           # 数据概览
│   ├── SettingsPage.tsx    # 系统设置
│   └── ShareView.tsx       # 公开分享看板
├── stores/                 # Zustand 状态管理（auth/project/dataset/chat）
├── types/
└── utils/
    ├── supabase.ts         # Supabase 客户端（含 fallback）
    └── pdfExport.ts        # PDF 导出

api/
└── chat.ts                 # Vercel Serverless Function

functions/
└── api/
    └── chat.ts             # Cloudflare Pages Function
```

---

## 智能列分类算法

平台的核心创新是**智能列分类系统**，通过采样前 500 行数据，自动识别列的数据特征：

| 列类型 | 判断条件 | 说明 |
| :--- | :--- | :--- |
| 数值列 | `numericRatio >= 30%` | 去除货币符号、逗号等后可解析为数字的比例 |
| 日期列 | `dateRatio >= 50%` | 匹配 YYYY-MM-DD 等日期格式的比例 |
| 编号列 | `uniqueCount >= 90%` 且 `>= 20` | 高基数值标识列（如订单号、手机号） |
| 分类列 | 其他 | 适合做图表分类轴的列 |

图表 X 轴和 Y 轴下拉框展示所有列但按适合度排序，每个选项附带类型标签和唯一值数量，帮助用户快速选择合适的字段。

---

## 部署架构

```
开发环境：
  浏览器 → Vite Dev Server (localhost:3001)
       → /api/deepseek 代理 → api.deepseek.com

生产环境（Vercel）：
  浏览器 → Vercel CDN
       → /api/chat → Vercel Serverless Function → api.deepseek.com
       → /* → index.html（SPA 路由）

生产环境（Cloudflare Pages）：
  浏览器 → Cloudflare CDN
       → /api/chat → Cloudflare Pages Function → api.deepseek.com
       → /* → index.html（SPA 路由）
```

> API Key 存储在 Serverless Function 环境变量中，不暴露给前端，保证安全。

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/ccccc-xk/AI-analytics.git
cd AI-analytics

# 安装依赖
npm install

# 配置环境变量（可选，有 fallback 值）
cp .env.example .env.local
# 编辑 .env.local 填写 Supabase 和 DeepSeek API Key

# 启动开发服务器
npm run dev
```

访问 http://localhost:3001

### 环境变量

| 变量 | 说明 | 必填 |
| :--- | :--- | :---: |
| `VITE_SUPABASE_URL` | Supabase 项目 URL | 有 fallback |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 有 fallback |
| `VITE_DEEPSEEK_API_KEY` | DeepSeek API 密钥 | 开发环境需要 |

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 功能模块

| 模块 | 功能 | 亮点 |
| :--- | :--- | :--- |
| 仪表盘 | 实时统计、最近项目、快捷操作 | 渐变横幅 + 动画卡片 |
| 数据上传 | 拖拽上传 CSV/TSV/Excel/JSON | Excel 智能表头检测 |
| 图表可视化 | 折线图、柱状图、饼图 | 智能列分类 + 工具栏 |
| AI 分析 | 流式对话，数据上下文自动构建 | SSE 协议 + 中断控制 |
| 数据预览 | 搜索过滤、数值排序、PDF 导出 | 全列模糊匹配 |
| 分享看板 | Token 分享，无需登录查看 | 随机 Token + 过期时间 |
| 系统设置 | 个人资料、头像、修改密码 | Canvas 压缩上传 |
| 双平台部署 | Vercel + Cloudflare Pages | Serverless API 代理 |

---

## 协议与贡献

欢迎 Issue 和 Pull Request。

**License**: MIT
