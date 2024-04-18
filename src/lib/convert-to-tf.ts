import {
  loadPreprocessed,
  loadPreprocessedBenchmark,
} from "./load-preprocessed"

export function loadTensorflowData(max_length: number | null = null) {
  const data = loadPreprocessed()

  const x: number[][][] = []
  const y: number[] = []

  if (max_length === null) {
    data.forEach((value) => {
      x.push(
        value.log.map((item) => [
          item.interval,
          item.variants,
          item.headerSize,
          item.bodySize,
          item.method,
          item.status,
          item.responseTime,
          item.totalTime,
        ]),
      )
      y.push(value.flag ? 1 : 0)
    })

    return { x, y }
  }
  data.forEach((value) => {
    const len = value.log.length
    const log = value.log
    const flag = value.flag

    if (len > max_length) {
      x.push(
        log
          .slice(0, max_length)
          .map((item) => [
            item.interval,
            item.variants,
            item.headerSize,
            item.bodySize,
            item.method,
            item.status,
            item.responseTime,
            item.totalTime,
          ]),
      )
    } else {
      const x_temp: number[][] = []
      for (let i = 0; i < max_length; i++) {
        if (i < len) {
          x_temp.push([
            log[i].interval,
            log[i].variants,
            log[i].headerSize,
            log[i].bodySize,
            log[i].method,
            log[i].status,
            log[i].responseTime,
            log[i].totalTime,
          ])
        } else {
          x_temp.push([0, 0, 0, 0, 0, 0, 0, 0])
        }
      }

      x.push(x_temp)
    }

    y.push(flag ? 1 : 0)
  })

  return {
    x,
    y,
  }
}

export function loadBenchmarkTensorflowData(max_length: number | null) {
  const data = loadPreprocessedBenchmark()

  const x: number[][][] = []
  const y: number[] = []

  if (max_length === null) {
    data.forEach((value) => {
      x.push(
        value.log.map((item) => [
          item.interval,
          item.variants,
          item.headerSize,
          item.bodySize,
          item.method,
          item.status,
          item.responseTime,
          item.totalTime,
        ]),
      )
      y.push(value.flag ? 1 : 0)
    })

    return { x, y }
  }
  data.forEach((value) => {
    const len = value.log.length
    const log = value.log
    const flag = value.flag

    if (len > max_length) {
      x.push(
        log
          .slice(0, max_length)
          .map((item) => [
            item.interval,
            item.variants,
            item.headerSize,
            item.bodySize,
            item.method,
            item.status,
            item.responseTime,
            item.totalTime,
          ]),
      )
    } else {
      const x_temp: number[][] = []
      for (let i = 0; i < max_length; i++) {
        if (i < len) {
          x_temp.push([
            log[i].interval,
            log[i].variants,
            log[i].headerSize,
            log[i].bodySize,
            log[i].method,
            log[i].status,
            log[i].responseTime,
            log[i].totalTime,
          ])
        } else {
          x_temp.push([0, 0, 0, 0, 0, 0, 0, 0])
        }
      }

      x.push(x_temp)
    }

    y.push(flag ? 1 : 0)
  })

  return {
    x,
    y,
  }
}
