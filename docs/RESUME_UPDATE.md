# 陈雪奎 - 简历更新建议

> 以下为基于当前简历 + AI-analytics 项目的更新内容，标注了需要修改/新增的地方。你可以直接复制到 Word 或简历工具中。

---

## 基本信息（不变）

**陈雪奎**
邮箱：2257302877@qq.com
电话：17634383563
所在地：河南郑州
学历：本科（应届毕业生）

---

## 自我评价（建议修改）

**原版问题**：提到了 Claude Code、Codex、Cursor 等工具名，面试官可能不了解这些工具，而且过于强调工具而非能力。建议改为强调 AI 辅助开发的效率和工程能力。

**建议版本**：

软件工程本科应届，熟练使用 AI 辅助开发工具提升开发效率，具备扎实的前端工程能力与全栈项目落地经验。掌握 React + TypeScript 技术栈，熟悉 Supabase 云数据库与认证体系，能独立完成从需求分析、架构设计、编码实现到双平台部署的全流程。擅长大语言模型 API 集成与 Prompt 工程，具备良好的问题排查和项目协作能力。

---

## 专业技能（建议大幅修改）

**原版问题**：
1. 技能全部围绕 Vue 生态，但实际项目（3D 平台、AI-analytics）都用的是 React
2. 缺少 React、Ant Design、Zustand、Supabase 等实际使用的技术
3. 技能描述偏泛，缺少与项目对应的深度

**建议版本**：

**核心前端**：熟练掌握 HTML5/CSS3 响应式布局；精通 JavaScript（ES6+）核心概念；熟练使用 React 19 + TypeScript 6.0 开发应用，掌握 Hooks、函数式组件、状态管理。

**UI 与可视化**：熟练使用 Ant Design 6 组件库；掌握 ECharts 数据可视化（折线图/柱状图/饼图、工具栏、dataZoom）；能独立完成企业级 UI 设计与交互实现。

**状态管理与工程化**：掌握 Zustand 5 轻量级状态管理（函数式更新）；熟悉 Vite 8 构建工具与 TypeScript 类型系统；使用 ESLint + Prettier 规范代码；熟练掌握 Git 版本控制与分支管理。

**后端与数据库**：掌握 Supabase 云服务（Auth 认证 + PostgreSQL 数据库 + RLS 行级安全策略）；熟悉 RESTful API 设计与前后端联调；了解 Serverless Function（Vercel + Cloudflare Pages）。

**AI 集成**：掌握大语言模型 API 调用（DeepSeek API / OpenAI 兼容格式）；熟悉 SSE 流式输出协议与 AbortController 中断控制；能构建数据上下文实现 AI 对话分析。

**其他**：了解 Node.js、MySQL；熟悉 Chrome DevTools 调试与前端性能优化；具备良好的代码规范与技术文档编写习惯。

---

## 项目经历（新增 AI-analytics 项目，原版保留）

### AI 数据可视化平台（独立全栈开发） 2026/04 - 2026/06

https://ai-analytics-opal.vercel.app
https://ai-analytics-2d8.pages.dev

**项目概述**：基于 React 19 + TypeScript + Supabase + DeepSeek API 的企业级数据分析平台，支持多格式数据上传、智能可视化分析、AI 对话洞察、数据分享与 PDF 导出。

**核心工作**：

- 实现多格式数据上传（CSV/TSV/Excel/JSON），Excel 智能表头检测算法自动识别标题行与子表头，支持多工作表选择导入
- 设计智能列分类系统，采样 500 行数据计算数值占比、日期占比、唯一值比例，自动将列分为数值/分类/编号/日期四类，辅助图表轴选择
- 基于 ECharts 实现折线图、柱状图、饼图可视化，含工具栏（保存图片/数据视图/缩放/还原），使用 ErrorBoundary 保证渲染稳定性
- 集成 DeepSeek API 实现流式 AI 对话分析，SSE 协议逐 token 接收，AbortController 支持中断生成
- 实现 Token 分享机制（随机 Token + 过期时间 + RLS 公开读取策略），支持无需登录的只读看板
- 解决 PDF 中文导出问题，采用 HTML 渲染 + html2canvas 方案替代 jsPDF 直接画文字
- 搭建双平台部署架构：Vercel（海外）+ Cloudflare Pages（国内），Serverless Function 代理 DeepSeek API，API Key 不暴露给前端
- 完成 Supabase RLS 行级安全策略设计，通过跨表关联实现 data_rows → datasets → projects → user_id 的链式权限验证

**技术栈**：React 19 / TypeScript 6.0 / Vite 8 / Ant Design 6 / ECharts 5 / Supabase / Zustand 5 / DeepSeek API / PapaParse / SheetJS / jsPDF + html2canvas / React Router v7

---

### 健康饮食营养管理系统（毕业设计）（独立全栈开发） 2026/01 - 2026/04

基于 Spring Boot + Vue3 前后端分离架构，开发面向用户、营养师、管理员三类角色的健康管理平台，解决传统饮食记录效率低、缺乏专业指导的痛点。

- 独立完成需求分析、系统架构设计、用例图、流程图、数据库设计、前后端编码及测试全流程，实现饮食记录、营养自动计算、个性化方案、数据可视化、社区交流等 8 大核心模块
- 采用 RBAC 权限模型 + JWT 实现多角色身份认证与权限隔离，使用 BCrypt 加密敏感数据
- 基于 ECharts 实现健康数据趋势可视化，通过 Spring 事务管理保证饮食记录等更新的数据一致性
- 系统通过全量功能测试与性能测试，运行稳定，交互流畅，满足日常健康管理全场景需求

---

### 3D 数据可视化交互平台（独立全栈开发） 2026/04 - 2026/06

https://3d-visualization-platform.vercel.app

- 独立设计并实现 7 页面 3D 可视化平台，含数字孪生驾驶舱总集 - 零件架构
- 基于 InstancedMesh 实现万级 3D 散点/柱状/折线/饼图，支持 CSV 导出与 LOD 优化
- 搭建统一实时数据接入层，支持 Mock/REST/WebSocket/MQTT，失败自动降级
- 实现告警阈值检测、声音提示、历史回放与 ECharts ↔ 3D 设备双向联动
- 完成 GitHub 私有仓库 + Vercel 持续部署流水线，140+ 源文件，build 零错误，push 即自动上线

---

## 教育经历（不变）

**郑州西亚斯学院**　软件工程 · 本科　2022/09 - 2026/07
核心课程：Web 前端开发、Vue 框架技术、JavaScript、数据结构、数据库原理等

---

## 修改总结

| 项目 | 修改内容 |
|------|----------|
| 自我评价 | 去掉工具名，强调 AI 辅助开发效率和全栈能力 |
| 专业技能 | 从 Vue 全家桶改为 React + TypeScript 为主线，补充 Supabase/Zustand/ECharts/AI 集成/Serverless |
| AI-analytics 项目 | 新增完整项目描述，含 8 条核心技术点 |
| 原有项目 | 保留不变 |
| 格式 | 统一 Markdown 格式，方便复制到简历工具 |
