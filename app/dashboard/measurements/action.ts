"use server"
import { requireActiveStaff } from "@/app/libs/auth"
import { prisma } from "@/app/libs/prisma"
import { createTemplateSchema } from "@/app/libs/schemas/authSchema"
import { logActivity } from "@/app/libs/activity"
import { revalidatePath } from "next/cache"

export type MeasurementTemplateCreateState = {
    success: boolean,
    error: string | null,
    message?: string
}
export const createTemplate = async (prevState: MeasurementTemplateCreateState, formData: FormData): Promise<MeasurementTemplateCreateState> => {
    const session = await requireActiveStaff()
    if (session.role !== "SUPER_ADMIN") {
        return { error: "Only an admin can create templates", success: false }
    }

    const validation = createTemplateSchema.safeParse({
        name: formData.get("name"),
        fields: formData.get("fields")

    })

    if (!validation.success) {
        return {
            error: validation.error.issues[0].message,
            success: false
        }
    }

    const fields = validation.data.fields
        .split(/[\n,]/)
        .map((f) => f.trim())
        .filter(Boolean)
    if (fields.length === 0) return { error: "Add at least one field", success: false }

    let templateId: string
    try {
        const template = await prisma.measurementTemplate.create({
            data: {
                companyId: session.companyId,
                name: validation.data.name,
                fieldDefinitions: fields
            },
        })
        templateId = template.id
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "template.create",
        entityType: "Template",
        entityId: templateId,
        summary: `created measurement template "${validation.data.name}"`,
    })

    revalidatePath("/dashboard/measurements")
    return { success: true, error: null, message: "Template created" }
}