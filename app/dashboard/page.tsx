import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { approveStaff, rejectStaff } from "./action"
import type { OrderStatus } from "@prisma/client"
import ConfirmButton from "@/app/components/ConfirmButton"
import Link from "next/link"


const STAGES: { key: OrderStatus; label: string; color: string }[] = [
    { key: "RECEIVED", label: "Received", color: "#3f6ea8" },
    { key: "CUT_IN_PROGRESS", label: "Cutting", color: "#6b7db0" },
    { key: "SEWING_IN_PROGRESS", label: "Sewing", color: "#b07c34" },
    { key: "FINISHING", label: "Finishing", color: "#b07c1f" },
    { key: "COMPLETED", label: "Completed", color: "#2f8a5b" },
]

function timeAgo(date: Date): string {
    const s = Math.floor((Date.now() - date.getTime()) / 1000)
    if (s < 60) return "just now"
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
}

function StatTile({ label, value, hint, attn, href }: { label: string; value: number; hint: string; attn?: boolean; href?: string }) {
    const cls = `block bg-white rounded-xl border p-4 shadow-sm ${attn ? "border-amber-400" : "border-gray-200"} ${href ? "hover:border-gray-300 hover:shadow-md transition" : ""}`
    const inner = (
        <>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-3xl font-semibold mt-2 tabular-nums ${attn ? "text-amber-600" : ""}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{hint}</p>
        </>
    )
    return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>
}

export default async function OverviewPage() {
    const session = await isAuth()
    const companyId = session.companyId
    const isAdmin = session.role === "SUPER_ADMIN"

    const [me, customerCount, activeOrderCount, staffCount, pendingCount, ordersByStatus, pendingStaff, recentActivity] =
        await Promise.all([
            prisma.staff.findUnique({ where: { id: session.staffId }, select: { fullName: true } }),
            prisma.customer.count({ where: { companyId } }),
            prisma.order.count({ where: { companyId, status: { not: "COMPLETED" } } }),
            prisma.staff.count({ where: { companyId, status: "APPROVED" } }),
            prisma.staff.count({ where: { companyId, status: "PENDING" } }),
            prisma.order.groupBy({
                by: ["status"],
                where: { companyId },
                _count: { _all: true },
            }),
            prisma.staff.findMany({
                where: { companyId, status: "PENDING" },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, fullName: true, email: true, createdAt: true },
            }),
            prisma.activityLog.findMany({
                where: { companyId },
                orderBy: { createdAt: "desc" },
                take: 6,
                include: { staff: { select: { fullName: true } } },
            }),
        ])


    const pipeline = new Map(ordersByStatus.map((o) => [o.status, o._count._all]))

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    const firstName = me?.fullName.split(" ")[0] ?? "there"

    return (
        <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">{greeting}, {firstName}</h1>
                <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening at your shop today.</p>
            </div>

            {/* STAT TILES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatTile label="Customers" value={customerCount} hint="total" href="/dashboard/customers" />
                <StatTile label="Active orders" value={activeOrderCount} hint="in progress" href="/dashboard/orders" />
                <StatTile label="Staff" value={staffCount} hint="approved" href="/dashboard/staff" />
                {isAdmin && (
                    <StatTile label="Pending approvals" value={pendingCount} hint="needs review" attn={pendingCount > 0} href="/dashboard/staff" />
                )}
            </div>

            {/* ORDERS PIPELINE */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm">Orders pipeline</h2>
                </div>
                <div className="flex">
                    {STAGES.map((stage) => (
                        <Link
                            key={stage.key}
                            href={`/dashboard/orders?status=${stage.key}`}
                            className="flex-1 text-center py-5 border-r border-gray-100 last:border-r-0 hover:bg-gray-50 transition"
                        >
                            <div className="h-1 w-2/3 mx-auto rounded mb-3" style={{ background: stage.color }} />
                            <div className="text-2xl font-semibold tabular-nums">{pipeline.get(stage.key) ?? 0}</div>
                            <div className="text-[11px] uppercase tracking-wide text-gray-500 mt-1">{stage.label}</div>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-5">
            
                {isAdmin && (
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                            <h2 className="font-semibold text-sm">Pending staff</h2>
                            <Link href="/dashboard/staff" className="text-xs text-[#b07c34] font-medium">Staff Management →</Link>
                        </div>
                        {pendingStaff.length === 0 ? (
                            <p className="text-sm text-gray-400 px-5 py-6 text-center">No staff awaiting approval.</p>
                        ) : (
                            pendingStaff.map((s) => (
                                <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-b-0">
                                    <span className="w-9 h-9 rounded-full grid place-items-center bg-slate-600 text-white text-sm font-semibold shrink-0">
                                        {s.fullName.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold truncate">{s.fullName}</p>
                                        <p className="text-xs text-gray-400 truncate">{s.email}</p>
                                    </div>
                                    <ConfirmButton
                                        action={rejectStaff.bind(null, s.id)}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                        title="Reject this staff member?"
                                        message={`${s.fullName} will be rejected and notified by email. They won't be able to access the dashboard.`}
                                        confirmText="Reject"
                                        pendingText="Rejecting…"
                                        danger
                                    >
                                        Reject
                                    </ConfirmButton>
                                    <ConfirmButton
                                        action={approveStaff.bind(null, s.id)}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                                        title="Approve this staff member?"
                                        message={`${s.fullName} will gain access to the dashboard and be notified by email.`}
                                        confirmText="Approve"
                                        pendingText="Approving…"
                                    >
                                        Approve
                                    </ConfirmButton>
                                </div>
                            ))
                        )}
                    </section>
                )}

                {/* RECENT ACTIVITY */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                        <h2 className="font-semibold text-sm">Recent activity</h2>
                        <Link href="/dashboard/activity" className="text-xs text-[#b07c34] font-medium">View all →</Link>
                    </div>
                    {recentActivity.length === 0 ? (
                        <p className="text-sm text-gray-400 px-5 py-6 text-center">No activity yet.</p>
                    ) : (
                        recentActivity.map((log) => {
                            const name = log.staff?.fullName ?? "System"
                            return (
                                <div key={log.id} className="flex items-start gap-3 px-5 py-3 border-b border-gray-100 last:border-b-0">
                                    <span className="w-7 h-7 rounded-full grid place-items-center bg-slate-500 text-white text-xs font-semibold shrink-0">
                                        {name.charAt(0).toUpperCase()}
                                    </span>
                                    <p className="text-sm flex-1">
                                        <span className="font-semibold">{name}</span> {log.summary}
                                    </p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(log.createdAt)}</span>
                                </div>
                            )
                        })
                    )}
                </section>
            </div>
        </div>
    )
}
