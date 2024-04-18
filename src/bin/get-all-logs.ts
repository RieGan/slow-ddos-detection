import { readFileSync, writeFileSync } from "fs"
import { getAllBlacklistedClients, getAllLogs, Log } from "../utils/database"
import { resolve as pathResolve } from "path"

const filePath = pathResolve(__dirname + "/../../data/logs.json")
const saveLogs = async () => {
  const data = await getAllLogs(200)

  // save to file
  console.log("Saving to file")
  writeFileSync(filePath, JSON.stringify(data))
}

const countConnected = async () => {
    // load from json
    const data = await getAllLogs(200)
    let max = 0,
        min = Infinity
    
    const connectionTime = data.map((log) => {
        const startTime = log.timestamp.getTime()
        const endTime = startTime + Number(log.total_time)

        if (startTime < min) min = startTime
        if (endTime > max) max = endTime

        return [startTime, endTime]
    })
    const counts: number[] = []

    for (let i = min; i < max; i++) {
        const count = connectionTime.filter((time) => time[0] <= i && time[1] >= i).length
        counts.push(count)
    }

    writeFileSync(pathResolve(__dirname + "/../../data/counts.json"), JSON.stringify(counts))
}

const blacklistTimestamp = async () => {
    const data = await getAllBlacklistedClients()

    const timestamps = data.map((client) => client.created_at.getTime()).sort((a, b) => a - b)

    writeFileSync(pathResolve(__dirname + "/../../data/blacklist.json"), JSON.stringify(timestamps))
}

// saveLogs()
countConnected()
// blacklistTimestamp()