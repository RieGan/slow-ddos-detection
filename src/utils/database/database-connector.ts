import { Prisma, PrismaClient } from "@prisma/client"
import { Client, ClientInput, Log, LogInput } from "./entity"

const prisma = new PrismaClient()

export const getAllClients = async (minLogs?: number) => {
  if (minLogs)
    return await prisma.client.findMany({
      where: {
        log: {
          some: {
            id: {
              gt: minLogs,
            },
          },
        },
      },
    })
  return await prisma.client.findMany()
}

export const getAllLogs = async (statusCode: number) => {
  return await prisma.log.findMany({
    where: {
      status_code: statusCode,
    },
  })
}

export const getAllBlacklistedClients = async () => {
  return await prisma.blacklist.findMany()
}

export const getLogs = async (clientIdentifier: string) => {
  return await prisma.log.findMany({
    where: {
      client_identifier: clientIdentifier,
    },
    orderBy: {
      timestamp: "asc",
    },
  })
}

export const isClientBlacklisted = async (identifier: string) => {
  const client = await prisma.blacklist.findUnique({
    where: {
      identifier,
    },
  })

  return client !== null
}

export const blacklistClient = async (identifier: string) => {
  await prisma.blacklist.create({
    data: {
      identifier,
    },
  })
}

export const blacklistClients = async (identifiers: string[]) => {
  const clients = identifiers.map((identifier) => ({
    identifier,
  }))

  await prisma.blacklist.createMany({
    data: clients,
    skipDuplicates: true,
  })

  await prisma.client.updateMany({
    where: {
      identifier: {
        in: clients.map((client) => client.identifier),
      },
    },
    data: {
      is_blacklisted: true,
    },
  })
}

export const getLatestClientLog = async (minLogs?: number) => {
  if (minLogs)
    return await prisma.client.findFirst({
      where: {
        log: {
          some: {
            id: {
              gt: minLogs,
            },
          },
        },
      },
      include: {
        log: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    })
  return await prisma.client.findFirst({
    orderBy: {
      updated_at: "desc",
    },
  })
}

export const getCountLatestClientLog = async (
  clientCount: number,
  logCount?: number,
  latestTimestamp?: Date,
) => {
  if (logCount) {
    // get clients with at least minLogs logs
    const clients = latestTimestamp
      ? await prisma.$queryRaw<{ identifier: string }[]>`
        SELECT client.identifier
        FROM client
        LEFT JOIN log ON client.identifier = log.client_identifier
        WHERE log.timestamp > ${latestTimestamp} AND client.is_blacklisted = false
        GROUP BY client.identifier
        HAVING COUNT(log.id) > ${logCount}
        ORDER BY updated_at DESC
        LIMIT ${clientCount}
      `
      : await prisma.$queryRaw<{ identifier: string }[]>`
        SELECT client.identifier
        FROM client
        LEFT JOIN log ON client.identifier = log.client_identifier
        WHERE client.is_blacklisted = false
        GROUP BY client.identifier
        HAVING COUNT(log.id) > ${logCount}
        ORDER BY updated_at DESC
        LIMIT ${clientCount}
      `

    if (clients.length === 0) return []
    return await prisma.client.findMany({
      where: {
        identifier: {
          in: clients.map((client) => client.identifier),
        },
      },
      include: {
        log: true,
      },
    })
  }

  return await prisma.client.findMany({
    orderBy: {
      updated_at: "desc",
    },
    take: clientCount,
    include: {
      log: true,
    },
  })
}

export const addClientLog = async (
  clientData: ClientInput,
  logData: LogInput,
) => {
  try {
    return await prisma.client.upsert({
      where: {
        identifier: clientData.identifier,
      },
      update: {
        log: {
          create: {
            timestamp: logData.timestamp,
            response_time: logData.response_time,
            total_time: logData.total_time,
            header_size: logData.header_size,
            body_size: logData.body_size,
            method: logData.method,
            url: logData.url,
            status_code: logData.status_code,
          },
        },
        updated_at: logData.timestamp,
      },
      create: {
        identifier: clientData.identifier,
        log: {
          create: {
            timestamp: logData.timestamp,
            response_time: logData.response_time,
            total_time: logData.total_time,
            header_size: logData.header_size,
            body_size: logData.body_size,
            method: logData.method,
            url: logData.url,
            status_code: logData.status_code,
          },
        },
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2024") {
        console.log(`${new Date()} P2024: connection pool is full`)
      } else {
        throw error
      }
    }
  }
}
