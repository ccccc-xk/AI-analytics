import { useState, useEffect } from 'react'
import { Typography, Card, Avatar, Descriptions, Button, Tag, Modal, Form, Input, message, Upload } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  SafetyOutlined,
  EditOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CameraOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/utils/supabase'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 200
        let w = img.width
        let h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

const SettingsPage = () => {
  const { user, refreshUser } = useAuthStore()

  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordForm] = Form.useForm()

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileForm] = Form.useForm()

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)

  // Read from user_metadata whenever user changes
  useEffect(() => {
    if (user?.user_metadata) {
      const meta = user.user_metadata
      setDisplayName((meta.display_name as string) || user.email?.split('@')[0] || '用户')
      setAvatarUrl((meta.avatar_url as string) || '')
    } else if (user) {
      setDisplayName(user.email?.split('@')[0] || '用户')
    }
  }, [user])


  // Ensure we have a valid session before calling updateUser
  const ensureSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // Try to refresh
      const { data, error } = await supabase.auth.refreshSession()
      if (error || !data.session) {
        message.error('会话已过期，请退出后重新登录')
        return false
      }
    }
    return true
  }

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      setPasswordLoading(true)
      if (!(await ensureSession())) { setPasswordLoading(false); return }
      const { error } = await supabase.auth.updateUser({ password: values.newPassword })
      if (error) message.error(error.message.includes('session') ? '会话已过期，请退出后重新登录' : '密码修改失败：' + error.message)
      else { message.success('密码修改成功'); setPasswordModalOpen(false); passwordForm.resetFields() }
    } catch { /* validation */ }
    finally { setPasswordLoading(false) }
  }

  const handleEditProfile = async () => {
    try {
      const values = await profileForm.validateFields()
      setProfileLoading(true)
      if (!(await ensureSession())) { setProfileLoading(false); return }
      const { error } = await supabase.auth.updateUser({
        data: { display_name: values.displayName, avatar_url: avatarUrl },
      })
      if (error) {
        message.error(error.message.includes('session') ? '会话已过期，请退出后重新登录' : '资料更新失败：' + error.message)
      } else {
        await refreshUser()
        message.success('个人资料已更新')
        setProfileModalOpen(false)
      }
    } catch { /* validation */ }
    finally { setProfileLoading(false) }
  }

  const handleAvatarUpload = async (file: File) => {
    setAvatarLoading(true)
    if (!(await ensureSession())) { setAvatarLoading(false); return false }
    try {
      const base64 = await resizeImage(file)
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName, avatar_url: base64 },
      })
      if (error) {
        message.error(error.message.includes('session') ? '会话已过期，请退出后重新登录' : '头像更新失败：' + error.message)
      } else {
        await refreshUser()
        message.success('头像已更新')
      }
    } catch (err) {
      message.error('头像处理失败：' + (err as Error).message)
    } finally {
      setAvatarLoading(false)
    }
    return false
  }

  return (
    <div>
      {/* Header banner - compact, teal/slate */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(15,118,110,0.25)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <Avatar
                size={64}
                src={avatarUrl || undefined}
                icon={<UserOutlined />}
                style={{
                  background: avatarUrl ? 'transparent' : 'rgba(255,255,255,0.2)',
                  border: '3px solid rgba(255,255,255,0.3)',
                  fontSize: 26,
                }}
              />
              <Upload
                showUploadList={false}
                beforeUpload={(file) => handleAvatarUpload(file)}
                accept="image/*"
                disabled={avatarLoading}
              >
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <CameraOutlined style={{ fontSize: 13, color: '#0f766e' }} />
                </div>
              </Upload>
            </div>
            <div>
              <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
                <SettingOutlined style={{ marginRight: 10 }} />
                系统设置
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                {displayName} · {user?.email}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <Card style={{
        marginBottom: 24, borderRadius: 14,
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserOutlined style={{ color: '#0d9488', fontSize: 16 }} />
            </div>
            <Title level={5} style={{ margin: 0, fontWeight: 700 }}>个人信息</Title>
          </div>
          <Button icon={<EditOutlined />} onClick={() => { profileForm.setFieldsValue({ displayName }); setProfileModalOpen(true) }}>
            编辑资料
          </Button>
        </div>
        <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ fontWeight: 600, color: '#64748b' }} contentStyle={{ color: '#1e293b' }}>
          <Descriptions.Item label={<><MailOutlined style={{ marginRight: 6 }} />邮箱</>}>
            {user?.email || '未知'}
          </Descriptions.Item>
          <Descriptions.Item label={<><UserOutlined style={{ marginRight: 6 }} />显示名称</>}>
            {displayName}
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined style={{ marginRight: 6 }} />注册时间</>}>
            {user?.created_at ? dayjs(user.created_at).format('YYYY-MM-DD HH:mm') : '未知'}
          </Descriptions.Item>
          <Descriptions.Item label={<><SafetyOutlined style={{ marginRight: 6 }} />账号状态</>}>
            <Tag color="green" icon={<CheckCircleOutlined />}>正常</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Account actions card */}
      <Card style={{
        borderRadius: 14,
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LockOutlined style={{ color: '#0f766e', fontSize: 16 }} />
          </div>
          <Title level={5} style={{ margin: 0, fontWeight: 700 }}>账号安全</Title>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              icon: <LockOutlined style={{ color: '#6366f1', fontSize: 18 }} />,
              bg: '#eef2ff',
              title: '修改密码',
              desc: '定期更换密码以保护账号安全',
              action: <Button icon={<EditOutlined />} onClick={() => setPasswordModalOpen(true)}>修改</Button>,
            },
            {
              icon: <CameraOutlined style={{ color: '#0d9488', fontSize: 18 }} />,
              bg: '#f0fdfa',
              title: '更换头像',
              desc: avatarLoading ? '正在上传...' : '上传一张新的个人头像（自动压缩至 200px）',
              action: (
                <Upload showUploadList={false} beforeUpload={(file) => handleAvatarUpload(file)} accept="image/*" disabled={avatarLoading}>
                  <Button icon={<CameraOutlined />} loading={avatarLoading}>更换</Button>
                </Upload>
              ),
            },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', background: '#f8fafc', borderRadius: 10,
              border: '1px solid #f0f0f0', transition: 'border-color 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#99f6e4'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f0f0f0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: item.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{item.icon}</div>
                <div>
                  <Text strong style={{ display: 'block', fontSize: 14 }}>{item.title}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>{item.desc}</Text>
                </div>
              </div>
              {item.action}
            </div>
          ))}
        </div>
      </Card>

      {/* Modals */}
      <Modal title="修改密码" open={passwordModalOpen} onOk={handleChangePassword}
        onCancel={() => { setPasswordModalOpen(false); passwordForm.resetFields() }}
        confirmLoading={passwordLoading} destroyOnClose>
        <Form form={passwordForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="newPassword" label="新密码"
            rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少 6 位' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认密码" dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑资料" open={profileModalOpen} onOk={handleEditProfile}
        onCancel={() => setProfileModalOpen(false)} confirmLoading={profileLoading} destroyOnClose>
        <Form form={profileForm} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Avatar size={64} src={avatarUrl || undefined} icon={<UserOutlined />} />
          </div>
          <Form.Item name="displayName" label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }, { max: 30, message: '名称不超过 30 个字符' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入显示名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SettingsPage
