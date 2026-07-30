"use server"
import { sendOTPEmail } from "@/app/libs/email"
import { createOtp } from "@/app/libs/otp"
import { prisma } from "@/app/libs/prisma"
import { registerStaffSchema } from "@/app/libs/schemas/authSchema"
import bcrypt from "bcryptjs"

export type StaffRegistrationState = {
    success: boolean
    error: string | null
    message?: string
    companyCode?: string,
    fullName?: string,
    email?: string
}


export const registerStaff = async (prevState: StaffRegistrationState, formData: FormData): Promise<StaffRegistrationState> => {
    const validation = registerStaffSchema.safeParse({
        companyCode: formData.get("companyCode"),
        email: formData.get("email"),
        fullName: formData.get("fullName"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        phone: formData.get("phone")

    })
    if (!validation.success) {
        return {
            error: validation.error.issues[0].message,
            success: false
        }
    }

    const { companyCode, email, password, fullName, phone } = validation.data
    try {
        const company = await prisma.company.findUnique({
            where: { companyCode },
            select: {
                id: true,
                status: true,
                companyCode: true
            }

        })

        if (!company) {
            return {
                error: "Invalid Company Code",
                success: false
            }
        }

        if (company.status !== "APPROVED") {
            return {
                error: "This company is not accepting staff",
                success: false
            }
        }

        const existingStaff = await prisma.staff.findUnique({
            where: { email }
        })
        if (existingStaff) {
            return {
                error: "staff email already exists",
                success: false,
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const staff = await prisma.staff.create({
            data: {
                companyId: company.id,
                fullName,
                email,
                phone: phone || null,
                passwordHash: hashedPassword,
                role: "STAFF",
                status: "UNVERIFIED",
                
            }
        })

        const code = await createOtp(email)
        try {
            await sendOTPEmail(email, code)
        } catch (error) {

            console.error("Failed to send OTP email during registration:", error)
        }

        return {
            success: true,
            error: null,
            message: "Staff registered. Check your email for the verification code.",
            companyCode: company.companyCode,
            email: email,
        }

    }
    catch (error) {
        return {
            error: "Something went wrong",
            success: false
        }
    }




}