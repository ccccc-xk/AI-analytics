import { useState, useCallback, useMemo } from 'react'
import type { ChartType, Dataset, DataRow } from '@/types'

// --- Column metadata types ---
export type ColumnKind = 'numeric' | 'category' | 'id' | 'date'

export interface ColumnMeta {
  name: string
  kind: ColumnKind
  uniqueCount: number
  nonEmptyCount: number
  numericRatio: number   // 0-1
  label: string          // display label with type hint
}

export interface ChartDraft {
  title: string
  chartType: ChartType
  xColumn: string
  yColumn: string
}

const defaultDraft: ChartDraft = {
  title: '',
  chartType: 'bar',
  xColumn: '',
  yColumn: '',
}

// --- Helpers ---

const stripNonNumeric = (s: string) =>
  s.trim()
    .replace(/[,$\u00a5\u20ac\u00a3\u20b9%\s()]/g, '')
    .replace(/^[A-Za-z]+/, '')

const datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{4}/

const kindLabel: Record<ColumnKind, string> = {
  numeric: '数值',
  category: '分类',
  id: '编号',
  date: '日期',
}

function classifyColumns(dataRows: DataRow[], columns: string[]): ColumnMeta[] {
  if (!dataRows.length || !columns.length) return []
  const sampleSize = Math.min(dataRows.length, 500)
  const sample = dataRows.slice(0, sampleSize)

  return columns.map((col) => {
    const values = sample.map((row) => row.row_data[col])
    const nonEmpty = values.filter((v) => v !== null && v !== undefined && v !== '')
    const uniqueVals = new Set(nonEmpty.map(String))
    const uniqueCount = uniqueVals.size

    const numericCount = nonEmpty.filter((v) => {
      const str = stripNonNumeric(String(v))
      if (str === '') return false
      const n = Number(str)
      return !isNaN(n) && isFinite(n)
    }).length

    const dateCount = nonEmpty.filter((v) => datePattern.test(String(v).trim())).length

    const numericRatio = nonEmpty.length > 0 ? numericCount / nonEmpty.length : 0
    const dateRatio = nonEmpty.length > 0 ? dateCount / nonEmpty.length : 0

    let kind: ColumnKind
    if (numericRatio >= 0.3) {
      // Always treat as numeric if enough values parse as numbers
      kind = 'numeric'
    } else if (dateRatio >= 0.5) {
      kind = 'date'
    } else {
      const isIdLike = uniqueCount >= nonEmpty.length * 0.9 && uniqueCount >= 20
      kind = isIdLike ? 'id' : 'category'
    }

    return {
      name: col,
      kind,
      uniqueCount,
      nonEmptyCount: nonEmpty.length,
      numericRatio,
      label: `${col} [${kindLabel[kind]} · ${uniqueCount}项]`,
    }
  })
}

