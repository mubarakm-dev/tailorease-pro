"use server"

import { requireActiveStaff } from "@/app/libs/auth"
import { prisma } from "@/app/libs/prisma"
import { supabase } from "@/app/libs/supabase"
import { updateCompanyDetailsSchema } from "@/app/libs/schemas/authSchema"
import { revalidatePath } from "next/cache"

export type CompanyUpdateState = {
    success: boolean
    error: string | null,
    message?: string

}


export const updateCompanyDetails = async (prevState: CompanyUpdateState, formData: FormData): Promise<CompanyUpdateState> => {
    try {
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

        // Handle optional image upload
        let companyImageUrl: string | undefined
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

        await prisma.$transaction([
            prisma.company.update({
                where: { id: session.companyId },
                data: {
                    companyName,
                    ...(companyImageUrl ? { companyImage: companyImageUrl } : {}),
                },
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
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update company details"
        return { success: false, error: message }
    }



}