# AI 数据分析平台 - 面试准备指南

## 一、项目概述
**项目定位**：基于 AI 的数据分析平台，支持多格式数据上传、智能可视化分析、AI 对话洞察、数据分享与 PDF 导出。
**核心亮点**：
- 完整的前后端全栈项目（7 个开发线程，从零到部署）
- 集成 AI 能力（DeepSeek API 流式对话分析）
- 智能列分类系统（自动识别数值/分类/编号/日期列）
- 多格式数据上传（CSV/TSV/Excel/JSON，支持多工作表选择）
- 现代化 UI 设计（渐变横幅、动画卡片、企业级质感）
- 团队协作（Token 分享 + 公开看板 + PDF 报告导出）

---

## 二、技术栈及选型理由

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| **React** | 19 | 最新版本，性能优化，社区生态成熟 |
| **TypeScript** | - | 类型安全，减少运行时错误，提升代码可维护性 |
| **Vite** | 8 | 极速开发服务器，快速构建 |
| **Ant Design** | 6 | 企业级 UI 组件库，开箱即用 |
| **Supabase** | - | 开源 Firebase 替代方案，提供 Auth、数据库、存储一站式服务 |
| **Zustand** | 5 | 轻量级状态管理，API 简洁，学习成本低 |
| **ECharts** | 6 | 功能强大的图表库，支持丰富图表类型和交互 |
| **echarts-for-react** | 3 | ECharts 的 React 封装，声明式配置 |
| **PapaParse** | 5 | 前端 CSV 解析，支持流式和大文件 |
| **SheetJS (xlsx)** | - | Excel 文件解析，支持 .xlsx/.xls 格式和多工作表 |
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
│   ├── datasets.ts         # 数据集接口（分批加载）
│   ├── shares.ts           # 分享链接接口
│   └── mimo.ts             # DeepSeek AI API（流式调用，文件名沿用旧名）
├── components/             # 可复用组件
│   ├── ProtectedRoute.tsx  # 路由守卫
│   ├── ProjectCard.tsx     # 项目卡片
│   ├── ProjectModal.tsx    # 项目创建/编辑弹窗
│   ├── CsvUploader.tsx     # 多格式数据上传组件（CSV/Excel/JSON/TSV）
│   ├── DatasetList.tsx     # 数据集列表卡片
│   ├── DataPreview.tsx     # 数据预览表格（动态列宽 + PDF 导出）
│   ├── ChatPanel.tsx       # AI 对话面板（流式输出）
│   └── charts/
│       ├── ChartBuilder.tsx  # 图表配置 UI（智能轴选择 + 类型标签）
│       └── ChartRenderer.tsx # ECharts 渲染器（折线/柱状/饼图 + ErrorBoundary）
├── hooks/                  # 自定义 Hooks（逻辑复用）
│   ├── useAuth.ts          # 认证逻辑
│   ├── useProjects.ts      # 项目管理逻辑
│   ├── useDatasets.ts      # 数据集操作（分批加载全部数据）
│   ├── useCharts.ts        # 图表数据转换（智能列分类 + 轴选择）
│   └── useChat.ts          # AI 对话逻辑（流式 + 中断）
├── layouts/
│   └── AppLayout.tsx       # 侧边栏 + 顶部栏 + Outlet（分组导航）
├── pages/
│   ├── Login.tsx           # 登录页
│   ├── Register.tsx        # 注册页
│   ├── Dashboard.tsx       # 仪表盘（实时统计 + 最近项目 + 快捷操作）
│   ├── ProjectsPage.tsx    # 项目管理主页
│   ├── ProjectDetail.tsx   # 项目详情（分享链接管理）
│   ├── ProjectAnalysis.tsx # 数据分析主页（表格/图表/AI 三标签）
│   ├── ShareView.tsx       # 公开分享看板（无需登录）
│   ├── Admin.tsx           # 数据概览（全平台统计 + 分享管理 + 数据集浏览）
│   └── SettingsPage.tsx    # 系统设置（个人信息 + 头像 + 修改密码）
├── stores/                 # Zustand 状态管理
│   ├── authStore.ts        # 认证状态（含 user_metadata）
│   ├── projectStore.ts     # 项目状态
│   ├── datasetStore.ts     # 数据集状态
│   └── chatStore.ts        # 聊天状态（流式更新 + 中断控制）
├── types/
│   └── index.ts            # TypeScript 类型定义
└── utils/
    ├── supabase.ts         # Supabase 客户端初始化
    └── pdfExport.ts        # PDF 导出（HTML 渲染方案）
