# AI 数据分析平台 - 面试准备指南

## 一、项目概述

**项目定位**：基于 AI 的企业级数据分析平台，支持多格式数据上传、智能可视化分析、AI 对话洞察、数据分享与 PDF 导出。

**核心亮点**：
- 完整的前后端全栈项目（8 个开发线程，从零到部署上线）
- 双平台部署（Vercel 海外 + Cloudflare Pages 国内，Serverless API 代理）
- 集成 AI 能力（DeepSeek API 流式对话分析，SSE 协议）
- 智能列分类系统（采样 500 行，四维度自动识别数值/分类/编号/日期列）
- 多格式数据上传（CSV/TSV/Excel/JSON，Excel 智能表头检测 + 多工作表选择）
- 现代化 UI 设计（渐变横幅、动画卡片、企业级质感，四个页面各有特色配色）
- 团队协作（Token 分享 + 公开看板 + PDF 报告导出）

**在线地址**：
- Vercel（海外）：https://ai-analytics-opal.vercel.app
- Cloudflare Pages（国内）：https://ai-analytics-2d8.pages.dev

---

## 二、技术栈及选型理由

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| **React** | 19 | 最新版本，性能优化，社区生态成熟 |
| **TypeScript** | 6.0 | 类型安全，减少运行时错误，提升代码可维护性 |
| **Vite** | 8 | 极速开发服务器，快速构建，内置代理解决 CORS |
| **Ant Design** | 6 | 企业级 UI 组件库，开箱即用，国际化支持 |
| **Supabase** | - | 开源 Firebase 替代方案，Auth + 数据库 + RLS 一站式 |
| **Zustand** | 5 | 轻量级状态管理，无样板代码，支持函数式更新 |
| **ECharts** | 5 | 功能强大的图表库，支持丰富图表类型和交互 |
| **echarts-for-react** | 3 | ECharts 的 React 封装，声明式配置 |
| **PapaParse** | 5 | 前端 CSV 解析，支持流式和大文件 |
| **SheetJS (xlsx)** | 0.18 | Excel 文件解析，支持 .xlsx/.xls 格式和多工作表 |
| **jsPDF + html2canvas** | - | PDF 导出，HTML 渲染方案完美支持中文 |
| **React Router** | v7 | 声明式路由，支持嵌套路由和懒加载 |
| **dayjs** | - | 轻量级日期处理库，替代 moment.js |
| **DeepSeek API** | - | 国产大语言模型，OpenAI 兼容格式，支持流式输出 |

---

## 三、项目架构

```
src/
├── api/                    # API 封装层（关注点分离）
│   ├── projects.ts         # 项目 CRUD 接口
│   ├── datasets.ts         # 数据集接口（分批加载，最大 1000 条/次）
│   ├── shares.ts           # 分享链接接口
│   └── mimo.ts             # DeepSeek AI API（流式调用，开发走 Vite 代理，生产走 Serverless）
├── components/             # 可复用组件
│   ├── ProtectedRoute.tsx  # 路由守卫（检查 Zustand store 中的 user 状态）
│   ├── ProjectCard.tsx     # 项目卡片
│   ├── ProjectModal.tsx    # 项目创建/编辑弹窗（复用同一组件，editingProject 区分模式）
│   ├── CsvUploader.tsx     # 多格式数据上传组件（CSV/TSV/Excel/JSON，智能表头检测）
│   ├── DatasetList.tsx     # 数据集列表卡片
│   ├── DataPreview.tsx     # 数据预览表格（动态列宽 + 搜索过滤 + PDF 导出 + 列排序）
│   ├── ChatPanel.tsx       # AI 对话面板（流式输出 + 推荐问题 + 停止生成）
│   └── charts/
│       ├── ChartBuilder.tsx  # 图表配置 UI（智能轴选择 + 类型标签 + 实时预览）
│       └── ChartRenderer.tsx # ECharts 渲染器（Class Component ErrorBoundary + 工具栏）
├── hooks/                  # 自定义 Hooks（逻辑复用）
│   ├── useAuth.ts          # 认证逻辑
│   ├── useProjects.ts      # 项目管理逻辑
│   ├── useDatasets.ts      # 数据集操作（分批加载全部数据）
│   ├── useCharts.ts        # 图表数据转换（智能列分类 + 轴选择 + 图表数据提取）
│   └── useChat.ts          # AI 对话逻辑（流式 + 中断 + 数据上下文构建）
├── layouts/
│   └── AppLayout.tsx       # 侧边栏（分组导航）+ 顶部栏（用户头像下拉）+ Outlet
├── pages/
│   ├── Login.tsx           # 登录页
│   ├── Register.tsx        # 注册页
│   ├── Dashboard.tsx       # 仪表盘（紫蓝渐变横幅 + 实时统计 + 最近项目 + 快捷操作）
│   ├── ProjectsPage.tsx    # 项目管理主页
│   ├── ProjectDetail.tsx   # 项目详情（分享链接管理）
│   ├── ProjectAnalysis.tsx # 数据分析主页（表格/图表/AI 三标签页）
│   ├── ShareView.tsx       # 公开分享看板（无需登录，Token 路由）
│   ├── Admin.tsx           # 数据概览（蓝紫渐变横幅 + 四统计卡片 + 分享管理 + 数据集浏览）
│   └── SettingsPage.tsx    # 系统设置（青绿渐变横幅 + 个人信息 + 头像上传 + 修改密码）
├── stores/                 # Zustand 状态管理（按功能模块拆分）
│   ├── authStore.ts        # 认证状态（含 user_metadata，refreshUser 支持）
│   ├── projectStore.ts     # 项目状态
│   ├── datasetStore.ts     # 数据集状态
│   └── chatStore.ts        # 聊天状态（流式更新 + AbortController 中断控制）
├── types/
│   └── index.ts            # TypeScript 类型定义
└── utils/
    ├── supabase.ts         # Supabase 客户端初始化（含 fallback 值，支持无环境变量部署）
    └── pdfExport.ts        # PDF 导出（HTML 渲染方案，html2canvas 2x 高清）

api/
└── chat.ts                 # Vercel Serverless Function（代理 DeepSeek API，隐藏 API Key）

functions/
└── api/
    └── chat.ts             # Cloudflare Pages Function（代理 DeepSeek API）
```

