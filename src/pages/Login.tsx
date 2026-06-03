import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Input, Button, Typography } from 'antd'
import { UserOutlined, LockOutlined, LineChartOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'

const { Title, Text } = Typography

const Login = () => {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    await signIn(values.email, values.password)
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blurred circles */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-5%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '60%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      <div style={{
        width: 420,
        padding: '48px 40px',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        {/* Logo / Brand */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 36,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            <LineChartOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 700, letterSpacing: -0.5 }}>
            AI 数据分析工作台
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>
            智能数据洞察，驱动业务决策
          </Text>
        </div>

        <Form onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
            style={{ marginBottom: 20 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.35)' }} />}
              placeholder="邮箱地址"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                color: '#fff',
                height: 46,
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: 28 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.35)' }} />}
              placeholder="密码"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                color: '#fff',
                height: 46,
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 20 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 46,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              }}
            >
              登 录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
              还没有账号？
            </Text>{' '}
            <Link
              to="/register"
              style={{
                color: '#818cf8',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              立即注册
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default Login
