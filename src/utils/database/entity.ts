import type { getAllClients, getLogs } from "./database-connector"

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

// get type from promise

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

export type Client = UnwrapPromise<ReturnType<typeof getAllClients>>[0]
export type Log = UnwrapPromise<ReturnType<typeof getLogs>>[0]

export type ClientInput = Omit<
  Client,
  "id" | "created_at" | "updated_at" | "is_blacklisted"
>
export type LogInput = Omit<Log, "id" | "created_at" | "updated_at" | "client_identifier">
