import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Button, Descriptions, Spin, Empty, message, Space, Tag, Popconfirm, Card } from 'antd'
import {
  ArrowLeftOutlined, BarChartOutlined, UploadOutlined, DatabaseOutlined,
  ShareAltOutlined, CopyOutlined, DeleteOutlined, LinkOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { projectsApi } from '@/api/projects'
import { sharesApi, type Share } from '@/api/shares'
import type { Project } from '@/types'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [shares, setShares] = useState<Share[]>([])
  const [shareLoading, setShareLoading] = useState(false)

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return
      setLoading(true)
      const { data, error } = await projectsApi.getProject(id)
      if (error || !data) {
        setProject(null)
      } else {
        setProject(data)
      }
      setLoading(false)
    }
    loadProject()
  }, [id])

  useEffect(() => {
    const loadShares = async () => {
      if (!id) return
      const { data } = await sharesApi.getShares(id)
      if (data) setShares(data)
    }
    loadShares()
  }, [id])

  const handleCreateShare = async () => {
    if (!id) return
    setShareLoading(true)
    const { data, error } = await sharesApi.createShare(id)
    if (error) {
      message.error('创建分享失败：' + error)
    } else if (data) {
      setShares((prev) => [data, ...prev])
      message.success('分享链接已创建')
    }
    setShareLoading(false)
  }

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`
    navigator.clipboard.writeText(url).then(() => {
      message.success('链接已复制到剪贴板')
    })
  }

  const handleDeleteShare = async (shareId: string) => {
    const { error } = await sharesApi.deleteShare(shareId)
    if (error) {
      message.error('删除失败：' + error)
    } else {
      setShares((prev) => prev.filter((s) => s.id !== shareId))
      message.success('分享已删除')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Empty description="项目不存在或已被删除">
          <Button type="primary" onClick={() => navigate('/dashboard')}>返回仪表盘</Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Project header banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: 14,
          padding: '28px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(30,27,75,0.2)',
        }}
      >
        <div style={{
          position: 'absolute', top: -30, right: -10, width: 140, height: 140,
          borderRadius: '50%', background: 'rgba(99,102,241,0.15)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, right: 100, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(168,85,247,0.1)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <a
              onClick={() => navigate('/dashboard')}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}
            >
              仪表盘
            </a>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500 }}>
              {project.name}
            </span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 700 }}>
                {project.name}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, display: 'block', marginTop: 4 }}>
                {project.description || '暂无描述'}
              </Text>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              返回
            </Button>
          </div>
        </div>
      </div>

      {/* Project info card */}
      <Card
        style={{ marginBottom: 20, borderRadius: 12 }}
        title={
          <span style={{ fontWeight: 600 }}>
            <InfoCircleOutlined style={{ marginRight: 6, color: '#6366f1' }} />
            项目信息
          </span>
        }
      >
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2 }}
          size="small"
        >
          <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(project.created_at).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {dayjs(project.updated_at).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="项目描述">
            {project.description || '暂无描述'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Action buttons */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => navigate(`/projects/${id}/analysis`)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            上传数据
          </Button>
          <Button
            icon={<DatabaseOutlined />}
            onClick={() => navigate(`/projects/${id}/analysis`)}
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            数据集管理
          </Button>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => navigate(`/projects/${id}/analysis`)}
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            数据分析
          </Button>
          <Button
            icon={<ShareAltOutlined />}
            onClick={handleCreateShare}
            loading={shareLoading}
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            生成分享链接
          </Button>
        </div>
      </Card>

      {/* Share links */}
      {shares.length > 0 && (
        <Card
          title={
            <span style={{ fontWeight: 600 }}>
              <LinkOutlined style={{ marginRight: 6, color: '#10b981' }} />
              分享链接
            </span>
          }
          style={{ borderRadius: 12 }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            {shares.map((share) => {
              const url = `${window.location.origin}/share/${share.token}`
              const expired = share.expires_at && new Date(share.expires_at) < new Date()
              return (
                <div
                  key={share.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: expired ? '#fef2f2' : '#f0fdf4',
                    borderRadius: 10,
                    border: `1px solid ${expired ? '#fecaca' : '#bbf7d0'}`,
                  }}
                >
                  <Space>
                    <Tag color={expired ? 'error' : 'success'} style={{ fontWeight: 600, fontSize: 11 }}>
                      {expired ? '已过期' : '有效'}
                    </Tag>
                    <Typography.Text
                      copyable={{ text: url }}
                      ellipsis
                      style={{ maxWidth: 380, fontSize: 13 }}
                    >
                      {url}
                    </Typography.Text>
                  </Space>
                  <Space size={8}>
                    <Button
                      icon={<CopyOutlined />}
                      size="small"
                      onClick={() => handleCopyLink(share.token)}
                      disabled={!!expired}
                      style={{ borderRadius: 6 }}
                    >
                      复制
                    </Button>
                    <Popconfirm
                      title="确定删除此分享？"
                      onConfirm={() => handleDeleteShare(share.id)}
                      okText="删除"
                      cancelText="取消"
                    >
                      <Button icon={<DeleteOutlined />} size="small" danger style={{ borderRadius: 6 }} />
                    </Popconfirm>
                  </Space>
                </div>
              )
            })}
          </Space>
        </Card>
      )}
    </div>
  )
}

export default ProjectDetail
