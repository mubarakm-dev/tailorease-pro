"use server"

import bcrypt from "bcryptjs";
import { prisma } from "../libs/prisma";
import { loginSchema } from "../libs/schemas/authSchema";
import { setSession } from "../libs/session";
import { redirect } from "next/navigation";

export type LoginState = {
  success: boolean
  error: string | null
  needsVerification?: boolean
  email?: string
}



export const login = async (prevState: LoginState, formData: FormData):Promise<LoginState> => {

    const validation = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password")
    })

    if (!validation.success) {
        return {
            error: validation.error.issues[0].message,
            success: false
        }
    }
    const { email, password } = validation.data

    try {
        const staff = await prisma.staff.findUnique({
            where: { email },
            include: { company: true }
        })

        if (!staff) {
            return {
                error: "Invalid credentials",
                success: false

            }
        }

        const isMatch = await bcrypt.compare(password, staff.passwordHash)
        if (!isMatch) {
            return {
                error: "Invalid credentials",
                success: false

            }
        }

          if (staff.company.status === 'UNVERIFIED' || staff.status === 'UNVERIFIED') {
            return {
                error: "Your account has not been verified",
                success: false,
                needsVerification: true,
                email,
            }
        }

        if (staff.company.status === 'PENDING') {
            return {
                error: "Your company is awaiting platform approval",
                success: false
            }

        }
        if (staff.company.status === 'REJECTED') {
            return {
                error: "Your company registration was rejected, contact support",
                success: false
            }

        }
        if (staff.company.status === 'SUSPENDED') {
            return {
                error: "Your company account has been suspended, contact support",
                success: false
            }

        }

        if (staff.status === 'PENDING') {
            return {
                error: "Your account is awaiting approval from your company admin",
                success: false
            }

        }
        if (staff.status === 'REJECTED') {
            return {
                error: "Your account has been rejected contact your company admin",
                success: false
            }
        }
        if (staff.status === 'SUSPENDED') {
            return {
                error: "Your account has been suspended, contact your company admin",
                success: false
            }

        }

        await setSession({
            staffId: staff.id,
            companyId: staff.companyId,
            role: staff.role,
            status: staff.status,
        })


    } catch (error) {
        return { error: "Something went wrong", success: false }
    }

    redirect("/dashboard")

}