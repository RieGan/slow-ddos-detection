export const models = ["cnn1d", "lstm", "lstm2"] as const
export const counts = [4, 8, 16, 32] as const

export type ModelType = typeof models[number]
export type ModelCount = `${ModelType}-${typeof counts[number]}`

