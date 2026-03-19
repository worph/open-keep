import { NextRequest } from 'next/server'
import { MCP_TOOLS } from './tools'
import { handleToolCall } from './handlers'
import { McpError, INVALID_REQUEST, METHOD_NOT_FOUND, INTERNAL_ERROR } from './errors'

export const dynamic = 'force-dynamic'

const PROTOCOL_VERSION = '2025-03-26'

interface SseSession {
  controller: ReadableStreamDefaultController
  interval: ReturnType<typeof setInterval>
}

const sessions = new Map<string, SseSession>()

function jsonrpcResponse(id: unknown, result: unknown) {
  return { jsonrpc: '2.0', id, result }
}

function jsonrpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

async function handleMcpMethod(method: string, params: any, id: unknown) {
  switch (method) {
    case 'initialize':
      return jsonrpcResponse(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'open-keep', version: '1.0.0' },
      })

    case 'notifications/initialized':
      return null // notification — no response

    case 'tools/list':
      return jsonrpcResponse(id, { tools: MCP_TOOLS })

    case 'tools/call': {
      const result = await handleToolCall(params.name, params.arguments ?? {})
      return jsonrpcResponse(id, result)
    }

    default:
      throw new McpError(METHOD_NOT_FOUND, `Method not found: ${method}`)
  }
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json(jsonrpcError(null, INVALID_REQUEST, 'Invalid JSON'), { status: 400 })
  }

  const { jsonrpc, id, method, params } = body
  if (jsonrpc !== '2.0' || !method) {
    return Response.json(jsonrpcError(id ?? null, INVALID_REQUEST, 'Invalid JSON-RPC request'), { status: 400 })
  }

  try {
    const result = await handleMcpMethod(method, params ?? {}, id)

    // notification — no response body
    if (result === null) {
      return new Response(null, { status: 204 })
    }

    // If a sessionId is present, write to the SSE stream and return 202
    const sessionId = request.nextUrl.searchParams.get('sessionId')
    if (sessionId) {
      const session = sessions.get(sessionId)
      if (session) {
        const data = JSON.stringify(result)
        session.controller.enqueue(new TextEncoder().encode(`event: message\ndata: ${data}\n\n`))
        return new Response(null, { status: 202 })
      }
    }

    return Response.json(result)
  } catch (e) {
    if (e instanceof McpError) {
      return Response.json(jsonrpcError(id ?? null, e.code, e.message))
    }
    console.error('MCP error:', e)
    return Response.json(jsonrpcError(id ?? null, INTERNAL_ERROR, 'Internal error'))
  }
}

export async function GET(request: NextRequest) {
  const sessionId = crypto.randomUUID()
  const postUrl = `${request.nextUrl.origin}/api/mcp?sessionId=${sessionId}`

  const stream = new ReadableStream({
    start(controller) {
      // Send endpoint event
      controller.enqueue(new TextEncoder().encode(`event: endpoint\ndata: ${postUrl}\n\n`))

      // Keepalive every 30s
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'))
        } catch {
          clearInterval(interval)
          sessions.delete(sessionId)
        }
      }, 30_000)

      sessions.set(sessionId, { controller, interval })
    },
    cancel() {
      const session = sessions.get(sessionId)
      if (session) {
        clearInterval(session.interval)
        sessions.delete(sessionId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
