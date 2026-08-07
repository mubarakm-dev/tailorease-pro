"use server"
import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { sendOTPEmail } from "@/app/libs/email"
import { createOtp } from "@/app/libs/otp"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export type ProfileState = {
  success: boolean
  error: string | null
  message?: string
}

export const updateStaffProfile = async (prevState: ProfileState, formData: FormData): Promise<ProfileState> => {
  const session = await isAuth()
  const staffId = session.staffId
  const companyId = session.companyId

  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string

  if (!fullName || fullName.trim().length < 3) {
    return { success: false, error: "Name must be at least 3 characters" }
  }
  if (!phone || phone.length !== 11) {
    return { success: false, error: "Phone must be exactly 11 characters" }
  }

  try {
   
    const staff = await prisma.staff.findFirst({
      where: { id: staffId }
    })

    if (!staff) {
      return { success: false, error: "Staff not found" }
    }

    const nameChanged = staff.fullName !== fullName.trim()
    const phoneChanged = staff.phone !== phone.trim()

    if (!nameChanged && !phoneChanged) {
      return { success: true, message: "No changes made" }
    }

    
    await prisma.staff.update({
      where: { id: staffId },
      data: {
        fullName: fullName.trim(),
        phone: phone.trim()
      }
    })

    const changes = []
    if (nameChanged) changes.push("name")
    if (phoneChanged) changes.push("phone")

    await prisma.activityLog.create({
      data: {
        companyId,
        staffId,
        action: "UPDATE_PROFILE",
        entityType: "Staff",
        entityId: staffId,
        summary: `Updated ${changes.join(" and ")}`
      }
    })

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Profile update error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export const requestPasswordChangeOTP = async (prevState: ProfileState, formData: FormData): Promise<ProfileState> => {
  const session = await isAuth()
  const staffId = session.staffId
  const email = formData.get("email") as string

  try {
    const staff = await prisma.staff.findFirst({
      where: { id: staffId }
    })

    if (!staff) {
      return { success: false, error: "Staff not found" }
    }

    const code = await createOtp(staff.email)
    await sendOTPEmail(staff.email, code)


    return { success: true, message: "OTP sent to your email" }
  } catch (error) {
    console.error("OTP request error:", error)
    return { success: false, error: "Failed to send OTP" }
  }
}

export const verifyOTPAndChangePassword = async (prevState: ProfileState, formData: FormData): Promise<ProfileState> => {
  const session = await isAuth()
  const staffId = session.staffId

  const currentPassword = formData.get("currentPassword") as string
  const otp = formData.get("otp") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string


  if (!currentPassword) {
    return { success: false, error: "Current password is required" }
  }
  if (!otp || otp.length !== 6) {
    return { success: false, error: "Invalid OTP format" }
  }
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters" }
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  try {
    const staff = await prisma.staff.findFirst({
      where: { id: staffId }
    })

    if (!staff) {
      return { success: false, error: "Staff not found" }
    }


    const passwordMatch = await bcrypt.compare(currentPassword, staff.passwordHash)
    if (!passwordMatch) {
      return { success: false, error: "Current password is incorrect" }
    }

    const otpRecord = await prisma.verificationCode.findFirst({
      where: { email: staff.email, code: otp }
    })

    if (!otpRecord) {
      return { success: false, error: "Invalid OTP" }
    }

    if (new Date() > otpRecord.expiresAt) {
      return { success: false, error: "OTP has expired" }
    }

    if (otpRecord.attempts >= 3) {
      return { success: false, error: "Too many failed attempts" }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.staff.update({
      where: { id: staffId },
      data: { passwordHash: hashedPassword }
    })

    
    await prisma.verificationCode.delete({
      where: { id: otpRecord.id }
    })

    return { success: true, message: "Password changed successfully. Please sign in with your new password" }
  } catch (error) {
    console.error("Password change error:", error)
    return { success: false, error: "Failed to change password" }
  }
}

export const logoutStaff = async () => {
  try {
    const session = await isAuth()
    const companyId = session.companyId
    const staffId = session.staffId

 
    await prisma.activityLog.create({
      data: {
        companyId,
        staffId,
        action: "LOGOUT",
        entityType: "Staff",
        entityId: staffId,
        summary: "Logged out"
      }
    })

  
    redirect("/login")
  } catch (error) {
    console.error("Logout error:", error)
    redirect("/login")
  }
}
