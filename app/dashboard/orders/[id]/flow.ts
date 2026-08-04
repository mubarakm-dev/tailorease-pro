import type { OrderStatus } from "@prisma/client"

// the tailoring workflow, in order
export const FLOW: OrderStatus[] = ["RECEIVED", "CUT_IN_PROGRESS", "SEWING_IN_PROGRESS", "FINISHING", "COMPLETED"]

export const STATUS_LABELS: Record<OrderStatus, string> = {
    RECEIVED: "Received",
    CUT_IN_PROGRESS: "Cutting",
    SEWING_IN_PROGRESS: "Sewing",
    FINISHING: "Finishing",
    COMPLETED: "Completed",
}

// the next stage after `current`, or null if already COMPLETED
export function nextStatus(current: OrderStatus): OrderStatus | null {
    const i = FLOW.indexOf(current)
    return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null
}
