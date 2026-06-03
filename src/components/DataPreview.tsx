import { useState, useMemo } from 'react'
import { Table, Typography, Spin, Empty, Button, Space, Input, message } from 'antd'
import { ReloadOutlined, ArrowLeftOutlined, FilePdfOutlined, SearchOutlined } from '@ant-design/icons'
import type { Dataset, DataRow } from '@/types'
import { exportDataReport } from '@/utils/pdfExport'

const { Title, Text } = Typography

interface DataPreviewProps {
  dataset: Dataset
  dataRows: DataRow[]
  loading: boolean
  projectName?: string
  onBack: () => void
  onRefresh: () => void
}

const DataPreview = ({ dataset, dataRows, loading, projectName, onBack, onRefresh }: DataPreviewProps) => {

  const handleExportPdf = async () => {
    try {
      message.loading({ content: '正在生成 PDF...', key: 'pdf' })
      await exportDataReport(projectName || 'AI 数据分析平台', dataset, dataRows)
      message.success({ content: 'PDF 导出成功', key: 'pdf' })
    } catch {
      message.error({ content: 'PDF 导出失败', key: 'pdf' })
    }
  }
  const [searchText, setSearchText] = useState('')

  // 搜索过滤
  const filteredRows = useMemo(() => {
    if (!searchText.trim()) return dataRows
    const keyword = searchText.trim().toLowerCase()
    return dataRows.filter((row) =>
      dataset.column_names.some((col) => {
        const val = row.row_data?.[col]
        return val !== null && val !== undefined && String(val).toLowerCase().includes(keyword)
      })
    )
  }, [dataRows, searchText, dataset.column_names])

  // 表格列定义（基于数据集的列名，动态列宽）
  const columns = dataset.column_names.map((col) => {
    const lower = col.toLowerCase()
    // 订单ID类列：固定较宽，左对齐
    const isIdCol = lower.includes('id') || lower.includes('编号') || lower.includes('订单')
    // 日期类列：固定宽度
    const isDateCol = lower.includes('date') || lower.includes('日期') || lower.includes('时间')
    // 数值类列：较窄
    const isNumeric = dataRows.length > 0 && (() => {
      const val = dataRows[0]?.row_data?.[col]
      if (val === null || val === undefined) return false
      return !isNaN(Number(String(val).replace(/,/g, '')))
    })()

    let width: number
    if (isIdCol) width = 180
    else if (isDateCol) width = 140
    else if (isNumeric) width = 120
    else width = Math.max(120, Math.min(250, col.length * 16 + 40))

    return {
      title: col,
      dataIndex: ['row_data', col],
      key: col,
      ellipsis: true,
      width,
      sorter: isNumeric
        ? (a: DataRow, b: DataRow) => {
            const av = Number(String(a.row_data?.[col] ?? 0).replace(/,/g, ''))
            const bv = Number(String(b.row_data?.[col] ?? 0).replace(/,/g, ''))
            return av - bv
          }
        : undefined,
    }
  })

  // 表格数据
  const dataSource = filteredRows.map((row) => ({
    ...row,
    key: row.id,
  }))

  return (
    <div>
      {/* 头部信息 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回列表
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {dataset.name}
          </Title>
        </Space>
        <Space>
          <Button icon={<FilePdfOutlined />} onClick={handleExportPdf}>
            导出 PDF
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>
            刷新数据
          </Button>
        </Space>
      </div>

      {/* 搜索栏 */}
      <Input
        placeholder="搜索任意列的内容..."
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
      />

      {/* 数据集信息 */}
      <Space style={{ marginBottom: 16 }}>
        <Text type="secondary">文件名：{dataset.file_name}</Text>
        <Text type="secondary">|</Text>
        <Text type="secondary">总行数：{dataset.row_count}</Text>
        <Text type="secondary">|</Text>
        <Text type="secondary">列数：{dataset.column_names.length}</Text>
      </Space>

      {/* 数据表格 */}
      <Spin spinning={loading}>
        {dataRows.length > 0 ? (
          <Table
            columns={columns}
            dataSource={dataSource}
            size="small"
            scroll={{ x: 'max-content', y: 500 }}
            pagination={{
              defaultPageSize: 50,
              showSizeChanger: true,
              pageSizeOptions: ['50', '100', '200'],
              showTotal: (total) => '共 ' + total + ' 条数据',
            }}
          />
        ) : (
          <Empty description="暂无数据" />
        )}
      </Spin>
    </div>
  )
}

export default DataPreview
