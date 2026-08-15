"use server"

import { prisma } from "@/app/libs/prisma"
import { sendPasswordResetEmail } from "@/app/libs/email"
import { cleanupExpiredPasswordResetTokens } from "@/app/libs/tokenCleanup"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export type ForgotPasswordState = {
  success: boolean
  error: string | null
  message?: string
}

export type ResetPasswordState = {
  success: boolean
  error: string | null
}

export const requestPasswordReset = async (prevState: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> => {
  const email = formData.get("email")?.toString().trim()

  if (!email) {
    return { success: false, error: "Email is required" }
  }

  if (!email.includes("@")) {
    return { success: false, error: "Please enter a valid email" }
  }

  try {
    await cleanupExpiredPasswordResetTokens()

    const staff = await prisma.staff.findUnique({ where: { email } })

    if (!staff) {
      return {
        success: true,
        error: null,
        message: "If an account exists, a password reset link has been sent to your email."
      }
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.upsert({
      where: { staffId: staff.id },
      create: {
        staffId: staff.id,
        token,
        expiresAt
      },
      update: {
        token,
        expiresAt
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetLink = `${baseUrl}/forgot-password/${token}`

    try {
      await sendPasswordResetEmail(email, resetLink, staff.fullName)
    } catch (emailError) {
      console.error("Email send failed:", emailError)
      return {
        success: false,
        error: "Failed to send reset email. Please check that your email address is correct or try again later."
      }
    }

    return {
      success: true,
      error: null,
      message: "If an account exists, a password reset link has been sent to your email."
    }
  } catch (error) {
    console.error("Password reset error:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return {
      success: false,
      error: "Something went wrong. Please try again."
    }
  }
}

export const resetPassword = async (token: string, prevState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> => {
  const password = formData.get("password")?.toString()
  const confirmPassword = formData.get("confirmPassword")?.toString()

  if (!password || !confirmPassword) {
    return { success: false, error: "Both fields are required" }
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" }
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { staff: true }
    })

    if (!resetToken) {
      return { success: false, error: "Invalid or expired reset link" }
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } })
      return { success: false, error: "Reset link has expired" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.staff.update({
      where: { id: resetToken.staff.id },
      data: { passwordHash: hashedPassword }
    })

    await prisma.passwordResetToken.delete({ where: { token } })

    redirect("/login?reset=success")
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Reset password error:", error)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
