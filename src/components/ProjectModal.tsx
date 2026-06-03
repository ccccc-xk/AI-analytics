import { useEffect } from 'react'
import { Modal, Form, Input } from 'antd'
import type { Project } from '@/types'

interface ProjectModalProps {
  open: boolean
  editingProject: Project | null
  onOk: (name: string, description?: string) => Promise<boolean>
  onCancel: () => void
  confirmLoading: boolean
}

const ProjectModal = ({
  open,
  editingProject,
  onOk,
  onCancel,
  confirmLoading,
}: ProjectModalProps) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (editingProject) {
        form.setFieldsValue({
          name: editingProject.name,
          description: editingProject.description,
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, editingProject, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const success = await onOk(values.name, values.description)
      if (success) {
        form.resetFields()
      }
    } catch {
      // 表单校验失败，不做处理
    }
  }

  return (
    <Modal
      title={editingProject ? '编辑项目' : '新建项目'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="项目名称"
          rules={[
            { required: true, message: '请输入项目名称' },
            { max: 50, message: '名称不超过 50 个字符' },
          ]}
        >
          <Input placeholder="例如：2024 销售数据分析" />
        </Form.Item>
        <Form.Item
          name="description"
          label="项目描述"
          rules={[{ max: 200, message: '描述不超过 200 个字符' }]}
        >
          <Input.TextArea
            placeholder="简要描述项目目标和数据来源（可选）"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ProjectModal