```

**架构设计原则**：
1. **三层分离**：API 层 → Store 层 → Hook 层，各司其职
2. **组件化开发**：可复用组件独立封装，Props 驱动
3. **类型安全**：TypeScript 全面覆盖，零 `any` 类型
4. **状态管理集中化**：Zustand store 按功能模块拆分

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
- **JSONB 存储**：data_rows 用 JSONB 存储每行数据，支持动态列，无需为每个 CSV 创建不同表
- **RLS 策略**：通过 projects → user_id 链实现数据隔离，即使 API key 泄露也无法越权
- **级联删除**：删除项目时自动清理 datasets、data_rows、shares
- **Token 分享**：shares 表通过随机 token 实现无需登录的只读访问

---

## 五、核心功能模块详解

### 模块 1：用户认证系统
**文件**：`authStore.ts` + `useAuth.ts` + `Login.tsx` + `Register.tsx` + `ProtectedRoute.tsx`

**认证流程**：
1. 用户输入邮箱密码 → `supabase.auth.signInWithPassword()`
2. Supabase 返回 JWT Token → 存储在 localStorage
3. `onAuthStateChange` 监听器自动更新 Zustand store
4. `ProtectedRoute` 检查 user 状态，未登录则重定向到 /login

**用户资料管理**（SettingsPage）：
- 头像上传：前端 `FileReader` + `Canvas` 压缩至 200px → Base64 存入 `user_metadata.avatar_url`
- 显示名称：存入 `user_metadata.display_name`
- 修改密码：`supabase.auth.updateUser({ password })`

**面试话术**：
「认证系统采用 Supabase Auth 实现，通过 Zustand 集中管理认证状态，使用自定义 Hook 封装登录/注册逻辑。实现了 session 持久化，用户刷新页面无需重新登录。路由守卫通过检查 store 中的 user 状态实现权限控制。用户资料（头像、显示名称）存储在 Supabase 的 user_metadata 中，头像通过 Canvas 压缩为 Base64 避免额外的文件存储服务。」

---

### 模块 2：项目管理
**文件**：`projects.ts` + `projectStore.ts` + `useProjects.ts` + `Dashboard.tsx` + `ProjectsPage.tsx` + `ProjectDetail.tsx` + `ProjectCard.tsx` + `ProjectModal.tsx`

**Dashboard 设计**：
- 顶部渐变欢迎横幅（紫蓝色调），显示用户名
- 三个统计卡片：项目总数、数据集数量、数据总量（实时从数据库聚合）
- 最近项目列表：按创建时间倒序取 4 个，带 hover 动画
- 右侧快捷操作和平台能力说明

**CRUD 流程**：
1. 用户点击"新建项目" → 打开 ProjectModal 弹窗
2. 填写名称和描述 → 表单校验通过后提交
3. 调用 `projectsApi.createProject()` → Supabase INSERT
4. 成功后 `addProject()` 更新 Zustand store → UI 自动刷新
5. 删除时 Popconfirm 二次确认 → DELETE + `removeProject()`

**面试话术**：
「项目管理采用三层架构：API 层封装 Supabase 查询，Zustand Store 管理前端状态，自定义 Hook 将 API 调用、状态更新、用户反馈整合在一起。Dashboard 通过异步遍历所有项目聚合数据集统计，实现了实时的数据概览。创建和编辑复用同一个 Modal 组件，通过 editingProject 是否为 null 来区分模式。」

---

### 模块 3：多格式数据上传与存储
**文件**：`CsvUploader.tsx`（实际命名为 DataUploader）+ `DatasetList.tsx` + `datasetStore.ts` + `useDatasets.ts` + `datasets.ts`

**支持格式**：CSV、TSV、Excel (.xlsx/.xls)、JSON

**上传流程**：
1. 用户拖拽或选择文件 → 根据扩展名选择解析器
2. PapaParse 解析 CSV/TSV，SheetJS 解析 Excel，原生 JSON.parse 解析 JSON
3. 解析成功后显示预览表格（前 5 行）
4. 用户输入数据集名称，点击确认上传
5. 前端批量 INSERT 到 Supabase（datasets + data_rows）
6. 上传成功后自动切换到数据集列表

**Excel 智能解析**（核心亮点）：
```typescript
// 智能表头检测：处理标题行和合并多行表头
const parseSheetWithSmartHeaders = (rawRows: unknown[][]) => {
  // 1. 找到表头行：第一个大部分单元格为非空字符串的行
  // 2. 检测子表头：下一行是否为短字符串（如"分数"、"班级"）
  // 3. 合并双行表头：类别 + 子类别
  // 4. 去重列名：重复列名自动加后缀
}
```

- 多工作表支持：检测到多个 Sheet 时弹出选择器，显示每个表的行列数
- 学生成绩表兼容：自动识别标题行 + 子表头结构，合并为"语文-分数"、"数学-班级"等列名

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
「数据上传支持 CSV、TSV、Excel、JSON 四种格式。Excel 解析使用 SheetJS 库，实现了智能表头检测：自动识别标题行、合并双行表头（如学生成绩表的科目+分数结构）、去重列名。多工作表 Excel 文件会弹出选择器让用户指定导入哪个 Sheet。数据加载使用分批策略，每次 1000 条循环获取，绕过 Supabase 单次查询限制。」

---

### 模块 4：智能数据可视化（ECharts）
**文件**：`ChartBuilder.tsx` + `ChartRenderer.tsx` + `useCharts.ts`

**智能列分类系统**（核心亮点）：

```typescript
type ColumnKind = 'numeric' | 'category' | 'id' | 'date'

