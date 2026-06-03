import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key not configured' })
  }

  const { messages, stream = true } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' })
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream,
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: errText })
    }

    if (stream && response.body) {
      // Stream mode: pipe SSE data directly
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          res.write(chunk)
        }
      } finally {
        reader.releaseLock()
        res.end()
      }
    } else {
      // Non-stream mode
      const data = await response.json()
      return res.status(200).json(data)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: `Proxy error: ${message}` })
  }
}
