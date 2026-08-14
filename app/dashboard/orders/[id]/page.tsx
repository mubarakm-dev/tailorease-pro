import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import OrderStatusBadge from "../../components/OrderStatusBadge"
import ConfirmButton from "@/app/components/ConfirmButton"
import PhotoUpload from "./PhotoUpload"
import PhotoGrid from "./PhotoGrid"
import { PaymentSection } from "./PaymentSection"
import { getOrderUrgency, getUrgencyLabel, getUrgencyColor } from "@/app/libs/orderUrgency"
import { createAmendment } from "./amendmentAction"
import { duplicateOrder } from "./duplicateAction"
import { OrderStatusFlow } from "./OrderStatusFlow"
import OrderEditForm from "./OrderEditForm"
import MeasurementEditForm from "./MeasurementEditForm"

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
            type: true,
            paymentStatus: true,
            dueDate: true,
            notes: true,
            createdAt: true,
            parentOrderId: true,
            customer: { select: { id: true, fullName: true, phone: true, email: true } },
            staff: { select: { fullName: true } },
            parentOrder: { select: { id: true, title: true } },
            amendments: {
                select: { id: true, title: true, createdAt: true },
                orderBy: { createdAt: "asc" }
            },
            payments: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    amount: true,
                    paymentMethod: true,
                    notes: true,
                    createdAt: true
                }
            },
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
                    {order.type === "AMENDMENT" && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            Amendment
                        </span>
                    )}
                </div>
                <p className="text-gray-500 text-sm mt-1">
                    {order.customer.phone}
                    {order.amount != null ? ` · ₦${order.amount.toLocaleString()}` : ""}
                    {` · by ${order.staff.fullName}`}
                </p>

                {/* Show original order link if this is an amendment */}
                {order.parentOrderId && order.parentOrder && (
                    <Link
                        href={`/dashboard/orders/${order.parentOrder.id}`}
                        className="text-sm text-[#b07c34] hover:underline mt-2 inline-block"
                    >
                        View original: {order.parentOrder.title} →
                    </Link>
                )}

                {/* Duplicate Order button */}
                {order.type !== "AMENDMENT" && (
                    <div className="mt-4">
                        <ConfirmButton
                            action={duplicateOrder.bind(null, order.id)}
                            className="text-sm font-medium px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="Create a duplicate of this order?"
                            message={`A copy of "${order.title}" will be created with the same measurements, price, and notes. You can edit it before saving.`}
                            confirmText="Duplicate Order"
                            pendingText="Creating…"
                        >
                            Duplicate Order
                        </ConfirmButton>
                    </div>
                )}
            </div>

            {order.dueDate && (() => {
                const urgency = getOrderUrgency(order.dueDate)
                return (
                    <div className={`rounded-xl border p-4 ${getUrgencyColor(urgency)}`}>
                        <p className="text-sm font-semibold">Due: {new Date(order.dueDate).toLocaleString()}</p>
                        <p className="text-xs mt-1">{getUrgencyLabel(urgency)}</p>
                    </div>
                )
            })()}

            {notes.text && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-sm text-gray-900 placeholder:text-gray-500">
                    {notes.text}
                </div>
            )}

            <OrderEditForm
                orderId={order.id}
                title={order.title}
                amount={order.amount}
                dueDate={order.dueDate}
                notes={notes}
                isNew={order.status === "RECEIVED"}
            />

            {measurement && (
                <MeasurementEditForm
                    orderId={order.id}
                    measurementId={measurement.id}
                    templateName={measurement.template.name}
                    unit={measurement.unit}
                    values={measurement.values as Record<string, any>}
                    isNew={order.status === "RECEIVED"}
                />
            )}

            <OrderStatusFlow currentStatus={order.status} orderId={order.id} />

            <div className="flex items-center justify-center">
                <Link href={`/invoice/orders/${order.id}`} className="text-sm text-[#b07c34] hover:underline font-medium">
                    View Invoice
                </Link>
            </div>

            <PhotoGrid photos={order.photos} orderId={order.id} />

            <PhotoUpload orderId={order.id} />

            <PaymentSection
                orderId={order.id}
                orderAmount={order.amount}
                payments={order.payments}
            />

            {/* Amendment Section */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-sm">Amendment History</h2>
                    {order.type !== "AMENDMENT" && order.status === "COMPLETED" && (
                        <ConfirmButton
                            action={createAmendment.bind(null, order.id)}
                            className="text-xs font-medium px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            title="Create amendment?"
                            message={`A new amendment of "${order.title}" will be created as a linked copy. You can edit the amendment independently while keeping the original intact.`}
                            confirmText="Create Amendment"
                            pendingText="Creating…"
                        >
                            Create Amendment
                        </ConfirmButton>
                    )}
                </div>
                {order.amendments.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-gray-500 text-center">
                        {order.type === "AMENDMENT" ? "This is an amendment." : "No amendments yet."}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {order.amendments.map((amendment: any) => (
                            <Link
                                key={amendment.id}
                                href={`/dashboard/orders/${amendment.id}`}
                                className="px-5 py-3 hover:bg-gray-50 transition flex items-center justify-between group"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#b07c34]">
                                        {amendment.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Created {new Date(amendment.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                                    </p>
                                </div>
                                <span className="text-gray-400 group-hover:text-[#b07c34] text-xs ml-2">→</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm">Status history</h2>
                </div>
                {order.statusHistory.map((h: any) => (
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
