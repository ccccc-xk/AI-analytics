import { Card, Typography, Dropdown, Tag } from 'antd'
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Project } from '@/types'

const { Paragraph } = Typography

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  onClick: (id: string) => void
}

const ProjectCard = ({ project, onEdit, onDelete, onClick }: ProjectCardProps) => {
  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
    },
  ]

  const handleMenuClick = (info: { key: string }) => {
    if (info.key === 'edit') onEdit(project)
    if (info.key === 'delete') onDelete(project.id)
  }

  return (
    <Card
      hoverable
      onClick={() => onClick(project.id)}
      style={{
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
      }}
      actions={[
        <Dropdown
          key="more"
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={['click']}
        >
          <MoreOutlined
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 16 }}
          />
        </Dropdown>,
      ]}
    >
      {/* Color accent strip at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
          borderRadius: '12px 12px 0 0',
        }}
      />
      <Card.Meta
        avatar={
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderOpenOutlined style={{ fontSize: 20, color: '#6366f1' }} />
          </div>
        }
        title={
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {project.name}
          </span>
        }
        description={
          <>
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 10, minHeight: 44, color: '#64748b', fontSize: 13 }}
            >
              {project.description || '暂无描述'}
            </Paragraph>
            <Tag icon={<ClockCircleOutlined />} color="processing" style={{ fontSize: 12 }}>
              {dayjs(project.created_at).format('YYYY-MM-DD')}
            </Tag>
          </>
        }
      />
    </Card>
  )
}

export default ProjectCard