// 采样 500 行，自动分类每列
function classifyColumns(dataRows, columns): ColumnMeta[] {
  return columns.map((col) => {
    const numericRatio = numericCount / nonEmpty.length  // 数值占比
    const dateRatio = dateCount / nonEmpty.length         // 日期占比
    const uniqueCount = uniqueVals.size                   // 唯一值数量

    // 分类逻辑：
    // numericRatio >= 0.5 → numeric（但如果唯一值≥90%且≥20则为 id）
    // dateRatio >= 0.5 → date
    // 其他 → category（但如果唯一值≥90%且≥20则为 id）
  })
}
```

**智能轴选择器**：
- X 轴选项：排除 ID 列和数值列；饼图只显示分类列且唯一值 ≤50；折线图日期列优先
- Y 轴选项：只显示数值列，按 numericRatio 降序排列
- 每个选项显示类型标签（分类/日期/数值/编号）和唯一值数量
- 饼图拥挤警告：X 列唯一值 >20 时显示 Alert 提示

**图表类型**：折线图（面积填充 + dataZoom）、柱状图（圆角 + dataZoom）、饼图（环形图 + Top 10 归类）

**ChartRenderer 设计**：
- React Class Component + Error Boundary（`getDerivedStateFromError` + `componentDidCatch`）
- Toolbox 工具栏：保存图片（2x 高清）、数据视图、还原、区域缩放
- 饼图：环形设计、自动 Top 10 + "其他"归类、垂直图例
- 折线/柱状图：自适应轴标签旋转、nameGap 防重叠、inside + slider 双 dataZoom

**面试话术**：
「数据可视化的核心创新是智能列分类系统。通过采样 500 行数据，计算每列的数值占比、日期占比、唯一值比例，自动将列分为数值型、分类型、日期型、编号型四类。X 轴下拉框自动排除不适合做横轴的列（编号列、数值列），饼图进一步限制只显示唯一值 ≤50 的分类列。Y 轴只展示数值列。下拉选项附带类型标签和唯一值数量，帮助用户做出正确选择。ChartRenderer 使用 Class Component 实现 Error Boundary，图表渲染出错时显示友好的错误提示而不是白屏。」

---

### 模块 5：AI 对话分析（DeepSeek API）
**文件**：`mimo.ts` + `chatStore.ts` + `useChat.ts` + `ChatPanel.tsx`

**架构设计**：
1. **API 层**（`mimo.ts`）：
   - 流式调用 DeepSeek API（OpenAI 兼容格式）
   - SSE（Server-Sent Events）逐 token 接收
   - 数据上下文构建（列名、类型、样本数据）
   - 开发环境走 Vite 代理 `/api/deepseek` → `api.deepseek.com`（绕过 CORS）

2. **Store 层**（`chatStore.ts`）：
   - 消息列表 + 流式更新 + AbortController 中断控制
   - `updateLastMessage` 支持函数式更新（追加 token）

3. **Hook 层**（`useChat.ts`）：
   - 构建 system prompt + 数据上下文 + 历史消息（最近 5 条，节省 token）
   - 流式回调：onToken（逐字显示）、onDone（完成）、onError（错误处理）

4. **UI 层**（`ChatPanel.tsx`）：
   - 消息气泡（用户蓝色 / AI 灰色）
   - 推荐问题标签
   - 流式光标动画（`▊` 闪烁）
   - 停止生成按钮

**数据上下文构建**：
```typescript
function buildDataContext(datasetName, columns, rowCount, sampleRows) {
  // 构建列信息（类型检测：数值/文本）
  // 构建前 3 行样本数据（截断长值节省 token）
  // 返回格式化的文本摘要
}
```

**面试话术**：
「AI 对话分析采用流式架构，通过 SSE 协议逐 token 接收 DeepSeek API 响应，实现打字机效果。系统会自动构建数据上下文（列名、类型、统计信息、样本数据）发送给 AI，使 AI 能够理解数据结构并给出针对性分析。Store 层使用 Zustand 管理消息状态，updateLastMessage 支持函数式更新实现流式追加。支持中断生成、清空对话等交互。」

**面试要点**：
- **为什么用流式而不是一次性返回？** 流式可以即时显示部分结果，用户体验更好，减少等待焦虑
- **如何构建 AI 上下文？** 提取列名、数据类型、前 3 行样本，加上 system prompt 定义 AI 角色
- **如何处理 API 错误？** AbortController 支持中断，错误时显示友好提示，不阻塞 UI
- **开发环境 CORS 如何解决？** Vite 开发服务器配置代理规则，`/api/deepseek` → `https://api.deepseek.com`

