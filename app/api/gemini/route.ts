import { NextRequest } from 'next/server'
import { PA_LM_API_URL, PA_LM_API_KEY } from '@/lib/env'
import { getSession } from '@/lib/auth'

const GENERIC_ERROR_MESSAGE = 'Gemini request failed'

function errorResponse(status: number) {
  return new Response(JSON.stringify({ error: GENERIC_ERROR_MESSAGE }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const apiUrl = PA_LM_API_URL
    const apiKey = PA_LM_API_KEY

    if (!apiUrl || !apiKey) {
      console.error('api/gemini error: missing PA_LM_API_URL or PA_LM_API_KEY')
      return errorResponse(500)
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
    if (!resp.ok) {
      console.error('api/gemini upstream error:', {
        status: resp.status,
        body: text,
      })
      return errorResponse(resp.status)
    }

    return new Response(text, {
      status: resp.status,
      headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' },
    })
  } catch (err: unknown) {
    console.error('api/gemini error:', err);
    return errorResponse(500)
  }
}
