import { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Typography } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const { user } = useAuthStore()
  const avatarUrl = (user?.user_metadata?.avatar_url as string) || ''

  const menuItems = [
    {
      type: 'group' as const,
      label: collapsed ? '' : '核心功能',
      children: [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: '仪表�?,
        },
        {
          key: '/projects',
          icon: <ProjectOutlined />,
          label: '项目管理',
        },
      ],
    },
    {
      type: 'group' as const,
      label: collapsed ? '' : '数据分析',
      children: [
        {
          key: '/admin',
          icon: <BarChartOutlined />,
          label: '数据概览',
        },
      ],
    },
    {
      type: 'group' as const,
      label: collapsed ? '' : '系统',
      children: [
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: '系统设置',
        },
      ],
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登�?,
    },
  ]

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key)
  }

  const handleUserMenuClick = (info: { key: string }) => {
    if (info.key === 'logout') {
      signOut()
    }
    if (info.key === 'profile') {
      navigate('/settings')
    }
  }

  // Determine selected key
  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/projects')) return '/projects'
    if (path === '/admin') return '/admin'
    if (path === '/settings') return '/settings'
    return '/dashboard'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={64}
      >
        {/* Brand area */}
        <div style={{
          height: collapsed ? 56 : 64,
          margin: collapsed ? '16px 8px 12px' : '16px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '0 8px' : '0 4px',
          transition: 'all 0.2s',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(129,140,248,0.4)',
          }}>
            <LineChartOutlined style={{ fontSize: 18, color: '#fff' }} />
          </div>
          {!collapsed && (
            <Text style={{
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: -0.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}>
              AI ���ݷ���ƽ̨
            </Text>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 40, height: 40, borderRadius: 8 }}
          />
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              transition: 'background 0.15s',
            }}>
              <Avatar
                size={32}
                src={avatarUrl || undefined}
                icon={<UserOutlined />}
                style={{
                  background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                }}
              />
            </div>
          </Dropdown>
        </Header>
        <Content style={{
          margin: 24,
          padding: 0,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
