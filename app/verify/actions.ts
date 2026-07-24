"use server"

import { prisma } from "../libs/prisma"
import { createOtp, verifyOtp } from "../libs/otp"
import { sendOTPEmail } from "../libs/email"
import { verifyOtpSchema, resendOtpSchema } from "../libs/schemas/authSchema"

export type VerifyState = {
    success: boolean
    error: string | null
    message?: string
    canResend?: boolean
}

export const verifyCode = async (prevState: VerifyState, formData: FormData): Promise<VerifyState> => {
    const validation = verifyOtpSchema.safeParse({
        email: formData.get("email"),
        code: formData.get("code"),
    })

    if (!validation.success) {
        return { error: validation.error.issues[0].message, success: false }
    }

    const { email, code } = validation.data

    try {
        const result = await verifyOtp(email, code)

        if (!result.ok) {
            return { error: result.error, success: false, canResend: result.canResend }
        }

        // verified — move the owner (and their company) from UNVERIFIED to PENDING approval.
        // guarded on status so an already-approved account can't be knocked back.
        const staff = await prisma.staff.findUnique({ where: { email } })
        if (staff) {
            await prisma.$transaction([
                prisma.staff.updateMany({
                    where: { email, status: "UNVERIFIED" },
                    data: { status: "PENDING" },
                }),
                prisma.company.updateMany({
                    where: { id: staff.companyId, status: "UNVERIFIED" },
                    data: { status: "PENDING" },
                }),
            ])
        }

        return { success: true, error: null, message: "Email verified. Your company is now awaiting platform approval." }
    } catch (error) {
        return { error: "Something went wrong", success: false }
    }
}

export const resendCode = async (prevState: VerifyState, formData: FormData): Promise<VerifyState> => {
    const validation = resendOtpSchema.safeParse({
        email: formData.get("email"),
    })

    if (!validation.success) {
        return { error: validation.error.issues[0].message, success: false }
    }

    const { email } = validation.data

    try {
        const code = await createOtp(email)
        await sendOTPEmail(email, code)

        // stays on the form (success is reserved for a completed verification)
        return { success: false, error: null, message: "New code sent to your email", canResend: true }
    } catch (error) {
        return { error: "Failed to send a new code, please try again", success: false, canResend: true }
    }
}
