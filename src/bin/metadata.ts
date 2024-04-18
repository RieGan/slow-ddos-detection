import { loadPreprocessed, loadPreprocessedBenchmark } from "../lib/load-preprocessed"

export function getMetadata() {
  const data = loadPreprocessedBenchmark()

  const attack_data = data.filter((value) => value.flag)
  const normal_data = data.filter((value) => !value.flag)
  
  const attack_clients = attack_data.length
  const normal_clients = normal_data.length
  const attack_requests = attack_data.reduce((acc, value) => acc + value.log.length, 0)
  const normal_requests = normal_data.reduce((acc, value) => acc + value.log.length, 0)
  const min_attack_req = attack_data.reduce((acc, value) => Math.min(acc, value.log.length), 100000)
  const max_attack_req = attack_data.reduce((acc, value) => Math.max(acc, value.log.length), 0)
  const min_normal_req = normal_data.reduce((acc, value) => Math.min(acc, value.log.length), 100000)
  const max_normal_req = normal_data.reduce((acc, value) => Math.max(acc, value.log.length), 0)
  const median_attack_req = attack_data.sort((a, b) => a.log.length - b.log.length)[Math.floor(attack_data.length / 2)].log.length
  const median_normal_req = normal_data.sort((a, b) => a.log.length - b.log.length)[Math.floor(normal_data.length / 2)].log.length
  const avg_attack_req = attack_requests / attack_clients
  const avg_normal_req = normal_requests / normal_clients
  const attack_client_with_more_than_4_req = attack_data.filter((value) => value.log.length > 4).length
  const normal_client_with_more_than_4_req = normal_data.filter((value) => value.log.length > 4).length
  const attack_client_with_more_than_8_req = attack_data.filter((value) => value.log.length > 8).length
  const normal_client_with_more_than_8_req = normal_data.filter((value) => value.log.length > 8).length
  const attack_client_with_more_than_16_req = attack_data.filter((value) => value.log.length > 16).length
  const normal_client_with_more_than_16_req = normal_data.filter((value) => value.log.length > 16).length
  const attack_client_with_more_than_32_req = attack_data.filter((value) => value.log.length > 32).length
  const normal_client_with_more_than_32_req = normal_data.filter((value) => value.log.length > 32).length

  console.log('Client Count:')
  console.log('- attack: ', attack_clients)
  console.log('- normal: ', normal_clients)
  console.log('------------------------')
  console.log('Request Count:')
  console.log('- attack: ', attack_requests)
  console.log('- normal: ', normal_requests)
  console.log('------------------------')
  console.log('Min Request Count:')
  console.log('- attack: ', min_attack_req)
  console.log('- normal: ', min_normal_req)
  console.log('------------------------')
  console.log('Max Request Count:')
  console.log('- attack: ', max_attack_req)
  console.log('- normal: ', max_normal_req)
  console.log('------------------------')
  console.log('Median Request Count:')
  console.log('- attack: ', median_attack_req)
  console.log('- normal: ', median_normal_req)
  console.log('------------------------')
  console.log('Avg Request Count:')
  console.log('- attack: ', avg_attack_req)
  console.log('- normal: ', avg_normal_req)
  console.log('------------------------')
  console.log('Client with more than 4 requests:')
  console.log('- attack: ', attack_client_with_more_than_4_req)
  console.log('- normal: ', normal_client_with_more_than_4_req)
  console.log('------------------------')
  console.log('Client with more than 8 requests:')
  console.log('- attack: ', attack_client_with_more_than_8_req)
  console.log('- normal: ', normal_client_with_more_than_8_req)
  console.log('------------------------')
  console.log('Client with more than 16 requests:')
  console.log('- attack: ', attack_client_with_more_than_16_req)
  console.log('- normal: ', normal_client_with_more_than_16_req)
  console.log('------------------------')
  console.log('Client with more than 32 requests:')
  console.log('- attack: ', attack_client_with_more_than_32_req)
  console.log('- normal: ', normal_client_with_more_than_32_req)
}

getMetadata()
