import { useCallback } from 'react'
import { message } from 'antd'
import { useChatStore } from '@/stores/chatStore'
import { streamChat, buildDataContext } from '@/api/mimo'
import type { ChatMessage } from '@/api/mimo'
import type { Dataset, DataRow } from '@/types'

const SYSTEM_PROMPT = `你是数据分析助手。基于用户的数据集，帮助分析数据、发现规律、推荐图表。用中文简洁回答。`

export const useChat = (dataset: Dataset | null, dataRows: DataRow[]) => {
  const {
    messages,
    loading,
    addMessage,
    updateLastMessage,
    setLastMessageStreaming,
    clearMessages,
    setLoading,
    setAbortController,
  } = useChatStore()

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || loading) return

    // 添加用户消息
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput.trim(),
      timestamp: new Date().toISOString(),
    }
    addMessage(userMsg)

    // 添加空的 assistant 消息（用于流式填充）
    const assistantMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: '',
      timestamp: new Date().toISOString(),
      streaming: true,
    }
    addMessage(assistantMsg)
    setLoading(true)

    // 构建上下文
    const contextParts: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    // 添加数据集上下文
    if (dataset && dataRows.length > 0) {
      const dataContext = buildDataContext(
        dataset.name,
        dataset.column_names,
        dataset.row_count,
        dataRows.slice(0, 5).map((r) => r.row_data),
      )
      contextParts.push({
        role: 'system',
        content: `当前数据集信息：\n${dataContext}`,
      })
    }

    // 添加历史消息（最近5条，节省 token）
    const recentMessages = messages.slice(-5)
    recentMessages.forEach((msg) => {
      contextParts.push({
        role: msg.role,
        content: msg.content,
      })
    })

    // 添加当前用户消息
    contextParts.push({ role: 'user', content: userInput.trim() })

    // 创建 abort controller
    const controller = new AbortController()
    setAbortController(controller)

    // 流式调用
    await streamChat(contextParts, {
      onToken: (token) => {
        updateLastMessage((prev) => prev + token)
      },
      onDone: () => {
        setLastMessageStreaming(false)
        setLoading(false)
        setAbortController(null)
      },
      onError: (error) => {
        setLastMessageStreaming(false)
        setLoading(false)
        setAbortController(null)
        message.error('AI 分析失败：' + error)
        // 移除空的 assistant 消息
        updateLastMessage('⚠️ 分析出错：' + error)
      },
    }, controller.signal)
  }, [dataset, dataRows, messages, loading, addMessage, updateLastMessage, setLastMessageStreaming, setLoading, setAbortController])

  const stopGeneration = useCallback(() => {
    const { abortController } = useChatStore.getState()
    abortController?.abort()
  }, [])

  return {
    messages,
    loading,
    sendMessage,
    stopGeneration,
    clearMessages,
  }
}
