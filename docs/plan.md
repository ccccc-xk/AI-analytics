# AI 数据可视化平台 — 多线程开发计划

## 线程总览与依赖关系

```
✅ Thread 1: 项目初始化与基础架构 [已完成]
    ↓
✅ Thread 2: 用户认证系统 [已完成]
    ↓
✅ Thread 3: 项目管理模块 [已完成]
    ↓
✅ Thread 4: 多格式数据上传与存储 [已完成]
    ↓
✅ Thread 5: 数据表格与图表可视化 [已完成]
    ↓
✅ Thread 6: AI 对话分析 [已完成]
    ↓
✅ Thread 7: 数据分享 + PDF 导出 [已完成]
    ↓
✅ Thread 8: UI 美化 + 双平台部署 [已完成]
```

---

## ✅ 线程 1：项目初始化与基础架构 [已完成]

- [x] 创建 Vite 8 + React 19 + TypeScript 6.0 项目
- [x] 安装所有依赖包
- [x] 配置 Vite 路径别名 @/
- [x] 创建目录结构
- [x] 配置环境变量
- [x] 初始化 Supabase 客户端
- [x] 配置 React Router v7 路由
- [x] 创建 Zustand store 结构
- [x] 创建 TypeScript 类型定义
- [x] 创建基础布局组件
- [x] 创建占位页面
- [x] 创建 ProtectedRoute 组件
- [x] 创建 API 封装层
- [x] 创建自定义 Hooks
- [x] 验证项目构建成功

---

## ✅ 线程 2：用户认证系统 [已完成]

- [x] 完善登录页面功能
- [x] 完善注册页面功能
- [x] 集成 Supabase Auth
- [x] 测试认证流程

---

## ✅ 线程 3：项目管理模块 [已完成]

- [x] 创建 projects 数据表
- [x] 配置 RLS 策略
- [x] 实现项目 CRUD
- [x] 完善仪表盘页面（实时统计 + 最近项目）
- [x] 实现项目创建/编辑弹窗复用

---

## ✅ 线程 4：多格式数据上传与存储 [已完成]

- [x] 创建 datasets + data_rows 数据表
- [x] 实现文件上传组件（CSV/TSV/Excel/JSON）
- [x] 集成 PapaParse（CSV/TSV 解析）
- [x] 集成 SheetJS（Excel 解析，智能表头检测）
- [x] Excel 多工作表选择器
- [x] 数据预览表格
- [x] 分批数据加载（Supabase 单次 1000 条限制）
- [x] 数据集管理（列表 + 删除）

---

## ✅ 线程 5：数据表格与图表可视化 [已完成]

- [x] 实现动态数据表格（搜索过滤 + 数值排序 + PDF 导出）
- [x] 封装 ECharts（echarts-for-react）
- [x] 实现折线图（面积填充 + dataZoom）
- [x] 实现柱状图（圆角 + dataZoom）
- [x] 实现饼图（环形图 + Top 10 归类）
- [x] 智能列分类系统（采样 500 行，四维度分类）
- [x] 智能轴选择器（全部列可选 + 适合度排序）
- [x] 图表工具栏（保存图片/数据视图/缩放/还原）
- [x] ErrorBoundary 保证渲染稳定性

---

## ✅ 线程 6：AI 对话分析 [已完成]

- [x] 封装 DeepSeek API（OpenAI 兼容格式）
- [x] 实现 SSE 流式输出
- [x] 实现聊天界面（消息气泡 + 推荐问题）
- [x] AbortController 中断控制
- [x] 数据上下文自动构建
- [x] 最近 5 条历史消息（节省 token）

---

## ✅ 线程 7：数据分享 + PDF 导出 [已完成]

- [x] 创建 shares 数据表 + RLS 策略
- [x] 实现分享链接生成（随机 Token + 过期时间）
- [x] 实现公开看板页面（ShareView，无需登录）
- [x] 实现 PDF 报告导出（HTML 渲染 + html2canvas，支持中文）
- [x] 实现数据概览管理页面（Admin）

---

## ✅ 线程 8：UI 美化 + 双平台部署 [已完成]

- [x] 四个页面渐变横幅（紫蓝/蓝紫/青绿各有特色）
- [x] 统计卡片动画（fadeInUp + hover 浮起）
- [x] 侧边栏分组导航（可折叠 + 品牌区域）
- [x] 系统设置（头像上传 + 修改密码 + 编辑资料）
- [x] Supabase 客户端 fallback 值（无环境变量也能工作）
- [x] Vercel 部署（vercel.json SPA 路由 + Serverless Function）
- [x] Cloudflare Pages 部署（Pages Function 代理 DeepSeek API）
- [x] 代码推送 GitHub + 自动部署
- [x] 项目 README.md 编写
- [x] 面试准备文档编写