**部署相关文件**：
```
vercel.json                 # Vercel SPA 路由配置（所有路由重定向到 index.html）
.vercelignore               # Vercel 忽略文件
vite.config.ts              # Vite 配置（端口 3001，@ 路径别名，DeepSeek 代理）
```

**架构设计原则**：
1. **三层分离**：API 层 → Store 层 → Hook 层，各司其职
2. **组件化开发**：可复用组件独立封装，Props 驱动
3. **类型安全**：TypeScript 全面覆盖
4. **状态管理集中化**：Zustand store 按功能模块拆分（auth/project/dataset/chat）
5. **环境隔离**：开发走 Vite 代理，生产走 Serverless Function，API Key 不暴露给前端

---

## 四、数据库设计

### 核心表结构

```sql
-- 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 数据集表
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  row_count INTEGER,
  column_names TEXT[],  -- 列名数组
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 数据行表（JSONB 存储灵活数据）
CREATE TABLE data_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  row_data JSONB NOT NULL,
  row_index INTEGER NOT NULL
);

-- 分享表
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

**设计亮点**：
- **JSONB 存储**：data_rows 用 JSONB 存储每行数据，支持动态列结构，无需为每个数据文件创建不同的表
- **RLS 策略**：通过 projects → user_id 链实现数据隔离，即使 API key 泄露也无法越权访问
- **级联删除**：删除项目时自动清理 datasets、data_rows、shares
- **Token 分享**：shares 表通过随机 token 实现无需登录的只读公开访问
- **索引优化**：shares 表的 token 和 project_id 建有索引

### RLS 策略

```sql
-- 项目级隔离
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- 跨表关联 RLS：data_rows → datasets → projects → user_id
CREATE POLICY "Access via project" ON data_rows FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM datasets
    JOIN projects ON datasets.project_id = projects.id
    WHERE datasets.id = data_rows.dataset_id AND projects.user_id = auth.uid()
  )
);

-- 分享表：用户管理自己的分享 + 任何人可通过 token 查看
CREATE POLICY "Users can manage own shares" ON shares FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Anyone can view share by token" ON shares FOR SELECT USING (true);
```

---

## 五、核心功能模块详解

### 模块 1：用户认证系统

**文件**：`authStore.ts` + `useAuth.ts` + `Login.tsx` + `Register.tsx` + `ProtectedRoute.tsx` + `SettingsPage.tsx`

**认证流程**：
1. 用户输入邮箱密码 → `supabase.auth.signInWithPassword()`
2. Supabase 返回 JWT Token → 自动存储在 localStorage
3. `onAuthStateChange` 监听器自动更新 Zustand store
4. `ProtectedRoute` 检查 user 状态，未登录则重定向到 /login
5. `getSession()` 在应用启动时恢复会话，实现持久化登录

**用户资料管理**（SettingsPage.tsx）：
- 头像上传：`FileReader` 读取 → `Canvas` 压缩至 200px（等比缩放）→ JPEG 0.85 质量 → Base64 → 存入 `user_metadata.avatar_url`
- 显示名称：存入 `user_metadata.display_name`
- 修改密码：`supabase.auth.updateUser({ password })` + 确认密码校验
- 编辑资料弹窗：修改显示名称，提交时同时保存 avatar_url
- `refreshUser()` 方法：更新后重新获取 user 对象，确保 store 同步

**面试话术**：
「认证系统采用 Supabase Auth 实现，通过 Zustand 集中管理认证状态。实现了 session 持久化，用户刷新页面无需重新登录。路由守卫通过检查 store 中的 user 状态实现权限控制。用户资料（头像、显示名称）存储在 Supabase 的 user_metadata 中，头像通过 Canvas 压缩为 Base64，避免额外的文件存储服务，压缩策略是等比缩放至 200px，JPEG 质量 0.85。」

---

### 模块 2：项目管理与仪表盘

**文件**：`projects.ts` + `projectStore.ts` + `useProjects.ts` + `Dashboard.tsx` + `ProjectsPage.tsx` + `ProjectDetail.tsx` + `ProjectCard.tsx` + `ProjectModal.tsx`

**Dashboard 设计**：
- 顶部紫蓝渐变欢迎横幅（`#6366f1 → #8b5cf6 → #a855f7`），显示用户名
- 三个统计卡片（带入场动画 + hover 浮起效果）：项目总数、数据集数量、数据总量
  - 统计数据从数据库实时聚合：遍历所有项目，调用 `datasetsApi.getDatasets()` 汇总