export const useCharts = (dataRows: DataRow[], dataset: Dataset | null) => {
  const [draft, setDraft] = useState<ChartDraft>(defaultDraft)
  const [savedCharts, setSavedCharts] = useState<ChartDraft[]>([])

  const columns = dataset?.column_names ?? []

  // Classify all columns with metadata
  const columnMetaList = useMemo(
    () => classifyColumns(dataRows, columns),
    [dataRows, columns]
  )

  const columnMeta = useMemo(() => {
    const map = new Map<string, ColumnMeta>()
    columnMetaList.forEach((m) => map.set(m.name, m))
    return map
  }, [columnMetaList])

  // Legacy exports
  const numericColumns = useMemo(
    () => columnMetaList.filter((m) => m.kind === 'numeric').map((m) => m.name),
    [columnMetaList]
  )
  const categoryColumns = useMemo(
    () => columnMetaList.filter((m) => m.kind === 'category').map((m) => m.name),
    [columnMetaList]
  )

  // --- X-axis / Label options: all columns, sorted by suitability ---
  const xAxisMeta = useMemo(() => {
    return [...columnMetaList].sort((a, b) => {
      if (draft.chartType === 'line') {
        if (a.kind === 'date' && b.kind !== 'date') return -1
        if (b.kind === 'date' && a.kind !== 'date') return 1
      }
      // Prefer category/date over numeric/id for X-axis
      const order: Record<ColumnKind, number> = { date: 0, category: 1, numeric: 2, id: 3 }
      const oa = order[a.kind] ?? 2
      const ob = order[b.kind] ?? 2
      if (oa !== ob) return oa - ob
      return a.uniqueCount - b.uniqueCount
    })
  }, [columnMetaList, draft.chartType])

  // --- Y-axis options: all columns, sorted by suitability (prefer numeric) ---
  const yAxisMeta = useMemo(() => {
    return [...columnMetaList].sort((a, b) => {
      const order: Record<ColumnKind, number> = { numeric: 0, date: 1, category: 2, id: 3 }
      const oa = order[a.kind] ?? 2
      const ob = order[b.kind] ?? 2
      if (oa !== ob) return oa - ob
      return b.numericRatio - a.numericRatio
    })
  }, [columnMetaList])

  // --- Chart data extraction ---
  const chartData = useMemo(() => {
    if (!draft.xColumn || !draft.yColumn || !dataRows.length) {
      return { xData: [], yData: [] }
    }

    if (draft.chartType === 'pie') {
      const groups = new Map<string, number>()
      dataRows.forEach((row) => {
        const key = String(row.row_data[draft.xColumn] ?? '未知')
        const rawVal = row.row_data[draft.yColumn]
        if (rawVal === null || rawVal === undefined || rawVal === '') {
          groups.set(key, (groups.get(key) || 0))
          return
        }
        const str = stripNonNumeric(String(rawVal))
        const val = Number(str)
        if (!isNaN(val) && isFinite(val)) {
          groups.set(key, (groups.get(key) || 0) + val)
        } else {
          groups.set(key, (groups.get(key) || 0) + 1)
        }
      })

      const sorted = [...groups.entries()]
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
      if (sorted.length === 0) return { xData: [], yData: [] }
      const top = sorted.slice(0, 10)
      if (sorted.length > 10) {
        const otherSum = sorted.slice(10).reduce((s, e) => s + e[1], 0)
        if (otherSum > 0) top.push(['其他', otherSum])
      }
      return {
        xData: top.map(([k]) => k),
        yData: top.map(([, v]) => v),
      }
    }

    // Line / Bar
    const xData: (string | number)[] = []
    const yData: (string | number)[] = []
    dataRows.forEach((row) => {
      const x = row.row_data[draft.xColumn]
      const y = row.row_data[draft.yColumn]
      if (x === undefined || x === null || y === undefined || y === null) return
      const str = stripNonNumeric(String(y))
      const num = Number(str)
      if (!isNaN(num) && isFinite(num)) {
        xData.push(String(x))
        yData.push(num)
      }
    })
    return { xData, yData }
  }, [draft, dataRows])

  const updateDraft = useCallback((patch: Partial<ChartDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetDraft = useCallback(() => {
    setDraft(defaultDraft)
  }, [])

  const saveChart = useCallback(() => {
    if (!draft.title || !draft.xColumn || !draft.yColumn) return false
    setSavedCharts((prev) => [...prev, { ...draft }])
    setDraft(defaultDraft)
    return true
  }, [draft])

  const removeChart = useCallback((index: number) => {
    setSavedCharts((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const isValid = draft.xColumn !== '' && draft.yColumn !== ''

  // Warning: pie chart with too many categories
  const pieOvercrowded = useMemo(() => {
    if (draft.chartType !== 'pie' || !draft.xColumn) return false
    const meta = columnMeta.get(draft.xColumn)
    return meta ? meta.uniqueCount > 20 : false
  }, [draft.chartType, draft.xColumn, columnMeta])

  return {
    draft,
    savedCharts,
    columns,
    numericColumns,
    categoryColumns,
    columnMeta,
    xAxisMeta,
    yAxisMeta,
    chartData,
    isValid,
    pieOvercrowded,
    updateDraft,
    resetDraft,
    saveChart,
    removeChart,
  }
}
