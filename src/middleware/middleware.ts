import type { IncomingMessage, ServerResponse } from "http"

import { addClientLog, isClientBlacklisted } from "../utils/database"

export const middleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: (request: IncomingMessage, response: ServerResponse) => void,
  options?: {
    identifierGetter: (request: IncomingMessage) => string
  }
) => {
  const requestStart = new Date()
  let responseStart: Date = null

  const identifier = options?.identifierGetter(request) ?? (
    request.socket.localAddress + request.headers.cookie ||
    request.headers["user-agent"] ||
    "unknown"
  ).slice(0, 100)

  // ========== CHECK BLACKLIST ===========
  isClientBlacklisted(identifier).then((isBlacklisted) => {
    if (isBlacklisted) {
      removeRequestEventListeners()
      response.writeHead(403)
      response.end("You are blacklisted")
      return
    }
  })

  // ========== CALL NEXT ==========
  next(request, response)

  // ========== REQUEST HANLDING ==========
  let bodySize = 0
  const countDataSize = (chunk: Uint8Array) => {
    bodySize += chunk.length
  }
  const onRequestEnd = () => {
    responseStart = new Date()
  }
  const onRequestError = () => {
    responseStart = new Date()
  }
  const onRequestClose = () => {
    removeRequestEventListeners()
    if (!responseStart) {
      responseStart = new Date()
    }
  }

  request.on("data", countDataSize)
  request.on("end", onRequestEnd)
  request.on("error", onRequestError)
  request.on("close", onRequestClose)

  // ========== RESPONSE HANLDING ==========
  const onClose = () => {
    if (!responseStart) {
      onRequestClose()
    }

    const responseEnd = new Date()

    addClientLog(
      {
        identifier,
      },
      {
        timestamp: requestStart,
        response_time: responseEnd.getTime() - responseStart.getTime(),
        total_time: responseEnd.getTime() - requestStart.getTime(),
        header_size: request.rawHeaders.length,
        body_size: bodySize,
        method: request.method,
        url: request.url,
        status_code: response.statusCode,
      },
    )
  }

  response.socket.once("close", onClose)

  // ========== CLEANUP ==========
  const removeRequestEventListeners = () => {
    request.off("data", countDataSize)
    request.off("end", onRequestEnd)
    request.off("error", onRequestError)
    request.off("close", onRequestClose)
  }
}
