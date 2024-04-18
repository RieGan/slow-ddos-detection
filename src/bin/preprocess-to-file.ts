import { PreprocessedLog, preprocess } from "../preprocess";
import { getAllClients, getLogs } from "../utils/database";
import { writeFileSync } from "fs";
import { resolve as pathResolve } from "path"

export interface Data {
    id: string;
    flag: boolean;
    log: PreprocessedLog[]
}

const main = async () => {
    const data: Data[] = [];
    const clients = await getAllClients();
    for (const client of clients) {
        console.log(`Preprocessing client ${client.identifier}`);
        const logs = await getLogs(client.identifier);
        data.push({
          id: client.identifier,
          flag: client.identifier.startsWith("ATTACK"),
          log: preprocess(logs),
        })
    }

    // save to file
    console.log("Saving to file");
    const filePath = pathResolve(__dirname + "/../../data/preprocessed.json");
    writeFileSync(filePath, JSON.stringify(data))
}

main();