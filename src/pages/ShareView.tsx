import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Typography, Spin, Empty, Card, Table, Row, Col, Statistic } from 'antd'
import { DatabaseOutlined, TableOutlined, FileTextOutlined } from '@ant-design/icons'
import { sharesApi } from '@/api/shares'
import { projectsApi } from '@/api/projects'
import { datasetsApi } from '@/api/datasets'
import type { Project, Dataset, DataRow } from '@/types'

const { Title, Text } = Typography

const ShareView = () => {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [dataRows, setDataRows] = useState<DataRow[]>([])

  useEffect(() => {
    const loadShare = async () => {
      if (!token) {
        setError('无效的分享链接')
        setLoading(false)
        return
      }

      // 验证 token
      const { data: share, error: shareError } = await sharesApi.getShareByToken(token)
      if (shareError || !share) {
        setError(shareError || '分享链接无效')
        setLoading(false)
        return
      }

      // 加载项目
      const { data: proj } = await projectsApi.getProject(share.project_id)
      if (!proj) {
        setError('项目不存在')
        setLoading(false)
        return
      }
      setProject(proj)

      // 加载数据集
      const { data: ds } = await datasetsApi.getDatasets(share.project_id)
      if (ds) setDatasets(ds)

      setLoading(false)
    }
    loadShare()
  }, [token])

  const handleViewDataset = async (dataset: Dataset) => {
    setSelectedDataset(dataset)
    const { data } = await datasetsApi.getDataRows(dataset.id, 1000)
    if (data) setDataRows(data)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (error) {
    return (
      <Empty
        description={error}
        style={{ padding: 80 }}
      />
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Title level={2}>{project?.name}</Title>
      <Text type="secondary">{project?.description || '数据看板'}</Text>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="数据集" value={datasets.length} prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总数据量"
              value={datasets.reduce((sum, d) => sum + d.row_count, 0)}
              prefix={<TableOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="列总数"
              value={datasets.reduce((sum, d) => sum + d.column_names.length, 0)}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 数据集列表 */}
      <Title level={4}>数据集</Title>
      <Row gutter={[16, 16]}>
        {datasets.map((ds) => (
          <Col key={ds.id} xs={24} sm={12} md={8}>
            <Card
              hoverable
              onClick={() => handleViewDataset(ds)}
              style={{
                border: selectedDataset?.id === ds.id ? '2px solid #1677ff' : undefined,
              }}
            >
              <Card.Meta
                title={ds.name}
                description={
                  <>
                    <div>{ds.file_name}</div>
                    <div>{ds.row_count} 行 · {ds.column_names.length} 列</div>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 数据预览 */}
      {selectedDataset && dataRows.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4}>{selectedDataset.name} - 数据预览</Title>
          <Table
            columns={selectedDataset.column_names.map((col) => ({
              title: col,
              dataIndex: ['row_data', col],
              key: col,
              ellipsis: true,
              width: 150,
            }))}
            dataSource={dataRows.map((r) => ({ ...r, key: r.id }))}
            size="small"
            scroll={{ x: 'max-content', y: 400 }}
            pagination={{ defaultPageSize: 50, showSizeChanger: true }}
          />
        </div>
      )}
    </div>
  )
}

export default ShareView
