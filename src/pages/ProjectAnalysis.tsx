import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Breadcrumb, Spin, Empty, Button, Tabs } from 'antd'
import { UploadOutlined, DatabaseOutlined, ArrowLeftOutlined, BarChartOutlined, RobotOutlined } from '@ant-design/icons'
import { useDatasets } from '@/hooks/useDatasets'
import { projectsApi } from '@/api/projects'
import DataUploader from '@/components/CsvUploader'
import DatasetList from '@/components/DatasetList'
import DataPreview from '@/components/DataPreview'
import ChartBuilder from '@/components/charts/ChartBuilder'
import ChatPanel from '@/components/ChatPanel'
import type { Project, Dataset } from '@/types'

const { Title } = Typography

const ProjectAnalysis = () => {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('datasets')
  const [viewingDataset, setViewingDataset] = useState<Dataset | null>(null)
  const [previewTab, setPreviewTab] = useState('table')

  const {
    datasets,
    dataRows,
    loading,
    uploading,
    fetchDatasets,
    uploadDataset,
    fetchRows,
    deleteDataset,
  } = useDatasets(projectId || '')

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return
      setProjectLoading(true)
      const { data } = await projectsApi.getProject(projectId)
      setProject(data)
      setProjectLoading(false)
    }
    loadProject()
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchDatasets()
    }
  }, [projectId, fetchDatasets])

  const handleViewDataset = async (dataset: Dataset) => {
    setViewingDataset(dataset)
    setPreviewTab('table')
    await fetchRows(dataset.id)
  }

  const handleBackToList = () => {
    setViewingDataset(null)
  }

  const handleUpload = async (name: string, fileName: string, columns: string[], rows: Record<string, unknown>[]) => {
    const success = await uploadDataset(name, fileName, columns, rows)
    if (success) {
      setActiveTab('datasets')
    }
    return success
  }

  if (projectLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!project) {
    return (
      <Empty description="项目不存在或已被删除">
        <Button onClick={() => navigate('/dashboard')}>返回仪表盘</Button>
      </Empty>
    )
  }

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/dashboard')}>仪表盘</a> },
          { title: <a onClick={() => navigate('/projects/' + projectId)}>{project.name}</a> },
          { title: '数据分析' },
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {project.name} - 数据分析
        </Title>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/projects/' + projectId)}
        >
          返回项目
        </Button>
      </div>

      {viewingDataset ? (
        <Tabs
          activeKey={previewTab}
          onChange={setPreviewTab}
          items={[
            {
              key: 'table',
              label: <span><DatabaseOutlined /> 数据表格</span>,
              children: (
                <DataPreview
                  dataset={viewingDataset}
                  dataRows={dataRows}
                  loading={loading}
                  projectName={project.name}
                  onBack={handleBackToList}
                  onRefresh={() => fetchRows(viewingDataset.id)}
                />
              ),
            },
            {
              key: 'chart',
              label: <span><BarChartOutlined /> 图表可视化</span>,
              children: <ChartBuilder dataset={viewingDataset} dataRows={dataRows} />,
            },
            {
              key: 'ai',
              label: <span><RobotOutlined /> AI 分析</span>,
              children: <ChatPanel dataset={viewingDataset} dataRows={dataRows} />,
            },
          ]}
        />
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'datasets',
              label: <span><DatabaseOutlined /> 数据集列表</span>,
              children: (
                <DatasetList
                  datasets={datasets}
                  loading={loading}
                  onView={handleViewDataset}
                  onDelete={deleteDataset}
                />
              ),
            },
            {
              key: 'upload',
              label: <span><UploadOutlined /> 上传数据</span>,
              children: (
                <DataUploader onUpload={handleUpload} uploading={uploading} />
              ),
            },
          ]}
        />
      )}
    </div>
  )
}

export default ProjectAnalysis
