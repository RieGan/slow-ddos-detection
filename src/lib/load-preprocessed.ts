import { readFileSync, writeFileSync } from "fs"
import { resolve as pathResolve } from "path"
import type { Data } from "../bin/preprocess-to-file"

// Config
const SPLIT_TO = 2
const SIZE_OVERHEAD_PERCENTAGE = 0.2

export const loadPreprocessed = (): Data[] => {
  const data: Data[] = []

  for (let i = 0; i < SPLIT_TO; i++) {
    const raw_data = readFileSync(
      pathResolve(__dirname, `../../data/preprocessed.${i}.json`),
    )
    const parsed_data: Data[] = JSON.parse(raw_data.toString())
    data.push(...parsed_data)
  }

  return data
}

export const save_split = () => {
  const data = loadPreprocessed()
  const max_size =
    (data.reduce((acc, value) => acc + value.log.length, 0) *
      (1 + SIZE_OVERHEAD_PERCENTAGE)) /
    SPLIT_TO
  const splitted: Data[][] = new Array(SPLIT_TO).fill(0).map(() => [])

  let current_size = 0
  let current_index = 0
  let this_size = 0
  try {
    data.forEach((value) => {
      this_size = value.log.length
      if (current_size + value.log.length > max_size) {
        current_index++
        current_size = 0
      }
      splitted[current_index].push(value)
      current_size += value.log.length
    })
  } catch (e) {
    console.log("max_size", max_size)
    console.log("this_size", this_size)
    console.log("current_index", current_index)
    console.log("current_size", current_size)
    throw e
  }

  splitted.forEach((value, index) => {
    pathResolve(__dirname, `../../data/preprocessed.${index}.json`)
    writeFileSync(
      pathResolve(__dirname, `../../data/preprocessed.${index}.json`),
      JSON.stringify(value),
    )
  })
}

export const loadPreprocessedBenchmark = (): Data[] => {
  const raw_data = readFileSync(
    pathResolve(__dirname, `../../data/preprocessed.benchmark.json`),
  )
  return JSON.parse(raw_data.toString())
}
