import { useState, useCallback } from 'react'
import { Upload, Button, Input, Table, Typography, Space, message, Tag, Select } from 'antd'
import { UploadOutlined, InboxOutlined, FileTextOutlined, FileExcelOutlined, CodeOutlined } from '@ant-design/icons'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { UploadFile, RcFile } from 'antd/es/upload'

const { Dragger } = Upload
const { Title, Text } = Typography

interface ParsedData {
  columns: string[]
  rows: Record<string, unknown>[]
  fileName: string
  fileType: string
}

interface SheetInfo {
  name: string
  rows: number
  cols: number
  raw: unknown[][]
}

interface DataUploaderProps {
  onUpload: (name: string, fileName: string, columns: string[], rows: Record<string, unknown>[]) => Promise<boolean>
  uploading?: boolean
}

const ACCEPT_TYPES = '.csv,.tsv,.xlsx,.xls,.json'

const getFileIcon = (name: string) => {
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return <FileExcelOutlined style={{ color: '#217346' }} />
  if (name.endsWith('.json')) return <CodeOutlined style={{ color: '#f59e0b' }} />
  return <FileTextOutlined style={{ color: '#3b82f6' }} />
}

const getFileTypeLabel = (name: string) => {
  if (name.endsWith('.xlsx')) return 'Excel'
  if (name.endsWith('.xls')) return 'Excel 97'
  if (name.endsWith('.json')) return 'JSON'
  if (name.endsWith('.tsv')) return 'TSV'
  return 'CSV'
}

/** Smart header detection: handles title rows and merged multi-row headers */
const parseSheetWithSmartHeaders = (rawRows: unknown[][]): { columns: string[]; rows: Record<string, unknown>[] } => {
  if (rawRows.length < 2) return { columns: [], rows: [] }

  // Find the header row: first row where most cells are non-empty strings
  let headerIdx = 0
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const nonEmpty = rawRows[i].filter((c) => c !== null && c !== undefined && c !== '').length
    if (nonEmpty >= rawRows[i].length * 0.4) {
      headerIdx = i
      break
    }
  }

  const headerRow = rawRows[headerIdx]
  const nextRow = rawRows[headerIdx + 1]

  // Check if next row is a sub-header (all non-empty cells are short strings like "分数", "班名")
  const isSubHeader = nextRow && nextRow.filter((c) => {
    const s = String(c || '').trim()
    return s.length > 0 && s.length <= 4
  }).length >= nextRow.filter((c) => c !== null && c !== undefined && c !== '').length * 0.8

  let columns: string[]
  let dataStartIdx: number

  if (isSubHeader) {
    // Merge two header rows: category + sub-category
    const merged: string[] = []
    let currentCategory = ''
    for (let i = 0; i < headerRow.length; i++) {
      const cat = String(headerRow[i] || '').trim()
      const sub = String(nextRow[i] || '').trim()
      if (cat) currentCategory = cat
      if (sub === '分数' || sub === '成绩') {
        merged.push(currentCategory)
      } else if (sub) {
        merged.push(currentCategory + '-' + sub)
      } else if (currentCategory) {
        merged.push(currentCategory)
      } else {
        merged.push('列' + (i + 1))
      }
    }
    columns = merged
    dataStartIdx = headerIdx + 2
  } else {
    columns = headerRow.map((c, i) => String(c || '').trim() || '列' + (i + 1))
    dataStartIdx = headerIdx + 1
  }

  // Deduplicate column names
  const seen = new Map<string, number>()
  columns = columns.map((col) => {
    const count = seen.get(col) || 0
    seen.set(col, count + 1)
    return count > 0 ? col + '_' + (count + 1) : col
  })

  // Build data rows
  const rows: Record<string, unknown>[] = []
  for (let i = dataStartIdx; i < rawRows.length; i++) {
    const row = rawRows[i]
    // Skip empty rows
    if (!row || row.every((c) => c === null || c === undefined || c === '')) continue
    const record: Record<string, unknown> = {}
    columns.forEach((col, j) => {
      record[col] = row[j] ?? ''
    })
    rows.push(record)
  }

  return { columns, rows }
}

