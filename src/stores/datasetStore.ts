import { create } from 'zustand'
import type { Dataset, DataRow } from '@/types'

interface DatasetState {
  datasets: Dataset[]
  currentDataset: Dataset | null
  dataRows: DataRow[]
  loading: boolean
  uploading: boolean
  setDatasets: (datasets: Dataset[]) => void
  setCurrentDataset: (dataset: Dataset | null) => void
  setDataRows: (rows: DataRow[]) => void
  addDataset: (dataset: Dataset) => void
  removeDataset: (id: string) => void
  setLoading: (loading: boolean) => void
  setUploading: (uploading: boolean) => void
}

export const useDatasetStore = create<DatasetState>((set) => ({
  datasets: [],
  currentDataset: null,
  dataRows: [],
  loading: false,
  uploading: false,

  setDatasets: (datasets) => set({ datasets }),
  setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
  setDataRows: (rows) => set({ dataRows: rows }),
  
  addDataset: (dataset) => set((state) => ({
    datasets: [dataset, ...state.datasets],
  })),
  
  removeDataset: (id) => set((state) => ({
    datasets: state.datasets.filter((d) => d.id !== id),
  })),
  
  setLoading: (loading) => set({ loading }),
  setUploading: (uploading) => set({ uploading }),
}))
