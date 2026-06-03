import { useEffect, useState } from 'react'
import { Typography, Table, Card, Row, Col, Tag, Button, message, Popconfirm, Modal } from 'antd'
import {
  ProjectOutlined,
  DatabaseOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useProjects } from '@/hooks/useProjects'
import { sharesApi, type Share } from '@/api/shares'
import { datasetsApi } from '@/api/datasets'
import type { Dataset, DataRow } from '@/types'

const { Title, Text } = Typography

const StatCard = ({
  icon,
  label,
  value,
  gradient,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  gradient: string
  delay: number
}) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '22px 24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', alignItems: 'center', gap: 16, width: '100%',
    animation: `fadeInUp 0.4s ease-out ${delay}ms both`,
    transition: 'box-shadow 0.25s, transform 0.25s',
  }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
  >
    <div style={{
      width: 48, height: 48, borderRadius: 12, background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      {icon}
    </div>
    <div>
      <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', lineHeight: 1.2, marginTop: 2 }}>{value}</div>
    </div>
  </div>
)

const Admin = () => {
  const { projects, fetchProjects } = useProjects()
  const [allShares, setAllShares] = useState<(Share & { projectName?: string })[]>([])
  const [allDatasets, setAllDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerDataset, setViewerDataset] = useState<Dataset | null>(null)
  const [viewerRows, setViewerRows] = useState<DataRow[]>([])
  const [viewerLoading, setViewerLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    await fetchProjects()
    const shares: (Share & { projectName?: string })[] = []
    for (const proj of projects) {
      const { data } = await sharesApi.getShares(proj.id)
      if (data) data.forEach((s) => shares.push({ ...s, projectName: proj.name }))
    }
    setAllShares(shares)
    const datasets: Dataset[] = []
    for (const proj of projects) {
      const { data } = await datasetsApi.getDatasets(proj.id)
      if (data) datasets.push(...data)
    }
    setAllDatasets(datasets)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleDeleteShare = async (id: string) => {
    const { error } = await sharesApi.deleteShare(id)
    if (error) message.error('删除失败：' + error)
    else { message.success('分享已删除'); loadData() }
  }

  const handleViewDataset = async (dataset: Dataset) => {
    setViewerDataset(dataset); setViewerOpen(true); setViewerLoading(true)
    const { data, error } = await datasetsApi.getDataRows(dataset.id, 200, 0)
    if (error) message.error('加载数据失败：' + error)
    else setViewerRows(data || [])
    setViewerLoading(false)
  }

  const totalRows = allDatasets.reduce((sum, d) => sum + d.row_count, 0)

  const viewerColumns = viewerDataset?.column_names.map((col) => ({
    title: col, key: col, dataIndex: 'row_data', ellipsis: true, width: 150,
    render: (row_data: Record<string, unknown>) => {
      const val = row_data[col]
      if (val === null || val === undefined) return <span style={{ color: '#ccc' }}>-</span>
      return String(val)
    },
  })) || []

  const viewerData = viewerRows.map((row) => ({ ...row, _key: row.id || row.row_index }))

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(14,165,233,0.25)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              <BarChartOutlined style={{ marginRight: 10 }} />
              数据概览
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
              全平台数据统计与管理
            </Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
            style={{
              background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)',
              color: '#fff', fontWeight: 600,
            }}
          >
            刷新
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<ProjectOutlined />} label="项目数" value={projects.length}
            gradient="linear-gradient(135deg, #3b82f6, #6366f1)" delay={0} />
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ marginTop: 12 }}>
          <StatCard icon={<DatabaseOutlined />} label="数据集" value={allDatasets.length}
            gradient="linear-gradient(135deg, #10b981, #06b6d4)" delay={80} />
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ marginTop: 12 }}>
          <StatCard icon={<FileTextOutlined />} label="数据总量" value={totalRows.toLocaleString()}
            gradient="linear-gradient(135deg, #f59e0b, #ef4444)" delay={160} />
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ marginTop: 12 }}>
          <StatCard icon={<ShareAltOutlined />} label="分享链接" value={allShares.length}
            gradient="linear-gradient(135deg, #8b5cf6, #ec4899)" delay={240} />
        </Col>
      </Row>

      {/* Share management */}
      <Card style={{
        borderRadius: 14, marginBottom: 24,
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        animation: 'fadeInUp 0.4s ease-out 280ms both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShareAltOutlined style={{ color: '#8b5cf6', fontSize: 16 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, fontWeight: 700 }}>分享管理</Title>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>管理所有项目的分享链接</Text>
          </div>
        </div>
        <Table
          dataSource={allShares} rowKey="id" loading={loading}
          columns={[
            { title: '项目', dataIndex: 'projectName', key: 'project' },
            { title: 'Token', dataIndex: 'token', key: 'token', ellipsis: true },
            { title: '创建时间', dataIndex: 'created_at', key: 'created', render: (v: string) => new Date(v).toLocaleString() },
            { title: '过期时间', dataIndex: 'expires_at', key: 'expires',
              render: (v: string | null) => {
                if (!v) return <Tag>永久</Tag>
                const expired = new Date(v) < new Date()
                return expired ? <Tag color="red">已过期</Tag> : <Tag color="green">{new Date(v).toLocaleDateString()}</Tag>
              },
            },
            { title: '操作', key: 'action',
              render: (_: unknown, record: Share) => (
                <Popconfirm title="确定删除此分享？" onConfirm={() => handleDeleteShare(record.id)}>
                  <Button icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>
              ),
            },
          ]}
          pagination={false}
        />
      </Card>

      {/* Dataset overview */}
      <Card style={{
        borderRadius: 14,
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        animation: 'fadeInUp 0.4s ease-out 360ms both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DatabaseOutlined style={{ color: '#10b981', fontSize: 16 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, fontWeight: 700 }}>数据集概览</Title>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>浏览所有数据集并查看内容</Text>
          </div>
        </div>
        <Table
          dataSource={allDatasets} rowKey="id" loading={loading}
          columns={[
            { title: '名称', dataIndex: 'name', key: 'name' },
            { title: '文件', dataIndex: 'file_name', key: 'file' },
            { title: '行数', dataIndex: 'row_count', key: 'rows', sorter: (a: Dataset, b: Dataset) => a.row_count - b.row_count },
            { title: '列数', key: 'cols', render: (_: unknown, r: Dataset) => r.column_names.length },
            { title: '创建时间', dataIndex: 'created_at', key: 'created', render: (v: string) => new Date(v).toLocaleString() },
            { title: '操作', key: 'action',
              render: (_: unknown, record: Dataset) => (
                <Button type="link" icon={<EyeOutlined />} size="small" onClick={() => handleViewDataset(record)}>查看</Button>
              ),
            },
          ]}
          pagination={{ defaultPageSize: 10, showTotal: (t) => `共 ${t} 个数据集` }}
        />
      </Card>

      {/* Dataset viewer modal */}
      <Modal
        title={
          <span>
            <DatabaseOutlined style={{ marginRight: 8 }} />
            {viewerDataset?.name || '数据集'}
            <Tag style={{ marginLeft: 8 }} color="blue">{viewerRows.length} 行</Tag>
          </span>
        }
        open={viewerOpen}
        onCancel={() => { setViewerOpen(false); setViewerDataset(null); setViewerRows([]) }}
        footer={null}
        width={900}
      >
        <Table
          columns={viewerColumns} dataSource={viewerData} rowKey="_key"
          loading={viewerLoading} size="small"
          scroll={{ x: 'max-content', y: 400 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `共 ${t} 行` }}
        />
      </Modal>
    </div>
  )
}

export default Admin