const DataUploader = ({ onUpload, uploading }: DataUploaderProps) => {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [datasetName, setDatasetName] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // Multi-sheet state
  const [sheets, setSheets] = useState<SheetInfo[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [, setRawFile] = useState<File | null>(null)
  const [rawFileName, setRawFileName] = useState('')

  // Parse all sheets from Excel
  const loadExcelSheets = useCallback((file: RcFile) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetInfos: SheetInfo[] = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name]
          const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][]
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
          return {
            name,
            rows: range.e.r - range.s.r + 1,
            cols: range.e.c - range.s.c + 1,
            raw,
          }
        })

        setSheets(sheetInfos)
        setRawFile(file)
        setRawFileName(file.name)

        if (sheetInfos.length === 1) {
          // Single sheet: parse directly
          const { columns, rows } = parseSheetWithSmartHeaders(sheetInfos[0].raw)
          if (rows.length === 0) {
            message.error('Excel 文件没有数据')
            return
          }
          setParsedData({ columns, rows, fileName: file.name, fileType: 'excel' })
          setDatasetName(file.name.replace(/\.[^.]+$/, '') + '-' + sheetInfos[0].name)
          message.success(`解析成功，共 ${rows.length} 行，${columns.length} 列`)
        } else {
          // Multiple sheets: let user choose
          message.info(`检测到 ${sheetInfos.length} 个工作表，请选择要导入的表`)
        }
      } catch (err) {
        message.error('Excel 解析失败：' + (err as Error).message)
      }
    }
    reader.onerror = () => message.error('文件读取失败')
    reader.readAsArrayBuffer(file)
    return false
  }, [])

  // Parse selected sheet
  const handleSheetSelect = useCallback((sheetName: string) => {
    setSelectedSheet(sheetName)
    const sheet = sheets.find((s) => s.name === sheetName)
    if (!sheet) return

    const { columns, rows } = parseSheetWithSmartHeaders(sheet.raw)
    if (rows.length === 0) {
      message.error('该工作表没有数据')
      return
    }

    setParsedData({ columns, rows, fileName: rawFileName, fileType: 'excel' })
    setDatasetName(rawFileName.replace(/\.[^.]+$/, '') + '-' + sheetName)
    message.success(`"${sheetName}" 解析成功，共 ${rows.length} 行，${columns.length} 列`)
  }, [sheets, rawFileName])

  // Parse JSON files
  const parseJSON = useCallback((file: RcFile): Promise<ParsedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          let jsonData: Record<string, unknown>[]
          const text = e.target?.result as string
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed)) {
            jsonData = parsed
          } else if (typeof parsed === 'object' && parsed !== null) {
            const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]))
            if (arrayKey) jsonData = parsed[arrayKey] as Record<string, unknown>[]
            else jsonData = [parsed as Record<string, unknown>]
          } else { reject(new Error('JSON 格式不正确')); return }
          if (jsonData.length === 0) { reject(new Error('JSON 没有数据')); return }
          const columns = [...new Set(jsonData.flatMap((row) => Object.keys(row)))]
          resolve({ columns, rows: jsonData, fileName: file.name, fileType: 'json' })
        } catch (err) { reject(new Error('JSON 解析失败：' + (err as Error).message)) }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }, [])

  // Parse CSV/TSV files
  const parseCSV = useCallback((file: RcFile): Promise<ParsedData> => {
    return new Promise((resolve, reject) => {
      const isTSV = file.name.endsWith('.tsv')
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        delimiter: isTSV ? '\t' : '',
        complete: (results) => {
          const criticalErrors = results.errors.filter(
            (err) => err.type !== 'FieldMismatch' && !err.message.includes('delimiting')
          )
          if (criticalErrors.length > 0) { reject(new Error('解析出错：' + criticalErrors[0].message)); return }
          const columns = results.meta.fields || []
          const rows = results.data as Record<string, unknown>[]
          if (columns.length === 0) { reject(new Error('未检测到列名')); return }
          if (rows.length === 0) { reject(new Error('没有数据行')); return }
          resolve({ columns, rows, fileName: file.name, fileType: isTSV ? 'tsv' : 'csv' })
        },
        error: (error) => reject(new Error('文件读取失败：' + error.message)),
      })
    })
  }, [])

  const handleBeforeUpload = useCallback((file: RcFile) => {
    const name = file.name.toLowerCase()

    // Reset multi-sheet state
    setSheets([])
    setSelectedSheet('')
    setRawFile(null)

    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      return loadExcelSheets(file)
    }

    let parsePromise: Promise<ParsedData>
    if (name.endsWith('.json')) parsePromise = parseJSON(file)
    else if (name.endsWith('.csv') || name.endsWith('.tsv')) parsePromise = parseCSV(file)
    else { message.error('不支持的文件格式'); return false }

    parsePromise
      .then((data) => {
        setParsedData(data)
        setDatasetName(file.name.replace(/\.[^.]+$/, ''))
        message.success(`${getFileTypeLabel(file.name)} 解析成功，共 ${data.rows.length} 行，${data.columns.length} 列`)
      })
      .catch((err) => message.error(err.message))
    return false
  }, [loadExcelSheets, parseJSON, parseCSV])

  const handleSubmit = async () => {
    if (!parsedData) { message.warning('请先上传文件'); return }
    if (!datasetName.trim()) { message.warning('请输入数据集名称'); return }
    const success = await onUpload(datasetName.trim(), parsedData.fileName, parsedData.columns, parsedData.rows)
    if (success) { setParsedData(null); setDatasetName(''); setFileList([]); setSheets([]); setSelectedSheet('') }
  }

  const handleReset = () => {
    setParsedData(null); setDatasetName(''); setFileList([])
    setSheets([]); setSelectedSheet(''); setRawFile(null)
  }

  const previewColumns = parsedData?.columns.map((col) => ({
    title: col, dataIndex: col, key: col, ellipsis: true, width: 150,
  })) || []

  const previewData = parsedData?.rows.slice(0, 5).map((row, index) => ({ ...row, _rowKey: index })) || []

  return (
    <div>
      <Title level={4}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        上传数据文件
      </Title>

      {!parsedData ? (
        <>
          <Dragger
            name="file" multiple={false} accept={ACCEPT_TYPES}
            beforeUpload={handleBeforeUpload}
            fileList={fileList}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            onRemove={() => { setSheets([]); setSelectedSheet(''); return true }}
            style={{ marginBottom: 24 }}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">点击或拖拽数据文件到此区域上传</p>
            <p className="ant-upload-hint">支持 CSV、TSV、Excel (.xlsx/.xls)、JSON 格式</p>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <Tag color="blue">CSV</Tag>
              <Tag color="green">Excel</Tag>
              <Tag color="orange">JSON</Tag>
              <Tag color="purple">TSV</Tag>
            </div>
          </Dragger>

          {/* Sheet selector for multi-sheet Excel */}
          {sheets.length > 1 && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
              padding: '16px 20px', marginBottom: 24,
            }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                <FileExcelOutlined style={{ marginRight: 6, color: '#217346' }} />
                检测到 {sheets.length} 个工作表，请选择要导入的表：
              </Text>
              <Select
                style={{ width: '100%' }}
                placeholder="选择工作表"
                value={selectedSheet || undefined}
                onChange={handleSheetSelect}
                options={sheets.map((s) => ({
                  value: s.name,
                  label: `${s.name}（${s.rows} 行 × ${s.cols} 列）`,
                }))}
              />
            </div>
          )}
        </>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
            <Text strong>数据集名称</Text>
            <Input value={datasetName} onChange={(e) => setDatasetName(e.target.value)}
              placeholder="请输入数据集名称" maxLength={100} showCount />
          </Space>

          <Space style={{ marginBottom: 16 }} wrap>
            {getFileIcon(parsedData.fileName)}
            <Text type="secondary">
              文件：{parsedData.fileName} | 类型：{getFileTypeLabel(parsedData.fileName)} | 行数：{parsedData.rows.length} | 列数：{parsedData.columns.length}
            </Text>
            {sheets.length > 1 && (
              <Tag color="green">工作表：{selectedSheet}</Tag>
            )}
            <Button size="small" onClick={handleReset}>重新选择</Button>
          </Space>

          <Title level={5}>数据预览（前 5 行）</Title>
          <Table columns={previewColumns} dataSource={previewData} rowKey="_rowKey"
            size="small" scroll={{ x: 'max-content' }} pagination={false} style={{ marginBottom: 16 }} />

          <Button type="primary" icon={<UploadOutlined />} onClick={handleSubmit}
            loading={uploading} size="large">
            确认上传到数据库
          </Button>
        </div>
      )}
    </div>
  )
}

export default DataUploader