- 最近项目列表：按创建时间倒序取 4 个，点击跳转项目详情
- 右侧快捷操作（新建项目、管理项目）和平台能力说明

**CRUD 流程**：
1. 用户点击"新建项目" → 打开 ProjectModal 弹窗
2. 填写名称和描述 → 表单校验通过后提交
3. 调用 `projectsApi.createProject()` → Supabase INSERT
4. 成功后 `addProject()` 更新 Zustand store → UI 自动刷新
5. 创建和编辑复用同一个 Modal 组件，通过 `editingProject` 是否为 null 区分模式
6. 删除时 Popconfirm 二次确认 → DELETE + `removeProject()`

**面试话术**：
「项目管理采用三层架构：API 层封装 Supabase 查询，Zustand Store 管理前端状态，自定义 Hook 将 API 调用、状态更新、用户反馈整合在一起。Dashboard 通过异步遍历所有项目聚合数据集统计，实现了实时的数据概览。统计卡片使用 CSS 动画（fadeInUp + hover translateY）增加交互反馈。」

---

### 模块 3：多格式数据上传与智能解析

**文件**：`CsvUploader.tsx`（实际命名为 DataUploader）+ `DatasetList.tsx` + `datasetStore.ts` + `useDatasets.ts` + `datasets.ts`

**支持格式**：CSV、TSV、Excel (.xlsx/.xls)、JSON

**上传流程**：
1. 用户拖拽或选择文件 → 根据扩展名选择解析器
2. PapaParse 解析 CSV/TSV，SheetJS 解析 Excel，原生 JSON.parse 解析 JSON
3. 解析成功后显示预览表格（前 5 行）
4. 用户输入数据集名称，点击确认上传
5. 前端批量 INSERT 到 Supabase（datasets + data_rows）
6. 上传成功后自动切换到数据集列表

**Excel 智能表头检测**（核心亮点）：

```typescript
const parseSheetWithSmartHeaders = (rawRows: unknown[][]) => {
  // 1. 扫描前 5 行，找第一个大部分单元格为非空字符串的行作为表头
  // 2. 检测下一行是否为子表头（非空单元格长度 ≤4 的短字符串，如"分数"、"班级"）
  // 3. 如果是子表头，合并双行表头："语文" + "分数" → "语文"，"语文" + "班级" → "语文-班级"
  // 4. 去重列名：重复列名自动加 _2, _3 后缀
  // 5. 构建数据行，跳过空行
}
```

- **多工作表支持**：检测到多个 Sheet 时弹出选择器，显示每个表的行列数（如 "Sheet1（100 行 × 5 列）"）
- **单工作表自动解析**：只有一个 Sheet 时直接解析，无需用户选择
- **学生成绩表兼容**：自动识别标题行 + 子表头结构，合并为"语文"、"数学"等列名
- **JSON 格式支持**：自动检测数组或对象结构，提取第一个数组 key 作为数据源

**大数据加载优化**：

```typescript
// 分批加载全部数据（Supabase 单次最大 1000 条）
const fetchRows = async (datasetId: string) => {
  const allRows = []
  const batchSize = 1000
  let offset = 0
  let hasMore = true
  while (hasMore) {
    const { data } = await datasetsApi.getDataRows(datasetId, batchSize, offset)
    if (data && data.length > 0) {
      allRows.push(...data)
      offset += data.length
      if (data.length < batchSize) hasMore = false
    } else { hasMore = false }
  }
  setDataRows(allRows)
}
```