---

### 模块 6：数据分享与 PDF 导出

**文件**：`shares.ts` + `ShareView.tsx` + `pdfExport.ts`

**分享机制**：
1. 用户在项目详情页点击"生成分享链接"
2. 后端生成随机 Token（UUID + 时间戳），设置 7 天过期
3. 分享链接格式：`/share/:token`
4. ShareView 页面通过 token 查询项目和数据集，渲染只读看板
5. 无需登录即可访问（公开路由）

**PDF 导出方案**（解决中文乱码）：
```
问题：jsPDF 默认 Helvetica 字体不支持中文 → 乱码
方案：HTML 渲染 + html2canvas + jsPDF

HTML（中文完美显示）→ Canvas（2x 高清）→ PNG → PDF 嵌入
优点：支持任意字体、复杂布局、表格、颜色
缺点：文字不可选中（图片格式）
```

**面试话术**：
「数据分享通过随机 Token 实现，支持过期时间控制，分享链接无需登录即可访问。PDF 导出采用 HTML 渲染方案，通过 html2canvas 将 HTML 报告转为图片嵌入 PDF，完美解决中文乱码问题。相比直接用 jsPDF 画文字，HTML 渲染方案支持任意字体和复杂布局。报告包含列统计信息（类型、最小值、最大值、平均值）和数据预览表格。」

---

### 模块 7：数据概览与系统设置

**数据概览**（Admin.tsx）：
- 渐变横幅（蓝紫色调）
- 四个统计卡片：项目数、数据集数、数据总量、分享链接数
- 分享管理表格：查看/删除过期链接
- 数据集概览表格：查看数据集内容（弹窗表格，加载前 200 行）

**系统设置**（SettingsPage.tsx）：
- 渐变横幅（青绿色调），显示用户头像和邮箱
- 个人信息卡片：邮箱、显示名称、注册时间、账号状态
- 账号安全卡片：修改密码、更换头像（自动压缩至 200px）
- 编辑资料弹窗：修改显示名称

---

## 六、关键技术点

