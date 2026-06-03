import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Dataset, DataRow } from '@/types'

// 创建报告 HTML（浏览器渲染，中文完美显示）
function createReportHTML(
  projectName: string,
  dataset: Dataset,
  dataRows: DataRow[],
): string {
  const cols = dataset.column_names
  const previewRows = dataRows.slice(0, 100)

  // 统计信息
  const statsHTML = cols.map((col) => {
    const values = dataRows.map((r) => r.row_data?.[col]).filter((v) => v !== null && v !== undefined && v !== '')
    const numericValues = values
      .map((v) => Number(String(v).replace(/,/g, '')))
      .filter((n) => !isNaN(n) && isFinite(n))

    if (numericValues.length > values.length * 0.6) {
      const sum = numericValues.reduce((a, b) => a + b, 0)
      const avg = sum / numericValues.length
      const min = Math.min(...numericValues)
      const max = Math.max(...numericValues)
      return `<tr><td>${col}</td><td>数值型</td><td>${min.toFixed(2)}</td><td>${max.toFixed(2)}</td><td>${avg.toFixed(2)}</td><td>${numericValues.length}</td></tr>`
    } else {
      const unique = new Set(values).size
      return `<tr><td>${col}</td><td>文本型</td><td colspan="3">—</td><td>${values.length} / ${unique} 唯一</td></tr>`
    }
  }).join('')

  // 数据表格
  const tableHeaderHTML = cols.map((col) => `<th>${col}</th>`).join('')
  const tableBodyHTML = previewRows.map((row) => {
    const cells = cols.map((col) => {
      const val = String(row.row_data?.[col] ?? '')
      const display = val.length > 30 ? val.substring(0, 27) + '...' : val
      return `<td>${display}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Microsoft YaHei", "SimHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
    color: #333;
    background: #fff;
    padding: 40px;
    width: 900px;
  }
  h1 { font-size: 24px; margin-bottom: 8px; color: #1a1a1a; }
  h2 { font-size: 18px; margin: 24px 0 12px; color: #1677ff; border-bottom: 2px solid #1677ff; padding-bottom: 6px; }
  h3 { font-size: 14px; margin: 16px 0 8px; color: #555; }
  .meta { color: #888; font-size: 13px; margin-bottom: 16px; }
  .meta span { margin-right: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
  th, td { border: 1px solid #e8e8e8; padding: 6px 10px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; white-space: nowrap; }
  tr:nth-child(even) { background: #fafafa; }
  td { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e8e8e8; color: #aaa; font-size: 11px; text-align: center; }
</style>
</head>
<body>
  <h1>${projectName}</h1>
  <div class="meta">
    <span>数据集：${dataset.name}</span>
    <span>文件：${dataset.file_name}</span>
    <span>总行数：${dataset.row_count}</span>
    <span>列数：${cols.length}</span>
  </div>

  <h2>列统计信息</h2>
  <table>
    <thead><tr><th>列名</th><th>类型</th><th>最小值</th><th>最大值</th><th>平均值</th><th>统计</th></tr></thead>
    <tbody>${statsHTML}</tbody>
  </table>

  <h2>数据预览（前 ${previewRows.length} 行）</h2>
  <div style="overflow-x: auto;">
    <table>
      <thead><tr>${tableHeaderHTML}</tr></thead>
      <tbody>${tableBodyHTML}</tbody>
    </table>
  </div>

  <div class="footer">
    AI 数据分析平台 · 导出时间：${new Date().toLocaleString('zh-CN')}
  </div>
</body>
</html>`
}

// 导出数据报告为 PDF（使用 HTML 渲染，完美支持中文）
export async function exportDataReport(
  projectName: string,
  dataset: Dataset,
  dataRows: DataRow[],
): Promise<void> {
  // 1. 创建隐藏的 HTML 容器
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.innerHTML = createReportHTML(projectName, dataset, dataRows)
  document.body.appendChild(container)

  try {
    // 2. 用 html2canvas 将 HTML 渲染为 canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // 3. 将 canvas 拆分为多页 PDF
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 20 // 左右各留 10mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const imgData = canvas.toDataURL('image/png')

    // 如果内容超过一页，分页处理
    let heightLeft = imgHeight
    let position = 10 // 顶部留 10mm

    doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= (pageHeight - 20)

    while (heightLeft > 0) {
      doc.addPage()
      position = -(pageHeight - 20) + 10 + position
      doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pageHeight - 20)
    }

    // 4. 下载
    doc.save(`${projectName}_${dataset.name}_报告.pdf`)
  } finally {
    // 5. 清理 DOM
    document.body.removeChild(container)
  }
}
