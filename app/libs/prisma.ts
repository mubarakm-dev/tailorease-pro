import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, Prisma } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function isConnectionError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P1017") return true
  const message = (e as { message?: string })?.message ?? ""
  return /closed the connection|connection reset|ECONNRESET|connection terminated/i.test(message)
}

function createPrismaClient() {
  // App runtime uses the transaction pooler (DATABASE_URL, :6543); migrations use DIRECT_URL via prisma.config.ts.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const base = new PrismaClient({ adapter })

  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        const MAX_ATTEMPTS = 3
        let lastError: unknown
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            return await query(args)
          } catch (error) {
            lastError = error
            if (attempt < MAX_ATTEMPTS && isConnectionError(error)) {
              // brief backoff so the pool can establish a fresh connection, then retry
              await new Promise((resolve) => setTimeout(resolve, 150 * attempt))
              continue
            }
            throw error
          }
        }
        throw lastError
      },
    },
  })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
