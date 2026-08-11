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
        .map((f: string) => f.trim())
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

export type MeasurementTemplateUpdateState = {
    success: boolean,
    error: string | null,
    message?: string
}
export const updateTemplate = async (prevState: MeasurementTemplateUpdateState, formData: FormData): Promise<MeasurementTemplateUpdateState> => {
    const session = await requireActiveStaff()
    if (session.role !== "SUPER_ADMIN") {
        return { error: "Only an admin can edit templates", success: false }
    }

    const id = formData.get("id")?.toString() ?? ""
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
        .map((f: string) => f.trim())
        .filter(Boolean)
    if (fields.length === 0) return { error: "Add at least one field", success: false }

    try {
        const result = await prisma.measurementTemplate.updateMany({
            where: { id, companyId: session.companyId },
            data: {
                name: validation.data.name,
                fieldDefinitions: fields
            }
        })
        if (result.count === 0) return { success: false, error: "Template not found" }
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "template.update",
        entityType: "Template",
        entityId: id,
        summary: `updated measurement template "${validation.data.name}"`,
    })

    revalidatePath("/dashboard/measurements")
    return { success: true, error: null, message: "Template updated" }
}

export const deleteTemplate = async (templateId: string) => {
    const session = await requireActiveStaff()
    if (session.role !== "SUPER_ADMIN") return

    const template = await prisma.measurementTemplate.findFirst({
        where: { id: templateId, companyId: session.companyId },
        select: { id: true, name: true, _count: { select: { measurements: true } } },
    })
    if (!template) return

    if (template._count.measurements > 0) return

    try {
        await prisma.measurementTemplate.delete({ where: { id: templateId } })
    } catch {
        return
    }

    logActivity({
        companyId: session.companyId,
        staffId: session.staffId,
        action: "template.delete",
        entityType: "Template",
        entityId: templateId,
        summary: `deleted measurement template "${template.name}"`,
    })

    revalidatePath("/dashboard/measurements")
}