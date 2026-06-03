const fs = require('fs');
const files = [
  'D:/我的文档/Codex/Codex/AI-analytics/src/layouts/AppLayout.tsx',
  'D:/我的文档/Codex/Codex/AI-analytics/src/utils/pdfExport.ts',
  'D:/我的文档/Codex/Codex/AI-analytics/src/components/DataPreview.tsx',
  'D:/我的文档/Codex/Codex/AI-analytics/src/pages/Login.tsx',
  'D:/我的文档/Codex/Codex/AI-analytics/index.html',
  'D:/我的文档/Codex/Codex/AI-analytics/README.md',
  'D:/我的文档/Codex/Codex/AI-analytics/docs/INTERVIEW_GUIDE.md',
  'D:/我的文档/Codex/Codex/AI-analytics/docs/plan.md',
  'D:/我的文档/Codex/Codex/AI-analytics/docs/RESUME_UPDATE.md',
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const before = content;
  content = content.replace(/AI 数据分析平台/g, 'AI 数据可视化平台');
  if (content !== before) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated:', f.split('/').pop());
  } else {
    console.log('No change:', f.split('/').pop());
  }
});
console.log('Done!');
