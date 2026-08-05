import "server-only"
import { after } from "next/server"
import { prisma } from "./prisma"

type LogActivityInput = {
    companyId: string
    staffId?: string | null
    action: string
    entityType?: string 
    entityId?: string
    summary: string 
}


export function logActivity(input: LogActivityInput): void {
    after(async () => {
        try {
            await prisma.activityLog.create({
                data: {
                    companyId: input.companyId,
                    staffId: input.staffId ?? null,
                    action: input.action,
                    entityType: input.entityType ?? null,
                    entityId: input.entityId ?? null,
                    summary: input.summary,
                },
            })
        } catch (error) {
            console.error("logActivity failed", error)
        }
    })
}
