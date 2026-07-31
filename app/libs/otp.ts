import "server-only"
import { prisma } from "./prisma"
import { randomInt } from "crypto"

const OTP_LENGTH = 6
const OTP_TTL_MINUTES = 10
export const MAX_OTP_ATTEMPTS = 5


export const generateOtpCode = (): string => {
    let code = ""
    for (let i = 0; i < OTP_LENGTH; i++) {
        code += randomInt(0, 10).toString()
    }
    return code
}


export const createOtp = async (email: string): Promise<string> => {
    const code = generateOtpCode()
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

    await prisma.$transaction([
        prisma.verificationCode.deleteMany({ where: { email } }),
        prisma.verificationCode.create({ data: { email, code, expiresAt } }),
    ])

    return code
}

export type VerifyResult =
    | { ok: true }
    | { ok: false; error: string; canResend: boolean }

// check a submitted code against the latest stored code for the email
export const verifyOtp = async (email: string, code: string): Promise<VerifyResult> => {
    const record = await prisma.verificationCode.findFirst({
        where: { email },
        orderBy: { createdAt: "desc" },
    })

    if (!record) {
        return { ok: false, error: "No verification code found, request a new one", canResend: true }
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
        return { ok: false, error: "Too many attempts, request a new code", canResend: true }
    }

    if (record.expiresAt.getTime() < Date.now()) {
        return { ok: false, error: "Code has expired, request a new one", canResend: true }
    }

    if (record.code !== code) {
        const updated = await prisma.verificationCode.update({
            where: { id: record.id },
            data: { attempts: { increment: 1 } },   // DB adds 1, atomically
        })

        if (updated.attempts >= MAX_OTP_ATTEMPTS) {
            return { ok: false, error: "Too many attempts, request a new code", canResend: true }
        }
        return { ok: false, error: "Invalid verification code", canResend: false }
    }

    // success — clear all codes for this email
    await prisma.verificationCode.deleteMany({ where: { email } })
    return { ok: true }
}
