
"use server"
import { prisma } from "@/app/libs/prisma"
import { registerCompanySchema } from "../../libs/schemas/authSchema"
import { supabase } from "@/app/libs/supabase"
import bcrypt from "bcryptjs"
import { createOtp } from "@/app/libs/otp"
import { sendOTPEmail } from "@/app/libs/email"


export type RegisterCompanyState = {
    success: boolean
    error: string | null
    message?: string
    companyCode?: string,
    email?: string
}


const generateCompanyCode = async (): Promise<string> => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

    for (let i = 0; i < 10; i++) {
        let code = "TSE-"

        for (let j = 0; j < 6; j++) {
            const randomIndex = Math.floor(Math.random() * characters.length)
            code += characters[randomIndex]
        }


        const existing = await prisma.company.findUnique({
            where: { companyCode: code }
        })

        if (existing) {
            continue
        } else {
            return code
        }
    }

    throw new Error("Failed to generate company code")
}


export const registerCompany = async (prevState: RegisterCompanyState, formData: FormData): Promise<RegisterCompanyState> => {
    const validation = registerCompanySchema.safeParse({
        companyName: formData.get("companyName"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        ownerFullname: formData.get("ownerFullname"),
        ownerEmail: formData.get("ownerEmail"),
        ownerPhone: formData.get("ownerPhone")


    })

    if (!validation.success) {
        return {
            error: validation.error.issues[0].message,
            success: false
        }
    }
    const { companyName, email, password, ownerFullname, ownerEmail, ownerPhone } = validation.data

    try {
        // Handle optional image upload
        let companyImageUrl: string | null = null
        const imageFile = formData.get("companyImage") as File | null

        if (imageFile && imageFile.size > 0) {
            if (imageFile.size > 2 * 1024 * 1024) {
                return { error: "Image must be under 2MB", success: false }
            }
            if (!imageFile.type.startsWith("image/")) {
                return { error: "Must be an image file", success: false }
            }

            const fileName = `companies/${Date.now()}-${imageFile.name}`
            const buffer = await imageFile.arrayBuffer()

            try {
                const { error: uploadError } = await supabase.storage
                    .from("orders")
                    .upload(fileName, buffer, { contentType: imageFile.type })

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from("orders")
                    .getPublicUrl(fileName)
                companyImageUrl = publicUrl
            } catch (uploadErr) {
                console.error("Image upload failed:", uploadErr)
                return { error: "Failed to upload image", success: false }
            }
        }

        const existingCompany = await prisma.company.findUnique({
            where: { email }
        })

        if (existingCompany) {
            return {
                error: "Company email already exists",
                success: false,

            }
        }


        const existingStaff = await prisma.staff.findUnique({
            where: { email: ownerEmail }
        })
        if (existingStaff) {
            return {
                error: "owner email already exists",
                success: false,
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const companyCode = await generateCompanyCode()

        const result = await prisma.$transaction(async (tx: any) => {
            const company = await tx.company.create({

                data: {
                    companyCode,
                    companyName,
                    email,
                    passwordHash: hashedPassword,
                    status: "UNVERIFIED",
                    companyImage: companyImageUrl,
                }
            })

            const staff = await tx.staff.create({
                data: {
                    companyId: company.id,
                    fullName: ownerFullname,   
                    email: ownerEmail,
                    phone: ownerPhone,
                    passwordHash: hashedPassword,
                    role: "SUPER_ADMIN",
                    status: "UNVERIFIED",
                }
            })

            return { company, staff }

        })

        const code = await createOtp(ownerEmail)
        try {
            await sendOTPEmail(ownerEmail, code)
        } catch( error) {
            
            console.error("Failed to send OTP email during registration:", error)
        }

        return {
            success: true,
            error: null,
            message: "Company registered. Check your email for the verification code.",
            companyCode: result.company.companyCode,
            email: ownerEmail,
        }



    } catch (error) {
        console.error("Company registration error:", error)
        return { error: "Failed to register company. Please try again.", success: false }
    }
}