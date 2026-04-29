import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const apiUrl = process.env.PA_LM_API_URL
    const apiKey = process.env.PA_LM_API_KEY

    if (!apiUrl || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing PA_LM_API_URL or PA_LM_API_KEY env vars' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const text = await resp.text()
    return new Response(text, {
      status: resp.status,
      headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' },
    })
  } catch (err: unknown) {
    console.error('api/gemini error:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
