import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import Link from "next/link"
import OrderStatusBadge from "../components/OrderStatusBadge"
import SearchBox from "../components/SearchBox"
import { FLOW, STATUS_LABELS } from "./[id]/flow"
import type { OrderStatus } from "@prisma/client"
import { getOrderUrgency, getUrgencyLabel, getUrgencyColor } from "@/app/libs/orderUrgency"

const PER_PAGE = 20

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; customer?: string; page?: string; sort?: string }>
}) {
    const session = await isAuth()
    const sp = await searchParams

    const q = sp.q?.trim() || ""
    const status = FLOW.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined
    const customerId = sp.customer || undefined
    const page = Math.max(1, Number(sp.page) || 1)
    const sort = sp.sort === "due" ? "due" : "created"

    const where = {
        companyId: session.companyId,
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(q
            ? {
                  OR: [
                      { title: { contains: q, mode: "insensitive" as const } },
                      { customer: { fullName: { contains: q, mode: "insensitive" as const } } },
                  ],
              }
            : {}),
    }

    const [orders, total, activeCustomer] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: sort === "due"
              ? [{ dueDate: "asc" }, { createdAt: "desc" }]
              : { createdAt: "desc" },
            skip: (page - 1) * PER_PAGE,
            take: PER_PAGE,
            select: {
                id: true,
                title: true,
                status: true,
                amount: true,
                dueDate: true,
                createdAt: true,
                customer: { select: { fullName: true } },
            },
        }),
        prisma.order.count({ where }),
        // resolve the ?customer= filter to a name (tenant-scoped) so we can show + clear it
        customerId
            ? prisma.customer.findFirst({
                  where: { id: customerId, companyId: session.companyId },
                  select: { id: true, fullName: true },
              })
            : Promise.resolve(null),
    ])

    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))


    const link = (over: Record<string, string | number | undefined>) => {
        const p = new URLSearchParams()
        if (q) p.set("q", q)
        if (status) p.set("status", status)
        if (customerId) p.set("customer", customerId)
        if (sort) p.set("sort", sort)
        for (const [k, v] of Object.entries(over)) {
            if (v) p.set(k, String(v))
            else p.delete(k)
        }
        const s = p.toString()
        return `/dashboard/orders${s ? `?${s}` : ""}`
    }

    return (
        <div className="p-6 max-w-5xl mx-auto flex flex-col gap-5">
            <div>
                <h1 className="text-2xl font-semibold">Orders</h1>
                <p className="text-gray-500 text-sm mt-1">{total} total</p>
            </div>

            {activeCustomer && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#1b2233]/15 bg-[#1b2233]/5 px-4 py-2.5 text-sm">
                    <span>
                        Showing orders for <span className="font-semibold">{activeCustomer.fullName}</span>
                    </span>
                    <Link href={link({ customer: undefined })} className="text-[#b07c34] hover:underline whitespace-nowrap">
                        Clear ×
                    </Link>
                </div>
            )}

            <SearchBox placeholder="Search by order title or customer…" />


            <div className="flex flex-wrap gap-2 text-xs">
                <Link
                    href={link({ status: undefined, page: undefined })}
                    className={`px-3 py-1.5 rounded-full border ${!status ? "bg-[#1b2233] text-white border-[#1b2233]" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                    All
                </Link>
                {FLOW.map((s) => (
                    <Link
                        key={s}
                        href={link({ status: s, page: undefined })}
                        className={`px-3 py-1.5 rounded-full border ${status === s ? "bg-[#1b2233] text-white border-[#1b2233]" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                    >
                        {STATUS_LABELS[s]}
                    </Link>
                ))}
            </div>

            <div className="flex gap-2 text-xs">
                <Link
                    href={link({ sort: undefined, page: undefined })}
                    className={`px-3 py-1.5 rounded-full border ${sort === "created" ? "bg-[#b07c34] text-white border-[#b07c34]" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                    Created
                </Link>
                <Link
                    href={link({ sort: "due", page: undefined })}
                    className={`px-3 py-1.5 rounded-full border ${sort === "due" ? "bg-[#b07c34] text-white border-[#b07c34]" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                    Due date
                </Link>
            </div>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {orders.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-10 text-center">No orders found.</p>
                ) : (
                    orders.map((o) => {
                        const urgency = getOrderUrgency(o.dueDate)
                        return (
                        <Link
                            key={o.id}
                            href={`/dashboard/orders/${o.id}`}
                            className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate">{o.title}</p>
                                <p className="text-xs text-gray-400 truncate">
                                    {o.customer.fullName} · {o.createdAt.toLocaleDateString()}
                                    {o.amount != null ? ` · ₦${o.amount.toLocaleString()}` : ""}
                                </p>
                            </div>
                            {o.dueDate && (
                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${getUrgencyColor(urgency)}`}>
                                    {new Date(o.dueDate).toLocaleDateString()} · {getUrgencyLabel(urgency)}
                                </div>
                            )}
                            <OrderStatusBadge status={o.status} />
                        </Link>
                        )
                    })
                )}
            </section>

        
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        {page > 1 ? (
                            <Link href={link({ page: page - 1 })} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">← Prev</Link>
                        ) : (
                            <span className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-300">← Prev</span>
                        )}
                        {page < totalPages ? (
                            <Link href={link({ page: page + 1 })} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">Next →</Link>
                        ) : (
                            <span className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-300">Next →</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
