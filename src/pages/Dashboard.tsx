import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Button, Row, Col, Spin } from 'antd'
import {
  PlusOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useProjects } from '@/hooks/useProjects'
import { useAuthStore } from '@/stores/authStore'
import { datasetsApi } from '@/api/datasets'
import ProjectModal from '@/components/ProjectModal'
import dayjs from 'dayjs'
import type { Project } from '@/types'

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
  value: number
  gradient: string
  delay: number
}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      width: '100%',
      animation: `fadeInUp 0.4s ease-out ${delay}ms both`,
      transition: 'box-shadow 0.25s, transform 0.25s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
      e.currentTarget.style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: '#fff',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {icon}
    </div>
    <div>
      <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', lineHeight: 1.2, marginTop: 2 }}>
        {value}
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, loading, fetchProjects, createProject, editProject } = useProjects()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [datasetCount, setDatasetCount] = useState(0)
  const [totalRows, setTotalRows] = useState(0)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Fetch real dataset stats
  useEffect(() => {
    const fetchStats = async () => {
      if (projects.length === 0) return
      let dsCount = 0
      let rowCount = 0
      for (const proj of projects) {
        const { data } = await datasetsApi.getDatasets(proj.id)
        if (data) {
          dsCount += data.length
          rowCount += data.reduce((s, d) => s + d.row_count, 0)
        }
      }
      setDatasetCount(dsCount)
      setTotalRows(rowCount)
    }
    fetchStats()
  }, [projects])

  const handleCreate = () => {
    setEditingProject(null)
    setModalOpen(true)
  }

  const handleSubmit = async (name: string, description?: string) => {
    setSubmitting(true)
    let success: boolean
    if (editingProject) {
      success = await editProject(editingProject.id, name, description)
    } else {
      success = await createProject(name, description)
    }
    setSubmitting(false)
    if (success) setModalOpen(false)
    return success
  }

  const userName = user?.email?.split('@')[0] || '用户'
  const recentProjects = [...projects].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 4)

  return (
    <div>
      {/* Welcome banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
        }}
      >
        <div style={{
          position: 'absolute',
          top: -40,
          right: -20,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -60,
          right: 80,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Title level={3} style={{ color: '#fff', marginBottom: 4, fontWeight: 700 }}>
            欢迎回来，{userName}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            智能数据分析平台为您助力数据洞察与业务决策
          </Text>
        </div>
      </div>

      {/* Stat cards - real data */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        <StatCard
          icon={<ProjectOutlined />}
          label="项目总数"
          value={projects.length}
          gradient="linear-gradient(135deg, #3b82f6, #6366f1)"
          delay={0}
        />
        <StatCard
          icon={<DatabaseOutlined />}
          label="数据集"
          value={datasetCount}
          gradient="linear-gradient(135deg, #10b981, #06b6d4)"
          delay={80}
        />
        <StatCard
          icon={<BarChartOutlined />}
          label="数据总量"
          value={totalRows}
          gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
          delay={160}
        />
      </div>

      <Row gutter={24}>
        {/* Recent projects */}
        <Col xs={24} lg={16}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 24,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            animation: 'fadeInUp 0.4s ease-out 200ms both',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                  <ClockCircleOutlined style={{ marginRight: 8, color: '#6366f1' }} />
                  最近项目
                </Title>
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>快速访问您最近创建的项目</Text>
              </div>
              <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/projects')}>
                查看全部
              </Button>
            </div>

            <Spin spinning={loading}>
              {recentProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <RocketOutlined style={{ fontSize: 36, color: '#c7d2fe', marginBottom: 12 }} />
                  <div style={{ color: '#94a3b8', marginBottom: 16 }}>还没有项目</div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    新建项目
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentProjects.map((project, index) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '14px 16px',
                        borderRadius: 10,
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        animation: `fadeInUp 0.3s ease-out ${250 + index * 60}ms both`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#c7d2fe'
                        e.currentTarget.style.background = '#f8faff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#f0f0f0'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <FolderOpenOutlined style={{ fontSize: 18, color: '#6366f1' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ display: 'block', fontSize: 14 }}>{project.name}</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                          {project.description || '暂无描述'} · {dayjs(project.created_at).format('MM-DD HH:mm')}
                        </Text>
                      </div>
                      <ArrowRightOutlined style={{ color: '#c7d2fe', fontSize: 12 }} />
                    </div>
                  ))}
                </div>
              )}
            </Spin>
          </div>
        </Col>

        {/* Quick actions */}
        <Col xs={24} lg={8}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 24,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            animation: 'fadeInUp 0.4s ease-out 280ms both',
            marginBottom: 24,
          }}>
            <Title level={4} style={{ margin: '0 0 20px', fontWeight: 700 }}>
              快捷操作
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                block
                onClick={handleCreate}
                style={{ height: 44, borderRadius: 10 }}
              >
                新建分析项目
              </Button>
              <Button
                icon={<ProjectOutlined />}
                size="large"
                block
                onClick={() => navigate('/projects')}
                style={{ height: 44, borderRadius: 10 }}
              >
                管理所有项目
              </Button>
            </div>
          </div>

          {/* Platform info */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 24,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            animation: 'fadeInUp 0.4s ease-out 360ms both',
          }}>
            <Title level={4} style={{ margin: '0 0 16px', fontWeight: 700 }}>
              平台能力
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <DatabaseOutlined />, text: '多格式数据上传（CSV/Excel/JSON）', color: '#3b82f6' },
                { icon: <BarChartOutlined />, text: '多种图表可视化', color: '#10b981' },
                { icon: <RocketOutlined />, text: 'AI 智能数据分析', color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${item.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    fontSize: 15,
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <Text style={{ fontSize: 13 }}>{item.text}</Text>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <ProjectModal
        open={modalOpen}
        editingProject={editingProject}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
      />
    </div>
  )
}

export default Dashboard
