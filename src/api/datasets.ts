import { supabase } from '@/utils/supabase'
import type { Dataset, DataRow, ApiResponse } from '@/types'

export const datasetsApi = {
  // 获取项目的所有数据集
  async getDatasets(projectId: string): Promise<ApiResponse<Dataset[]>> {
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  // 创建数据集
  async createDataset(
    projectId: string,
    name: string,
    fileName: string,
    columns: string[],
    rows: Record<string, unknown>[]
  ): Promise<ApiResponse<Dataset>> {
    // 1. 创建数据集记录
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        project_id: projectId,
        name,
        file_name: fileName,
        row_count: rows.length,
        column_names: columns,
      })
      .select()
      .single()

    if (datasetError) return { data: null, error: datasetError.message }

    // 2. 分批插入数据行（Supabase 单次请求有 payload 大小限制）
    const BATCH_SIZE = 500
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE).map((row, index) => ({
        dataset_id: dataset.id,
        row_data: row,
        row_index: i + index,
      }))

      const { error: rowsError } = await supabase
        .from('data_rows')
        .insert(batch)

      if (rowsError) return { data: null, error: rowsError.message }
    }

    return { data: dataset, error: null }
  },

  // 获取数据集的数据行
  async getDataRows(datasetId: string, limit = 100, offset = 0): Promise<ApiResponse<DataRow[]>> {
    const { data, error } = await supabase
      .from('data_rows')
      .select('*')
      .eq('dataset_id', datasetId)
      .order('row_index', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  // 删除数据集
  async deleteDataset(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase
      .from('datasets')
      .delete()
      .eq('id', id)

    if (error) return { data: null, error: error.message }
    return { data: null, error: null }
  },
}