**面试话术**：
「数据上传支持 CSV、TSV、Excel、JSON 四种格式。Excel 解析使用 SheetJS 库，实现了智能表头检测算法：扫描前 5 行找到表头行，检测下一行是否为子表头（通过字符串长度判断），如果是则合并双行表头。多工作表 Excel 文件会弹出选择器让用户指定导入哪个 Sheet。数据加载使用分批策略，每次 1000 条循环获取，绕过 Supabase 单次查询限制。」

---

### 模块 4：智能数据可视化（ECharts）

**文件**：`ChartBuilder.tsx` + `ChartRenderer.tsx` + `useCharts.ts`

**智能列分类系统**（核心亮点）：

```typescript
type ColumnKind = 'numeric' | 'category' | 'id' | 'date'

function classifyColumns(dataRows, columns): ColumnMeta[] {
  // 采样前 500 行数据
  // 对每列计算三个指标：
  //   1. numericRatio：去掉货币符号/逗号/百分号后可解析为数字的比例
  //   2. dateRatio：匹配日期格式（YYYY-MM-DD 等）的比例
  //   3. uniqueCount / nonEmptyCount：唯一值比例

  // 分类逻辑：
  //   numericRatio >= 0.3 → numeric
  //   dateRatio >= 0.5 → date
  //   uniqueCount >= 90% * nonEmptyCount 且 uniqueCount >= 20 → id
  //   其他 → category
}
```

**智能轴选择器**（全部列均可选，按适合度排序）：
- **X 轴 / 分类字段**：所有列均出现在选项中，按适合度排序
  - 排序优先级：日期 > 分类 > 数值 > 编号
  - 折线图时日期列自动排到最前
  - 同类型内按唯一值数量升序（唯一值少的排前面，更适合做分类）
- **Y 轴 / 数值字段**：所有列均出现在选项中，按适合度排序
  - 排序优先级：数值 > 日期 > 分类 > 编号
  - 同类型内按 numericRatio 降序
- **每个选项显示类型标签**（分类/日期/数值/编号）和唯一值数量
- **饼图拥挤警告**：X 列唯一值 >20 时显示 Alert 提示
- **饼图提示文字**："所有列均可作为分类标签，建议选择分类意义明确的列"

**图表类型**：
- **折线图**：面积填充（渐变色）、smooth 平滑曲线、inside + slider 双 dataZoom、轴标签自动旋转
- **柱状图**：圆角柱体（`borderRadius: [4,4,0,0]`）、inside + slider 双 dataZoom、hover 阴影效果
- **饼图**：环形图（`radius: ['35%', '65%']`）、自动 Top 10 归类 + "其他"合并、垂直图例、标签显示百分比

**ChartRenderer 设计**：
- React Class Component + Error Boundary（`getDerivedStateFromError` + `componentDidCatch`）
- 图表渲染出错时显示 Ant Design Alert 错误提示，而不是白屏
- `componentDidUpdate` 支持错误状态重置（切换图表类型或数据时自动恢复）
- `notMerge={true}` 确保完整替换 option，避免旧配置残留

**工具栏功能**：
- 保存图片（2x 高清像素，白色背景）
- 数据视图（只读模式，中文标签）
- 还原（恢复初始状态）
- 区域缩放（折线图和柱状图可用，饼图隐藏）
- 工具栏位于图表右上角，竖直排列

**面试话术**：
「数据可视化的核心创新是智能列分类系统。通过采样前 500 行数据，计算每列的数值占比、日期占比、唯一值比例，自动将列分为四类。X 轴和 Y 轴下拉框展示所有列但按适合度排序——日期列在折线图中自动排前，数值列在 Y 轴中优先。每个选项附带类型标签和唯一值数量，帮助用户做出正确选择。ChartRenderer 使用 Class Component 实现 Error Boundary，图表渲染出错时显示友好的错误提示而不是白屏。」

---

### 模块 5：数据预览与搜索

**文件**：`DataPreview.tsx`

**功能特性**：
- **搜索过滤**：输入关键字后，对所有列进行模糊匹配（大小写不敏感），实时过滤表格数据
- **动态列宽**：根据列类型自动设置宽度
  - ID/编号/订单类列：180px，左对齐
  - 日期/时间类列：140px
  - 数值类列：120px
  - 其他列：根据列名长度自适应（120px-250px）
- **数值列排序**：自动检测数值列，支持升序/降序排序
- **分页**：默认 50 条/页，支持切换 50/100/200 条/页
- **PDF 导出**：一键生成数据报告 PDF（包含列统计信息和数据表格）
- **横向滚动**：`scroll={{ x: 'max-content', y: 500 }}` 支持大数据集浏览

