import type { Log } from "../utils/database"
import { http_method, http_status } from "./dictionary"
import type { PreprocessedLog } from "./entity"

export function preprocess(
  logs: Log[],
  maxLength?: number,
  onlyLast?: boolean,
) {
  const newLogs = onlyLast
    ? logs.slice(-maxLength)
    : maxLength
    ? logs.slice(0, maxLength)
    : logs
  let last_accessed: Date | null = null
  const opened_paths: string[] = []

  const data: PreprocessedLog[] = []

  for (const [index, log] of newLogs.entries()) {
    const {
      timestamp,
      response_time,
      total_time,
      header_size,
      body_size,
      method,
      url,
      status_code,
    } = log

    if (!opened_paths.includes(url)) {
      opened_paths.push(url)
    }

    const interval = last_accessed
      ? timestamp.getTime() - last_accessed.getTime()
      : 0

    const variants = opened_paths.length / index
    last_accessed = timestamp

    data.push({
      interval,
      variants,
      headerSize: header_size,
      bodySize: body_size,
      method: http_method[method],
      status: http_status[status_code],
      responseTime: response_time || 0,
      totalTime: total_time || 0,
    })
  }

  return data
}

export function preprocessToTensorflow(
  logs: Log[],
  length?: number,
  onlyLast?: boolean,
) {
  const data = preprocess(logs, length, onlyLast)

  if (length === undefined || data.length === length) {
    return data.map((item) => [
      item.interval,
      item.variants,
      item.headerSize,
      item.bodySize,
      item.method,
      item.status,
      item.responseTime,
      item.totalTime,
    ])
  } else {
    return data
      .map((item) => [
        item.interval,
        item.variants,
        item.headerSize,
        item.bodySize,
        item.method,
        item.status,
        item.responseTime,
        item.totalTime,
      ])
      .concat(Array(length - data.length).fill([0, 0, 0, 0, 0, 0, 0, 0]))
  }
}
