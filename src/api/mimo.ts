const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_MIMO_API_KEY
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: (fullText: string) => void
  onError: (error: string) => void
}

// 构建数据上下文摘要（精简版，节省 token）
export function buildDataContext(
  datasetName: string,
  columns: string[],
  rowCount: number,
  sampleRows: Record<string, unknown>[],
): string {
  const sample = sampleRows.slice(0, 3) // 只取3行样本
  const colInfo = columns.map((col) => {
    const values = sample.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== '')
    const isNumeric = values.length > 0 && values.every((v) => !isNaN(Number(String(v).replace(/,/g, ''))))
    return `${col}(${isNumeric ? '数值' : '文本'})`
  }).join(', ')

  const sampleTable = sample.map((row, i) => {
    const cells = columns.map((col) => {
      const val = String(row[col] ?? '')
      return val.length > 20 ? val.substring(0, 20) + '..' : val
    }).join('|')
    return `${i + 1}|${cells}`
  }).join('\n')

  return `${datasetName} | ${rowCount}行 | 列：${colInfo}\n样本：\n${sampleTable}`
}

// 流式调用 DeepSeek API
// 开发环境：通过 Vite 代理调用（/api/deepseek → https://api.deepseek.com）
// 生产环境：通过 Vercel Serverless Function 代理（/api/chat），API Key 在服务端
export async function streamChat(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  let fullText = ''

  const isDev = import.meta.env.DEV
  let endpoint: string
  let headers: Record<string, string>

  if (isDev) {
    // 开发模式：Vite 代理 + 浏览器端 API Key
    if (!API_KEY) {
      callbacks.onError('未配置 API Key，请在 .env.local 中设置 VITE_DEEPSEEK_API_KEY')
      return
    }
    endpoint = '/api/deepseek/chat/completions'
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    }
  } else {
    // 生产模式：通过 Vercel Serverless Function 代理（API Key 在服务端）
    endpoint = '/api/chat'
    headers = {
      'Content-Type': 'application/json',
    }
  }

  let response: Response

  try {
    const body = isDev
      ? JSON.stringify({ model: 'deepseek-chat', messages, stream: true, temperature: 0.7, max_tokens: 500 })
      : JSON.stringify({ messages, stream: true })

    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
      signal,
    })
  } catch (e) {
    callbacks.onError(`网络请求失败：${e instanceof Error ? e.message : '未知错误'}\n请求地址：${endpoint}`)
    return
  }

  if (!response.ok) {
    const errBody = await response.text()
    callbacks.onError(`API 请求失败 (${response.status})\n请求地址：${endpoint}\n服务器响应：${errBody.substring(0, 500)}`)
    return
  }

  try {
    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError('无法读取响应流')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            fullText += delta
            callbacks.onToken(delta)
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }

    callbacks.onDone(fullText)
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      callbacks.onDone(fullText || '')
    } else {
      callbacks.onError(err instanceof Error ? err.message : '未知错误')
    }
  }
}
