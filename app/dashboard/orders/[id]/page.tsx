import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import OrderStatusBadge from "../../components/OrderStatusBadge"
import SubmitButton from "@/app/components/SubmitButton"
import ConfirmButton from "@/app/components/ConfirmButton"
import { advanceOrderStatus, prevOrderStatus } from "./action"
import { nextStatus, prevStatus, STATUS_LABELS } from "./flow"
import PhotoUpload from "./PhotoUpload"
import PhotoGrid from "./PhotoGrid"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await isAuth()

    const order = await prisma.order.findFirst({
        where: { id, companyId: session.companyId },
        select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            notes: true,
            createdAt: true,
            customer: { select: { id: true, fullName: true, phone: true, email: true } },
            staff: { select: { fullName: true } },
            measurement: {
                select: {
                    id: true,
                    snapshot: true,
                    values: true,
                    unit: true,
                    createdAt: true,
                    template: { select: { name: true } }
                }
            },
            photos: {
                orderBy: { uploadedAt: "desc" },
                select: {
                    id: true,
                    url: true,
                    caption: true,
                    uploadedAt: true,
                    uploadedByStaff: { select: { fullName: true } },
                },
            },
            statusHistory: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    status: true,
                    note: true,
                    createdAt: true,
                    updatedBy: { select: { fullName: true } },
                },
            },
        },
    })

    if (!order) notFound()

    const isAdmin = session.role === "SUPER_ADMIN"
    const next = nextStatus(order.status)
    const prev = prevStatus(order.status)
    const notes = order.notes as { text?: string }
    const measurement = order.measurement as any

    return (
        <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
            <div>
                <Link href={`/dashboard/customers/${order.customer.id}`} className="text-sm text-[#b07c34]">
                    ← {order.customer.fullName}
                </Link>
                <div className="flex items-center gap-3 mt-2">
                    <h1 className="text-2xl font-semibold">{order.title}</h1>
                    <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-gray-500 text-sm mt-1">
                    {order.customer.phone}
                    {order.amount != null ? ` · ₦${order.amount.toLocaleString()}` : ""}
                    {` · by ${order.staff.fullName}`}
                </p>
            </div>

            {notes.text && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-sm text-gray-700">
                    {notes.text}
                </div>
            )}

            {measurement && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h2 className="font-semibold text-sm mb-4">Measurements</h2>
                    <div className="flex flex-col gap-3">
                        <div className="text-xs text-gray-500">
                            <p>{measurement.template.name} — {new Date(measurement.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Object.entries(measurement.values as Record<string, any>).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                    <p className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                                    <p className="font-semibold text-gray-800">{value} {measurement.unit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold">Current stage: {STATUS_LABELS[order.status]}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {next ? `Next: ${STATUS_LABELS[next]}` : "This order is complete."}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    
                    {prev &&
                        (order.status === "COMPLETED" && !isAdmin ? (
                            <p className="text-xs text-gray-400 text-right">Only an admin can move this back.</p>
                        ) : (
                            <ConfirmButton
                                action={prevOrderStatus.bind(null, order.id)}
                                className="bg-gray-100 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-200 whitespace-nowrap"
                                title={`Move back to ${STATUS_LABELS[prev]}?`}
                                message={`This reverts the order from ${STATUS_LABELS[order.status]} to ${STATUS_LABELS[prev]}. The change is recorded in the status history.`}
                                confirmText="Move back"
                                pendingText="Updating…"
                            >
                                Move back to {STATUS_LABELS[prev]}
                            </ConfirmButton>
                        ))}


                    {next &&
                        (next === "COMPLETED" && !isAdmin ? (
                            <p className="text-xs text-gray-400 text-right">Only an admin can mark this complete.</p>
                        ) : next === "COMPLETED" ? (
                            <ConfirmButton
                                action={advanceOrderStatus.bind(null, order.id)}
                                className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 whitespace-nowrap"
                                title="Mark this order complete?"
                                message={order.customer.email
                                    ? `${order.customer.fullName} will be emailed that their order is ready for pickup.`
                                    : "This marks the order complete. (No email — this customer has no email on file.)"}
                                confirmText="Mark complete"
                                pendingText="Updating…"
                            >
                                Advance to {STATUS_LABELS[next]}
                            </ConfirmButton>
                        ) : (
                            <form action={advanceOrderStatus.bind(null, order.id)}>
                                <SubmitButton className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 whitespace-nowrap" pendingText="Updating…">
                                    Advance to {STATUS_LABELS[next]}
                                </SubmitButton>
                            </form>
                        ))}
                </div>
            </div>

            <PhotoGrid photos={order.photos} orderId={order.id} />

            <PhotoUpload orderId={order.id} />

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm">Status history</h2>
                </div>
                {order.statusHistory.map((h) => (
                    <div key={h.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-b-0">
                        <OrderStatusBadge status={h.status} />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm">{h.note}</p>
                            <p className="text-xs text-gray-400">
                                by {h.updatedBy.fullName} · {h.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    )
}
