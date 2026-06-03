import { useCallback } from 'react'
import { message } from 'antd'
import { useDatasetStore } from '@/stores/datasetStore'
import { datasetsApi } from '@/api/datasets'

export const useDatasets = (projectId: string) => {
  const {
    datasets,
    currentDataset,
    dataRows,
    loading,
    uploading,
    setDatasets,
    setCurrentDataset,
    setDataRows,
    addDataset,
    removeDataset,
    setLoading,
    setUploading,
  } = useDatasetStore()

  const fetchDatasets = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    const { data, error } = await datasetsApi.getDatasets(projectId)
    if (error) {
      message.error('加载数据集失败：' + error)
    } else if (data) {
      setDatasets(data)
    }
    setLoading(false)
  }, [projectId, setDatasets, setLoading])

  const uploadDataset = useCallback(
    async (name: string, fileName: string, columns: string[], rows: Record<string, unknown>[]) => {
      if (!projectId) return false
      setUploading(true)
      const { data, error } = await datasetsApi.createDataset(projectId, name, fileName, columns, rows)
      if (error) {
        message.error('上传失败：' + error)
        setUploading(false)
        return false
      }
      if (data) {
        addDataset(data)
        message.success('数据集"' + name + '"上传成功，共 ' + rows.length + ' 行数据')
        setUploading(false)
        return true
      }
      setUploading(false)
      return false
    },
    [projectId, addDataset, setUploading],
  )

  const fetchRows = useCallback(
    async (datasetId: string, limit = 10000) => {
      setLoading(true)
      // 分批加载全部数据（Supabase 单次最多 1000 条）
      const allRows: typeof dataRows = []
      const batchSize = 1000
      let offset = 0
      let hasMore = true

      while (hasMore) {
        const { data, error } = await datasetsApi.getDataRows(datasetId, batchSize, offset)
        if (error) {
          message.error('加载数据失败：' + error)
          hasMore = false
        } else if (data && data.length > 0) {
          allRows.push(...data)
          offset += data.length
          // 如果返回的数据少于 batchSize 或已达到 limit，停止
          if (data.length < batchSize || allRows.length >= limit) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      setDataRows(allRows)
      setLoading(false)
    },
    [setDataRows, setLoading],
  )

  const deleteDataset = useCallback(
    async (id: string) => {
      const { error } = await datasetsApi.deleteDataset(id)
      if (error) {
        message.error('删除失败：' + error)
        return false
      }
      removeDataset(id)
      message.success('数据集已删除')
      return true
    },
    [removeDataset],
  )

  return {
    datasets,
    currentDataset,
    dataRows,
    loading,
    uploading,
    fetchDatasets,
    uploadDataset,
    fetchRows,
    deleteDataset,
    setCurrentDataset,
  }
}