### 1. 智能列分类算法
```typescript
// 采样 500 行，四维度分类
const classifyColumns = (dataRows, columns): ColumnMeta[] => {
  // numericRatio ≥ 0.5 → numeric
  // dateRatio ≥ 0.5 → date
  // uniqueCount ≥ 90% 且 ≥ 20 → id（高基数标识列）
  // 其他 → category
}
```

**面试要点**：
- 为什么是 500 行采样？平衡准确性和性能，500 行足以反映列特征
- 为什么 ID 阈值是 90% + 20？订单号、手机号等标识列几乎每行唯一，但小数据集中 100% 唯一也可能是文本列
- 为什么饼图限制唯一值 ≤50？超过 50 个分类的饼图几乎不可读

### 2. Zustand 状态管理模式
```typescript
// Store 只负责状态，不负责 API 调用
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
- 为什么选 Zustand 而不是 Redux？简洁、轻量、无样板代码、支持函数式更新
- Store 如何组织？按功能模块拆分（auth/project/dataset/chat）
- 流式更新怎么实现？`updateLastMessage` 支持 `(prev) => prev + token` 函数式更新

### 3. Supabase RLS（行级安全）
```sql
-- 分开写每条策略，比 FOR ALL 更细粒度
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- 跨表关联的 RLS
CREATE POLICY "Access via project" ON data_rows FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM datasets
    JOIN projects ON datasets.project_id = projects.id
    WHERE datasets.id = data_rows.dataset_id AND projects.user_id = auth.uid()
  )
);
```

**面试要点**：
- RLS 是 PostgreSQL 行级安全特性，每条 SQL 自动附加 WHERE 条件
- 为什么分开写策略？可针对不同操作设置不同规则（如只读分享）
- 跨表关联 RLS：data_rows → datasets → projects → user_id

### 4. 流式 AI 对话架构
```
用户输入 → 构建上下文（system + 数据摘要 + 历史）→ DeepSeek API (SSE)
    → onToken: updateLastMessage(prev => prev + token)  → 逐字显示
    → onDone:  setLastMessageStreaming(false)            → 完成
    → onError: 显示错误提示                               → 异常处理
```

### 5. Excel 智能表头检测
```typescript
// 处理复杂 Excel 表结构（如学生成绩表）
const parseSheetWithSmartHeaders = (rawRows) => {
  // 1. 扫描前 5 行，找第一个大部分非空的行作为表头
  // 2. 检测下一行是否为子表头（短字符串如"分数"、"班级"）
  // 3. 合并双行表头："语文" + "分数" → "语文-分数"
  // 4. 去重列名：重复名自动加 _2, _3 后缀
}
```

### 6. PDF 中文导出方案
```
问题：jsPDF 默认字体不支持中文 → 乱码
方案：HTML + html2canvas + jsPDF

