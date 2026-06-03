import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Button, Row, Col, Spin, Input } from 'antd'
import {
  PlusOutlined,
  RocketOutlined,
  SearchOutlined,
  ProjectOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { useProjects } from '@/hooks/useProjects'
import ProjectCard from '@/components/ProjectCard'
import ProjectModal from '@/components/ProjectModal'
import type { Project } from '@/types'

const { Title, Text } = Typography

const ProjectsPage = () => {
  const navigate = useNavigate()
  const { projects, loading, fetchProjects, createProject, editProject, deleteProject } = useProjects()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleCreate = () => { setEditingProject(null); setModalOpen(true) }
  const handleEdit = (project: Project) => { setEditingProject(project); setModalOpen(true) }
  const handleDelete = async (id: string) => { await deleteProject(id) }

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

  const handleCardClick = (id: string) => navigate(`/projects/${id}`)

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 50%, #06b6d4 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(59,130,246,0.25)',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -20, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              <ProjectOutlined style={{ marginRight: 10 }} />
              项目管理
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
              共 {projects.length} 个项目 · 管理和组织您的数据分析项目
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            style={{
              background: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            新建项目
          </Button>
        </div>
      </div>

      {/* Search + stats bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <Input
          placeholder="搜索项目名称或描述..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ borderRadius: 8, maxWidth: 360, flex: 1 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppstoreOutlined style={{ color: '#94a3b8' }} />
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>
            {filtered.length} 个项目
          </Text>
        </div>
      </div>

      <Spin spinning={loading}>
        {filtered.length === 0 && !loading ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 0',
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <RocketOutlined style={{ fontSize: 48, color: '#c7d2fe', marginBottom: 16 }} />
            <div style={{ color: '#94a3b8', marginBottom: 20, fontSize: 15 }}>
              {search ? '没有找到匹配的项目' : '还没有项目，创建第一个开始分析'}
            </div>
            {!search && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
                新建项目
              </Button>
            )}
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filtered.map((project, index) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
                <div style={{ animation: `fadeInUp 0.3s ease-out ${index * 50}ms both` }}>
                  <ProjectCard
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClick={handleCardClick}
                  />
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

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

export default ProjectsPage