**面试话术**：
「数据预览组件支持搜索过滤和列排序。搜索功能对所有列进行模糊匹配，实时过滤结果。列宽根据列类型动态设置——ID 列较宽、数值列较窄、文本列根据名称长度自适应。数值列自动检测并支持排序。PDF 导出使用 html2canvas 将 HTML 报告转为图片嵌入 PDF，完美支持中文。」

---

### 模块 6：AI 对话分析（DeepSeek API 流式）

**文件**：`mimo.ts` + `chatStore.ts` + `useChat.ts` + `ChatPanel.tsx`

**架构设计**：

```
用户输入 → useChat.sendMessage()
  → 构建上下文（system prompt + 数据摘要 + 最近 5 条历史）
  → streamChat() 发送请求
  → SSE 流式读取
  → onToken: chatStore.updateLastMessage(prev => prev + token)  → 逐字显示
  → onDone:  setLastMessageStreaming(false)                      → 完成
  → onError: 显示错误提示                                         → 异常处理
```

**环境隔离**（CORS 解决方案）：
- **开发环境**：Vite 开发服务器代理 `/api/deepseek` → `https://api.deepseek.com`，浏览器端携带 API Key
- **生产环境**：前端请求 `/api/chat` → Vercel Serverless Function / Cloudflare Pages Function → DeepSeek API，API Key 存储在服务端环境变量中

**数据上下文构建**：
```typescript
function buildDataContext(datasetName, columns, rowCount, sampleRows) {
  // 对每列检测类型（数值/文本）
  // 取前 3 行样本数据，截断长值（>20 字符）
  // 返回格式化文本："数据集名 | N行 | 列：col1(数值), col2(文本)\n样本：..."
}
```

**UI 交互**：
- 消息气泡（用户蓝色 / AI 灰色）
- 推荐问题标签（首次进入时显示 4 个预设问题）
- 流式光标动画（`▊` 闪烁，CSS @keyframes blink）
- 停止生成按钮（AbortController 中断）
- 清空对话按钮
- 自动滚动到最新消息

**面试要点**：
- **为什么用流式？** 即时显示部分结果，减少等待焦虑，用户体验更好
- **如何构建 AI 上下文？** 提取列名、数据类型、前 3 行样本，加上 system prompt 定义 AI 角色
- **如何中断生成？** AbortController 传入 fetch 的 signal，用户点击"停止"时调用 `abort()`
- **CORS 如何解决？** 开发走 Vite 代理，生产走 Serverless Function，API Key 不暴露给前端
- **为什么只传最近 5 条历史？** 节省 token，避免超出上下文窗口

**面试话术**：
「AI 对话分析采用流式架构，通过 SSE 协议逐 token 接收 DeepSeek API 响应，实现打字机效果。系统会自动构建数据上下文（列名、类型、样本数据）发送给 AI。开发环境通过 Vite 代理解决 CORS，生产环境通过 Serverless Function 代理，API Key 存储在服务端。支持 AbortController 中断生成、清空对话。」

---

### 模块 7：数据分享与 PDF 导出

**文件**：`shares.ts` + `ShareView.tsx` + `pdfExport.ts`

**分享机制**：
1. 用户在项目详情页点击"生成分享链接"
2. 后端生成随机 Token（UUID + 时间戳），设置 7 天过期
3. 分享链接格式：`/share/:token`
4. ShareView 页面通过 token 查询项目和数据集，渲染只读看板
5. 无需登录即可访问（公开路由，在 ProtectedRoute 之外）

**PDF 导出方案**（解决中文乱码）：
```
问题：jsPDF 默认 Helvetica 字体不支持中文 → 乱码
方案：HTML 渲染 + html2canvas + jsPDF

HTML（中文完美显示）→ Canvas（2x 高清）→ PNG → PDF 嵌入
优点：支持任意字体、复杂布局、表格、颜色
缺点：文字不可选中（图片格式，对数据报告场景足够）
```

**面试话术**：
「数据分享通过随机 Token 实现，支持过期时间控制，分享链接无需登录即可访问。PDF 导出采用 HTML 渲染方案，通过 html2canvas 将 HTML 报告转为图片嵌入 PDF，完美解决中文乱码问题。报告包含列统计信息（类型、最小值、最大值、平均值）和数据预览表格。」

---

### 模块 8：数据概览（Admin）

**文件**：`Admin.tsx`

**页面特色**：蓝紫渐变横幅（`#0ea5e9 → #6366f1 → #8b5cf6`）

**功能**：
- 四个统计卡片（带入场动画）：项目数、数据集数、数据总量、分享链接数
- 分享管理表格：查看所有分享链接，显示过期状态（永久/已过期/有效），支持删除
- 数据集概览表格：浏览所有数据集，支持查看内容（弹窗加载前 200 行）
- 刷新按钮：重新加载所有统计数据

---

### 模块 9：侧边栏导航与布局

**文件**：`AppLayout.tsx`

