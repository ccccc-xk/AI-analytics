// 用户类型
export interface User {
  id: string
  email: string
  created_at: string
  user_metadata?: Record<string, unknown>
}

// 项目类型
export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

// 数据集类型
export interface Dataset {
  id: string
  project_id: string
  name: string
  file_name: string
  row_count: number
  column_names: string[]
  created_at: string
}

// 数据行类型
export interface DataRow {
  id: string
  dataset_id: string
  row_data: Record<string, unknown>
  row_index: number
}

// 图表类型
export type ChartType = 'line' | 'bar' | 'pie'

// 图表配置
export interface ChartConfig {
  id: string
  dataset_id: string
  chart_type: ChartType
  title: string
  x_column: string
  y_column: string
  config: Record<string, unknown>
  created_at: string
}

// 分享链接
export interface Share {
  id: string
  project_id: string
  token: string
  created_at: string
  expires_at: string | null
}

// API 响应
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