HTML（浏览器字体引擎渲染中文）→ Canvas（2x 高清）→ PNG → PDF 嵌入
优点：支持任意字体、复杂布局、表格样式
缺点：文字不可选中（图片格式，对数据报告场景足够）
```

---

## 七、项目难点与解决方案

| 难点 | 解决方案 |
|------|----------|
| CSV 大文件加载 | 分批加载（每批 1000 条），循环获取全部数据 |
| Excel 多表头解析 | 智能表头检测：扫描前 5 行找表头，检测子表头，合并双行表头 |
| 饼图不显示数据 | 改进数值解析（支持货币符号），非数值自动按计数聚合 |
| 图表轴选择错误 | 智能列分类系统：自动识别数值/分类/日期/编号，过滤不适合的列 |
| 图表渲染白屏 | Error Boundary（Class Component），捕获 ECharts 渲染异常 |
| PDF 中文乱码 | HTML 渲染 + html2canvas，替代 jsPDF 直接画文字 |
| 图表工具栏失效 | `notMerge={true}` 配合完整 toolbox 配置 |
| AI 流式输出 | SSE 协议 + Zustand 函数式更新 + AbortController 中断 |
| 分享安全性 | 随机 Token + 过期时间 + RLS 公开读取策略 |
| CORS 跨域 | Vite 开发代理 `/api/deepseek` → `api.deepseek.com` |
| 头像存储 | Canvas 压缩至 200px → Base64 → user_metadata（无需额外存储服务） |

---

## 八、性能优化点
1. **分批数据加载**：Supabase 单次 1000 条限制，循环获取避免超时
2. **列分类采样**：采样 500 行而非全量检测，平衡准确性和性能
3. **流式 AI 响应**：SSE 逐 token 返回，即时渲染，减少等待
4. **Zustand 按需订阅**：避免不必要的组件重渲染
5. **html2canvas 2x 缩放**：PDF 导出使用 2 倍分辨率，保证清晰度
6. **Canvas 头像压缩**：上传前压缩至 200px，减少 Base64 体积

---

## 九、可扩展方向

1. **更多图表类型**：散点图、热力图、地图、桑基图
2. **团队协作**：多用户权限管理、实时协作编辑
3. **数据管道**：定时任务、数据自动更新、Webhook 触发
4. **AI 增强**：多模型支持、自定义分析模板、自动异常检测
5. **图表持久化**：将图表配置保存到数据库，跨设备同步
6. **数据源连接**：数据库直连、API 数据源、实时数据流

---

## 十、常见面试问题

**Q: 为什么选择 Supabase 而不是自己搭后端？**
A: Supabase 提供开箱即用的 Auth、数据库、存储服务，减少 80% 后端开发成本。RLS 策略在数据库层强制执行安全，比应用层权限更可靠。同时它是开源的，可以自托管，不被厂商锁定。

**Q: 你的项目架构是怎么设计的？**
A: 采用三层架构：API 层封装 Supabase 查询，Zustand Store 管理前端状态，自定义 Hook 串联两者并处理业务逻辑。每层职责单一，方便测试和替换。组件层通过 Props 接收数据，保持纯展示。

**Q: RLS 策略是怎么工作的？为什么不用应用层权限？**
A: RLS 是 PostgreSQL 的行级安全特性，每条 SQL 操作自动附加 WHERE 条件过滤。相比应用层权限，RLS 在数据库层强制执行，即使 API key 泄露或前端代码被绕过，也无法访问其他用户的数据。这是纵深防御的思想。

**Q: 智能列分类是怎么实现的？**
A: 通过采样前 500 行数据，对每列计算三个指标：数值占比（可解析为数字的比例）、日期占比（匹配日期格式的比例）、唯一值比例。根据这三个指标将列分为四类：数值型（数值占比 ≥50%）、日期型（日期占比 ≥50%）、编号型（唯一值极高 ≥90%）、分类型（其他）。分类结果用于智能过滤轴选择器，避免用户选到不适合的列。

**Q: AI 流式对话是怎么实现的？**
A: 通过 SSE（Server-Sent Events）协议实现。前端发送请求后保持连接打开，后端逐 token 返回数据。前端使用 ReadableStream 读取数据流，每收到一个 token 就通过 Zustand 的函数式更新追加到消息末尾，实现打字机效果。支持 AbortController 中断生成。

**Q: PDF 导出为什么用 HTML 渲染而不是直接用 jsPDF？**
A: jsPDF 默认的 Helvetica 字体不支持中文，直接画文字会乱码。尝试过嵌入字体文件（1.7MB 太大）、CDN 加载（不稳定），最终采用 HTML 渲染方案：用 HTML/CSS 构建报告（利用系统字体），html2canvas 转为 Canvas 图片嵌入 PDF。这个方案既解决了中文问题，又支持了复杂布局。

**Q: 如何处理大数据量的 CSV 文件？**
A: 三层优化：1) PapaParse 前端解析，支持流式模式避免内存溢出；2) 数据库写入分批 INSERT；3) 数据加载使用分批策略（每批 1000 条循环获取），绕过 Supabase 单次查询限制。

**Q: 如何保证数据安全？**
A: 1) Supabase RLS 实现行级安全，用户只能访问自己的数据；2) 分享链接使用随机 Token + 过期时间；3) 分享页面只读，不暴露写入 API；4) 敏感操作需要 JWT 认证。

**Q: 项目中遇到的最大技术挑战是什么？**
A: 两个挑战：1) PDF 中文导出——最初用 jsPDF 直接画文字，发现默认字体不支持中文，最终采用 HTML 渲染方案解决；2) Excel 复杂表头解析——真实 Excel 文件常有标题行、合并单元格、多行表头，实现了智能表头检测算法，自动识别标题行位置、检测子表头、合并双行表头。