**侧边栏设计**：
- 品牌区域：渐变图标 + "AI Analytics" 文字
- 分组导航：核心功能（仪表盘、项目管理）、数据分析（数据概览）、系统（系统设置）
- 可折叠：64px 折叠 / 220px 展开
- 顶部栏：折叠按钮 + 用户头像下拉菜单（个人资料、退出登录）

---

## 六、关键技术点详解

### 1. 智能列分类算法

```typescript
// 采样 500 行，三维度分类
const classifyColumns = (dataRows, columns): ColumnMeta[] => {
  // 1. 去噪：stripNonNumeric() 去掉货币符号($¥€£₹)、逗号、百分号、空格、括号
  // 2. numericRatio >= 0.3 → numeric（阈值从 0.5 降到 0.3，提高数值列召回率）
  // 3. dateRatio >= 0.5 → date
  // 4. uniqueCount >= 90% 且 >= 20 → id（高基数标识列）
  // 5. 其他 → category
}
```

**面试要点**：
- **为什么是 500 行采样？** 平衡准确性和性能，500 行足以反映列特征，不需要全量扫描
- **为什么数值阈值是 0.3？** 很多数据列含少量空值或非标准格式（如 "N/A"），0.3 阈值提高召回率，避免漏判数值列
- **为什么 ID 阈值是 90% + 20？** 订单号、手机号等标识列几乎每行唯一，但小数据集中 100% 唯一也可能是文本列，双条件避免误判
- **stripNonNumeric 处理了什么？** 货币符号（$¥€£₹）、逗号千分位、百分号、空格、括号（负数表示）、前缀字母

### 2. Zustand 状态管理模式

```typescript
// Store 只负责状态定义，不负责 API 调用
// Hook 层串联 API + Store + UI 反馈
const useChatStore = create((set) => ({
  messages: [],
  loading: false,
  abortController: null,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (content) => set((s) => {
    const msgs = [...s.messages]
    const last = msgs[msgs.length - 1]
    const newContent = typeof content === 'function' ? content(last.content) : content
    msgs[msgs.length - 1] = { ...last, content: newContent }
    return { messages: msgs }
  }),
}))
```

**面试要点**：
- **为什么选 Zustand 而不是 Redux？** API 简洁、无样板代码、轻量（~1KB）、原生支持函数式更新、TypeScript 推导友好
- **Store 如何组织？** 按功能模块拆分（auth/project/dataset/chat），每个 store 独立
- **流式更新怎么实现？** `updateLastMessage` 支持 `(prev) => prev + token` 函数式更新，避免闭包陷阱

### 3. Supabase RLS（行级安全）

```sql
-- 跨表关联 RLS：通过 JOIN 链实现数据隔离
CREATE POLICY "Access via project" ON data_rows FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM datasets
    JOIN projects ON datasets.project_id = projects.id
    WHERE datasets.id = data_rows.dataset_id AND projects.user_id = auth.uid()
  )
);
```

**面试要点**：
- **RLS 是什么？** PostgreSQL 行级安全特性，每条 SQL 操作自动附加 WHERE 条件过滤
- **为什么不用应用层权限？** RLS 在数据库层强制执行，即使 API key 泄露或前端代码被绕过，也无法越权访问。这是纵深防御思想
- **跨表关联 RLS 怎么实现？** data_rows → datasets → projects → user_id，通过 EXISTS 子查询链

### 4. 流式 AI 对话架构

**SSE 协议流程**：
```
fetch(endpoint, { body: JSON.stringify({ stream: true }) })
  → ReadableStream reader
  → TextDecoder 逐块解码
  → 按行分割，提取 "data: " 前缀
  → JSON.parse 提取 choices[0].delta.content
  → onToken 回调 → updateLastMessage(prev => prev + delta)
```

### 5. Excel 智能表头检测

```typescript
// 处理复杂 Excel 表结构（如学生成绩表）
const parseSheetWithSmartHeaders = (rawRows) => {
  // 1. 扫描前 5 行，找第一个大部分非空的行作为表头
  // 2. 检测下一行是否为子表头（非空单元格长度 ≤4 的比例 ≥80%）
  // 3. 合并双行表头：维护 currentCategory 变量，遇到"分数"/"成绩"用类别名，否则拼接
  // 4. 去重列名：Map 计数，重复名自动加 _2, _3 后缀
}
```

### 6. 双平台部署架构

```
开发环境：
  浏览器 → Vite Dev Server (localhost:3001)
         → /api/deepseek 代理 → api.deepseek.com（浏览器端 API Key）

生产环境（Vercel）：
  浏览器 → Vercel CDN
         → /api/chat → Vercel Serverless Function → api.deepseek.com（服务端 API Key）
         → /* → index.html（SPA 路由，vercel.json 配置）

生产环境（Cloudflare Pages）：
  浏览器 → Cloudflare CDN
         → /api/chat → Cloudflare Pages Function → api.deepseek.com（服务端 API Key）
         → /* → index.html（SPA 路由）
```

