"use server"

import { clearSession, isAuth } from "@/app/libs/session"
import { redirect } from "next/navigation"

import { prisma } from "../libs/prisma"
import { revalidatePath } from "next/cache"

export const logout = async () => {
    await clearSession()
    redirect("/login")
}

export const approveStaff = async (staffId: string) => {
    const session = await isAuth()

    if (session.role !== "SUPER_ADMIN") {
        return

    }

    await prisma.staff.updateMany({
        where: { id: staffId, companyId: session.companyId },
        data: {
            status: "APPROVED"
        }
    })

    revalidatePath("/dashboard")
}


export const rejectStaff = async (staffId: string) => {

    const session = await isAuth()

    if (session.role !== "SUPER_ADMIN") {
        return

    }

    await prisma.staff.updateMany({
        where: { id: staffId, companyId: session.companyId },
        data: {
            status: "REJECTED"
        }
    })

    revalidatePath("/dashboard")
}