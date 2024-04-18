import * as tf from "@tensorflow/tfjs-node"
import { resolve as pathResolve } from "path"
import { writeFileSync } from "fs"
import {
  loadBenchmarkTensorflowData,
  loadTensorflowData,
} from "../lib/convert-to-tf"
import type { History, Sequential, Tensor } from "@tensorflow/tfjs"
import { models, counts } from "./entity"
import type { ModelType } from "./entity"

const REQUEST_LENGTH = 16
const EPOCH = 32

const loadTrainData = (requestLength: number) => {
  const { x: baseX, y: baseY } = loadTensorflowData(requestLength)

  return {
    x: tf.tensor(baseX),
    y: tf.tensor(baseY),
  }
}

function createModel(type: ModelType, dataLength?: number) {
  const model = tf.sequential()
  const inputLength = dataLength || REQUEST_LENGTH
  switch (type) {
    case "lstm":
      model.add(
        tf.layers.lstm({
          inputShape: [inputLength, 8],
          units: 4,
          returnSequences: false,
        }),
      )

      model.add(tf.layers.dropout({ rate: 0.25 }))
      model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }))
      model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.sigmoidCrossEntropy,
        metrics: ["accuracy"],
      })
      break
    case "lstm2":
      model.add(
        tf.layers.lstm({
          inputShape: [inputLength, 8],
          units: 4,
          returnSequences: true,
        }),
      )
      model.add(
        tf.layers.lstm({
          units: 4,
          returnSequences: false,
        }),
      )

      model.add(tf.layers.dropout({ rate: 0.25 }))
      model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }))
      model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.sigmoidCrossEntropy,
        metrics: ["accuracy"],
      })
      break
    case "cnn1d":
      model.add(
        tf.layers.conv1d({
          inputShape: [inputLength, 8],
          filters: 2,
          kernelSize: 1,
          strides: 1,
          activation: "relu",
          kernelInitializer: "VarianceScaling",
        }),
      )
      model.add(tf.layers.batchNormalization())
      model.add(tf.layers.maxPooling1d({ poolSize: 2, strides: 2 }))
      model.add(tf.layers.flatten())
      model.add(tf.layers.dropout({ rate: 0.25 }))
      model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }))
      model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.sigmoidCrossEntropy,
        metrics: ["accuracy"],
      })
      break
  }

  return model
}

async function train_all() {
  for (let i = 0; i < counts.length; i++) {
    const dataLength = counts[i]

    const { x: x_train, y: y_train } = loadTrainData(dataLength)
    for (let j = 0; j < models.length; j++) {
      const modelType = models[j]
      const model = createModel(modelType, dataLength)
      console.log(modelType, "-", dataLength)
      const history = await model.fit(x_train, y_train, {
        epochs: EPOCH,
      })

      await save(model, history, modelType, dataLength)
    }
  }
}

async function save(
  model: Sequential,
  history: History,
  type?: ModelType,
  count?: number,
) {
  const dirPath = pathResolve(__dirname, "../../data")
  const fileName = `model-${type || "default"}-${count || "default"}`
  // save model
  await model.save(`file://${dirPath}/model/${fileName}`)
  // save history
  writeFileSync(`${dirPath}/history/${fileName}.json`, JSON.stringify(history))
}

export async function load(type?: ModelType, count?: number | string) {
  const dirPath = pathResolve(__dirname, "../../data")
  const fileName = `model-${type || "default"}-${count || "default"}`
  const model = await tf.loadLayersModel(
    `file://${dirPath}/model/${fileName}/model.json`,
  )
  return model
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function benchmarkAll() {
  const dataLog: {
    model: string
    count: number
    interval: number
    start: number
    end: number
    score: {
      TP: number
      TN: number
      FP: number
      FN: number
      accuracy: number
      precission: number
      recall: number
      f1: number
    }
  }[] = []

  for (let i = 0; i < counts.length; i++) {
    const dataLength = counts[i]
    const { x, y } = loadBenchmarkTensorflowData(dataLength)
    for (let j = 0; j < models.length; j++) {
      const modelType = models[j]
      const model = await load(modelType, dataLength)

      await delay(4000)

      const start = Date.now()

      const result = []
      for (let k = 0; k < x.length; k++) {
        const input = tf.tensor([x[k]])
        const output = (model.predict(input) as Tensor).dataSync()
        result.push(output[0])
      }
      let TP = 0
      let TN = 0
      let FP = 0
      let FN = 0
      result.forEach((value: number, index: number) => {
        if (value > 0.5 && y[index] === 1) TP++
        else if (value > 0.5 && y[index] === 0) FP++
        else if (value < 0.5 && y[index] === 1) FN++
        else if (value < 0.5 && y[index] === 0) TN++
      })

      const end = Date.now()
      const log = {
        model: modelType + "-" + dataLength,
        count: x.length,
        interval: end - start,
        start,
        end,
        score: {
          TP,
          TN,
          FP,
          FN,
          accuracy: (TP + TN) / (TP + TN + FP + FN),
          precission: TP / (TP + FP),
          recall: TP / (TP + FN),
          f1:
            (2 * (TP / (TP + FP)) * (TP / (TP + FN))) /
            (TP / (TP + FP) + TP / (TP + FN)),
        },
      }

      console.log(JSON.stringify(log))
      dataLog.push(log)
    }
  }

  const dirPath = pathResolve(__dirname, "../../data")
  writeFileSync(`${dirPath}/benchmark.json`, JSON.stringify(dataLog))
}
