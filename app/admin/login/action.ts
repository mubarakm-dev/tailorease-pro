"use server"
import { setAdminSession } from "@/app/libs/adminSession"
import { loginSchema } from "@/app/libs/schemas/authSchema"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"



export type AdminLoginState = {
    success: boolean
    error: string | null

}
export const adminLogin = async (prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> => {

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
        if (email !== process.env.ADMIN_EMAIL) {
            return { error: "Invalid credentials", success: false }
        }

        const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!)

        if (!isMatch) {
            return { error: "Invalid credentials", success: false }
        }

        await setAdminSession({
            email,
            role: "PLATFORM_ADMIN"
        })
    } catch (error) {
          return { error: "Something went wrong", success: false }

    }

    redirect("/admin")

}