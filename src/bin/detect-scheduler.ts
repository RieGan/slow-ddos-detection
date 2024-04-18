import * as tf from "@tensorflow/tfjs-node"
import { load } from "../model"
import { preprocessToTensorflow } from "../preprocess"
import { blacklistClients, getCountLatestClientLog } from "../utils/database"
import type { Tensor } from "@tensorflow/tfjs"
import { ModelCount, ModelType } from "../model/entity"

const THRESHOLD = Number(process.env.PREDICTION_THRESHOLD) || 0.7

export const detectFromLogInterval = async ({model, interval, clientSize}:{model: ModelCount, interval: number, clientSize: number}) => {
  let latestTimestamp: Date | undefined
  const [modelType, dataLengthStr] = model.split("-") as [ModelType, string]
  const dataLength = ~~dataLengthStr
  const detectionModel = await load(modelType, dataLengthStr)
  const detect = async () => {
    const clientLogs = await getCountLatestClientLog(clientSize, dataLength, latestTimestamp)
    if (clientLogs.length === 0) return
    latestTimestamp = clientLogs[0].updated_at
    const tfInput = tf.tensor(
      clientLogs.map(({ log }) => preprocessToTensorflow(log, dataLength, true)),
    )

    const predictions = (detectionModel.predict(tfInput) as Tensor).dataSync()
    const clients = []
    predictions.forEach((prediction: number, index: number) => {
      if (prediction > THRESHOLD) clients.push(clientLogs[index].identifier)
    })

    if (clients.length > 0) {
      console.log("DETECTED:", clients.length, "clients")
      blacklistClients(clients)
    }
  }
  setInterval(detect, interval)
}