**Supabase 客户端 Fallback**：
```typescript
// 支持无环境变量部署（代码内置 fallback 值）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbG...'
```

---

## 七、项目难点与解决方案

| 难点 | 解决方案 |
|------|----------|
| CSV 大文件加载 | 分批加载（每批 1000 条），while 循环获取全部数据 |
| Excel 多表头解析 | 智能表头检测：扫描前 5 行找表头，检测子表头（长度 ≤4），合并双行表头 |
| Excel 多工作表 | Sheet 选择器，显示每个表的行列数，单 Sheet 时自动解析 |
| 饼图不显示数据 | stripNonNumeric 去掉货币符号等，非数值自动按计数聚合 |
| 图表轴选择混乱 | 智能列分类系统：全部列可选但按适合度排序，附带类型标签 |
| 图表渲染白屏 | Error Boundary（Class Component getDerivedStateFromError） |
| PDF 中文乱码 | HTML 渲染 + html2canvas，替代 jsPDF 直接画文字 |
| 图表工具栏失效 | `notMerge={true}` 配合完整 toolbox 配置 |
| AI 流式输出 | SSE + ReadableStream + Zustand 函数式更新 + AbortController |
| 分享安全性 | 随机 Token + 过期时间 + RLS 公开读取策略 |
| CORS 跨域 | 开发走 Vite 代理，生产走 Serverless Function |
| 头像存储 | Canvas 压缩至 200px → Base64 → user_metadata |
| 部署环境变量缺失 | Supabase 客户端内置 fallback 值 |
| 轴标签重叠 | axisLabel.rotate 自动旋转 + nameGap 防重叠 |

---

## 八、性能优化点

1. **分批数据加载**：Supabase 单次 1000 条限制，while 循环获取避免超时
2. **列分类采样**：采样 500 行而非全量检测，平衡准确性和性能
3. **流式 AI 响应**：SSE 逐 token 返回，即时渲染，减少等待
4. **Zustand 按需订阅**：避免不必要的组件重渲染
5. **html2canvas 2x 缩放**：PDF 导出使用 2 倍分辨率，保证清晰度
6. **Canvas 头像压缩**：上传前压缩至 200px + JPEG 0.85 质量，减少 Base64 体积
7. **图表 dataZoom**：inside（鼠标滚轮）+ slider（底部滑块）双交互模式，大数据集友好
8. **饼图 Top 10 归类**：超过 10 个分类自动合并为"其他"，避免图表过于拥挤

---

## 九、UI 设计亮点

| 页面 | 横幅渐变色 | 特色 |
|------|-----------|------|
| Dashboard | 紫蓝色 `#6366f1 → #8b5cf6 → #a855f7` | 欢迎语 + 用户名 |
| Admin（数据概览） | 蓝紫色 `#0ea5e9 → #6366f1 → #8b5cf6` | 刷新按钮 |
| Settings（系统设置） | 青绿色 `#0f766e → #0d9488 → #14b8a6` | 头像 + 相机图标 |

**通用设计元素**：
- 统计卡片：hover 浮起 + 阴影增强，入场 fadeInUp 动画
- 卡片圆角 14px，`border: 1px solid #e2e8f0`，微阴影
- 渐变横幅圆角 16px，装饰性半透明圆形
- 侧边栏：深色主题，可折叠，品牌区域渐变图标

---

## 十、可扩展方向

1. **更多图表类型**：散点图、热力图、地图、桑基图、雷达图
2. **团队协作**：多用户权限管理、实时协作编辑、评论系统
3. **数据管道**：定时任务、数据自动更新、Webhook 触发
4. **AI 增强**：多模型支持、自定义分析模板、自动异常检测、AI 生成图表配置
5. **图表持久化**：将图表配置保存到数据库，跨设备同步
6. **数据源连接**：数据库直连、API 数据源、实时数据流
7. **移动端适配**：响应式布局优化、手势交互

---

## 十一、常见面试问题

**Q: 为什么选择 Supabase 而不是自己搭后端？**
A: Supabase 提供开箱即用的 Auth、数据库、存储服务，减少 80% 后端开发成本。RLS 策略在数据库层强制执行安全，比应用层权限更可靠。同时它是开源的（基于 PostgreSQL），可以自托管，不被厂商锁定。

**Q: 你的项目架构是怎么设计的？**
A: 采用三层架构：API 层封装 Supabase 查询，Zustand Store 管理前端状态，自定义 Hook 串联两者并处理业务逻辑。每层职责单一，方便测试和替换。组件层通过 Props 接收数据，保持纯展示。

