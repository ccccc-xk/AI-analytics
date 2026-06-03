export async function onRequestPost(context: {
  request: Request
  env: { DEEPSEEK_API_KEY: string }
}) {
  const { request, env } = context
  const apiKey = env.DEEPSEEK_API_KEY

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server API key not configured' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await request.json()
    const { messages, stream = true } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

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
      return new Response(errText, {
        status: response.status,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    if (stream && response.body) {
      return new Response(response.body, {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: `Proxy error: ${message}` }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
}
