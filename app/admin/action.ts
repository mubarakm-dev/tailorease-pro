"use server"

import { clearAdminSession, isAuthAdmin } from "@/app/libs/adminSession"
import { prisma } from "@/app/libs/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export const adminLogout = async () => {
    await clearAdminSession()
    redirect("/admin/login")
}

export const approveCompany = async (companyId: string) => {
    // server-side authorization: a server action is a public endpoint,
    // so it must guard itself even though the proxy protects the page.
    await isAuthAdmin()

    // approve the company AND its owner (SUPER_ADMIN) staff together —
    // login checks both, and the owner has no one above them to approve them.
    await prisma.$transaction([
        prisma.company.update({
            where: { id: companyId },
            data: { status: "APPROVED" },
        }),
        prisma.staff.updateMany({
            where: { companyId, role: "SUPER_ADMIN" },
            data: { status: "APPROVED" },
        }),
    ])

    revalidatePath("/admin")
}

export const rejectCompany = async (companyId: string) => {
    await isAuthAdmin()

    await prisma.company.update({
        where: { id: companyId },
        data: { status: "REJECTED" },
    })

    revalidatePath("/admin")
}


export const suspendCompany = async(companyId:string) =>{
    await isAuthAdmin()
    await prisma.company.update({
        where:{id: companyId},
        data:{status: "SUSPENDED"}
    })

      revalidatePath("/admin")

}

export const reactivateCompany = async(companyId:string) =>{
    await isAuthAdmin()
    await prisma.company.update({
        where:{id: companyId},
        data:{status: "APPROVED"}
    })

      revalidatePath("/admin")

}
