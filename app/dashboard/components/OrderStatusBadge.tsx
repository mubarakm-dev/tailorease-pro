import type { OrderStatus } from "@prisma/client"

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
    RECEIVED: { label: "Received", className: "bg-blue-50 text-blue-700" },
    CUT_IN_PROGRESS: { label: "Cutting", className: "bg-indigo-50 text-indigo-700" },
    SEWING_IN_PROGRESS: { label: "Sewing", className: "bg-amber-50 text-amber-700" },
    FINISHING: { label: "Finishing", className: "bg-orange-50 text-orange-700" },
    COMPLETED: { label: "Completed", className: "bg-green-50 text-green-700" },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const meta = STATUS_META[status]
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${meta.className}`}>
            {meta.label}
        </span>
    )
}
