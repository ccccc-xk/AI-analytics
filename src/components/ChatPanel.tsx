import { useState, useRef, useEffect } from 'react'
import { Input, Button, Typography, Space, Tag, Spin } from 'antd'
import {
  SendOutlined,
  ClearOutlined,
  StopOutlined,
  RobotOutlined,
  UserOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import { useChat } from '@/hooks/useChat'
import type { Dataset, DataRow } from '@/types'

const { Text } = Typography

interface ChatPanelProps {
  dataset: Dataset
  dataRows: DataRow[]
}

const SUGGESTED_QUESTIONS = [
  '请分析这个数据集的整体情况',
  '哪些列是数值型？适合做哪些图表？',
  '数据中有什么异常值或趋势？',
  '请推荐合适的可视化方案',
]

const ChatPanel = ({ dataset, dataRows }: ChatPanelProps) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, loading, sendMessage, stopGeneration, clearMessages } = useChat(dataset, dataRows)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const text = input
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggested = async (q: string) => {
    if (loading) return
    await sendMessage(q)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 500 }}>
      {/* 头部 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 12,
      }}>
        <Space>
          <RobotOutlined style={{ fontSize: 18, color: '#1677ff' }} />
          <Text strong>AI 数据分析助手</Text>
          <Tag color="blue">DeepSeek</Tag>
        </Space>
        {messages.length > 0 && (
          <Button
            icon={<ClearOutlined />}
            size="small"
            onClick={clearMessages}
            disabled={loading}
          >
            清空对话
          </Button>
        )}
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 4px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <RobotOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <div>
              <Text type="secondary">我是你的数据分析助手</Text>
            </div>
            <div>
              <Text type="secondary">选择下方问题开始分析，或直接输入你的问题</Text>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 8,
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#e6f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <RobotOutlined style={{ color: '#1677ff' }} />
              </div>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: 12,
              background: msg.role === 'user' ? '#1677ff' : '#f5f5f5',
              color: msg.role === 'user' ? '#fff' : '#333',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.6,
              fontSize: 14,
            }}>
              {msg.content || (msg.streaming ? <Spin size="small" /> : '')}
              {msg.streaming && msg.content && (
                <span style={{ animation: 'blink 1s infinite' }}>▍</span>
              )}
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <UserOutlined style={{ color: '#fff' }} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 推荐问题 */}
      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {SUGGESTED_QUESTIONS.map((q) => (
            <Tag
              key={q}
              icon={<BulbOutlined />}
              color="blue"
              style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}
              onClick={() => handleSuggested(q)}
            >
              {q}
            </Tag>
          ))}
        </div>
      )}

      {/* 输入框 */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的数据分析问题..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading}
          style={{ flex: 1 }}
        />
        {loading ? (
          <Button
            icon={<StopOutlined />}
            danger
            onClick={stopGeneration}
            style={{ alignSelf: 'flex-end' }}
          >
            停止
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!input.trim()}
            style={{ alignSelf: 'flex-end' }}
          >
            发送
          </Button>
        )}
      </div>

      {/* 光标闪烁动画 */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default ChatPanel
