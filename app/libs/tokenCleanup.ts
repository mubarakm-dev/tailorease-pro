import "server-only"
import { prisma } from "./prisma"

export async function cleanupExpiredPasswordResetTokens() {
  try {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    console.log(`Cleaned up ${result.count} expired password reset tokens`)
    return result.count
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error)
    return 0
  }
}
