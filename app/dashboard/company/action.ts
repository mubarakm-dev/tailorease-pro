"use server"

import { requireActiveStaff } from "@/app/libs/auth"
import { prisma } from "@/app/libs/prisma"
import { updateCompanyDetailsSchema } from "@/app/libs/schemas/authSchema"
import { revalidatePath } from "next/cache"

export type CompanyUpdateState = {
    success: boolean
    error: string | null,
    message?: string

}


export const updateCompanyDetails = async (prevState: CompanyUpdateState, formData: FormData): Promise<CompanyUpdateState> => {
    const session = await requireActiveStaff()
    if (session.role !== "SUPER_ADMIN") {
        return {
            success: false,
            error: "Un-authorised"
        }
    }
    const validation = updateCompanyDetailsSchema.safeParse({
        companyName: formData.get("companyName"),
        ownerFullname: formData.get("ownerFullname"),
        ownerPhone: formData.get("ownerPhone"),

    })
    if (!validation.success) {
        return {
            error: validation.error.issues[0].message,
            success: false
        }
    }

    const { companyName, ownerPhone, ownerFullname } = validation.data



    await prisma.$transaction([
        prisma.company.update({
            where: { id: session.companyId },
            data: { companyName },
        }),
        prisma.staff.update({
            where: { id: session.staffId },  
            data: {
                ...(ownerFullname ? { fullName: ownerFullname } : {}),
                ...(ownerPhone ? { phone: ownerPhone } : {}),
            },
        }),
    ])

    revalidatePath("/dashboard", "layout")
    return { success: true, error: null, message: "Company updated" }



}