**Q: RLS 策略是怎么工作的？为什么不用应用层权限？**
A: RLS 是 PostgreSQL 的行级安全特性，每条 SQL 操作自动附加 WHERE 条件过滤。相比应用层权限，RLS 在数据库层强制执行，即使 API key 泄露或前端代码被绕过，也无法访问其他用户的数据。这是纵深防御的思想。跨表关联 RLS 通过 EXISTS 子查询实现 data_rows → datasets → projects → user_id 的链式权限验证。

**Q: 智能列分类是怎么实现的？**
A: 通过采样前 500 行数据，对每列计算三个指标：数值占比（stripNonNumeric 后可解析为数字的比例）、日期占比（匹配 YYYY-MM-DD 等格式的比例）、唯一值比例。数值占比 ≥30% 算数值列（低阈值提高召回率），日期占比 ≥50% 算日期列，唯一值极高（≥90% 且 ≥20）算编号列，其他算分类列。分类结果用于排序轴选择器。

**Q: AI 流式对话是怎么实现的？**
A: 通过 SSE（Server-Sent Events）协议实现。前端发送请求后保持连接打开，后端逐 token 返回数据。前端使用 ReadableStream + TextDecoder 读取数据流，按行分割提取 "data: " 前缀的 JSON，解析出 delta.content 后通过 Zustand 的函数式更新追加到消息末尾。支持 AbortController 中断生成。

**Q: PDF 导出为什么用 HTML 渲染而不是直接用 jsPDF？**
A: jsPDF 默认的 Helvetica 字体不支持中文，直接画文字会乱码。尝试过嵌入字体文件（1.7MB 太大）、CDN 加载（不稳定），最终采用 HTML 渲染方案：用 HTML/CSS 构建报告（利用系统字体），html2canvas 转为 Canvas 图片嵌入 PDF。支持任意字体和复杂布局。

**Q: 开发环境和生产环境的 CORS 是怎么解决的？**
A: 开发环境通过 Vite 的 server.proxy 配置，将 `/api/deepseek` 代理到 `https://api.deepseek.com`，浏览器端携带 API Key。生产环境通过 Serverless Function 代理（Vercel 的 `api/chat.ts` 和 Cloudflare 的 `functions/api/chat.ts`），API Key 存储在服务端环境变量中，前端只请求 `/api/chat`，不暴露 Key。

**Q: 如何处理大数据量的文件？**
A: 三层优化：1) PapaParse/SheetJS 前端解析，避免服务端存储；2) Supabase 写入时控制批次大小；3) 数据加载使用分批策略（每批 1000 条 while 循环），绕过 Supabase 单次查询限制。列分类使用 500 行采样而非全量扫描。

**Q: 如何保证数据安全？**
A: 1) Supabase RLS 实现行级安全，用户只能访问自己的数据；2) 跨表关联 RLS 确保 data_rows 也受项目归属约束；3) 分享链接使用随机 Token + 过期时间；4) 分享页面只读，不暴露写入 API；5) 生产环境 API Key 存储在 Serverless Function 环境变量中，不暴露给前端。

**Q: 项目中遇到的最大技术挑战是什么？**
A: 两个挑战：1) Excel 复杂表头解析——真实 Excel 文件常有标题行、合并单元格、多行表头，实现了智能表头检测算法，自动识别标题行位置、检测子表头（短字符串启发式）、合并双行表头；2) PDF 中文导出——jsPDF 默认字体不支持中文，最终采用 HTML 渲染方案（html2canvas 转 Canvas 嵌入 PDF）解决。

**Q: 双平台部署是怎么做的？**
A: 同一套代码部署到 Vercel 和 Cloudflare Pages。区别在于 Serverless Function 的实现：Vercel 使用 `api/chat.ts`（基于 `@vercel/node`），Cloudflare 使用 `functions/api/chat.ts`（基于 Workers API）。两者都代理 DeepSeek API，将 API Key 存储在各自的环境变量中。Supabase 客户端内置 fallback 值，即使不配置环境变量也能工作。

---

## 十二、项目数据一览

| 指标 | 数据 |
|------|------|
| 源文件数 | ~25 个 TypeScript/TSX 文件 |
| 页面数 | 9 个（Login、Register、Dashboard、Projects、ProjectDetail、Analysis、Admin、Settings、ShareView） |
| 组件数 | 8 个通用组件 + 2 个图表组件 |
| 自定义 Hook | 5 个 |
| Zustand Store | 4 个 |
| API 封装 | 4 个模块 |
| 支持上传格式 | 4 种（CSV、TSV、Excel、JSON） |
| 图表类型 | 3 种（折线图、柱状图、饼图） |
| 部署平台 | 2 个（Vercel + Cloudflare Pages） |
| 开发线程数 | 8 个 |
