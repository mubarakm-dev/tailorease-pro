
"use server"
import { prisma } from "@/app/libs/prisma"
import { registerCompanySchema } from "../../libs/schemas/authSchema"
import bcrypt from "bcryptjs"


export type RegisterCompanyState = {
    success: boolean
    error: string | null
    message?: string
    companyCode?: string
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

        const result = await prisma.$transaction(async (tx) => {

            const company = await tx.company.create({
                data: {
                    companyCode,
                    companyName,
                    email,
                    passwordHash: hashedPassword,
                    status: "PENDING",
                    ownerFullname,
                    ownerEmail,
                    ownerPhone,
                }
            })

            const staff = await tx.staff.create({
                data: {
                    companyId: company.id,
                    fullName: ownerFullname,
                    email: ownerEmail,
                    passwordHash: hashedPassword,
                    role: "SUPER_ADMIN",
                    status: "PENDING",
                }
            })

            return { company, staff }

        })

        return {
            success: true,
            error: null,
            message: "Company registered successfully. Awaiting platform approval.",
            companyCode: result.company.companyCode,
        }

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message, success: false }
        }
        return { error: "Something went wrong", success: false }
    }
}