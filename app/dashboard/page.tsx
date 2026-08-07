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

function StatTile({ label, value, hint, attn, href, index = 0 }: { label: string; value: number; hint: string; attn?: boolean; href?: string; index?: number }) {
    const baseClass = "block bg-white rounded-xl border p-6 shadow-sm transition-all duration-300"
    const hoverClass = href ? "hover:border-[#b07c34] hover:shadow-lg hover:-translate-y-1" : ""
    const borderClass = attn ? "border-amber-400" : "border-gray-200"
    const animationStyle = href ? {
        animation: `fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
        animationDelay: `${index * 75}ms`
    } : {}

    const inner = (
        <>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className={`text-4xl font-semibold mt-3 tabular-nums ${attn ? "text-amber-600" : "text-gray-900"}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-2">{hint}</p>
        </>
    )
    return href ? (
        <Link href={href} className={`${baseClass} ${borderClass} ${hoverClass}`} style={animationStyle}>{inner}</Link>
    ) : (
        <div className={`${baseClass} ${borderClass}`} style={animationStyle}>{inner}</div>
    )
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
        <div className="p-6 max-w-6xl mx-auto flex flex-col gap-8">
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            <div>
                <h1 className="text-3xl font-semibold text-gray-900">{greeting}, {firstName}</h1>
                <p className="text-gray-500 text-base mt-2">Here&apos;s what&apos;s happening at your shop today.</p>
            </div>

            {/* STAT TILES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatTile label="Customers" value={customerCount} hint="total" href="/dashboard/customers" index={0} />
                <StatTile label="Active orders" value={activeOrderCount} hint="in progress" href="/dashboard/orders" index={1} />
                <StatTile label="Staff" value={staffCount} hint="approved" href="/dashboard/staff" index={2} />
                {isAdmin && (
                    <StatTile label="Pending approvals" value={pendingCount} hint="needs review" attn={pendingCount > 0} href="/dashboard/staff" index={3} />
                )}
            </div>

            {/* ORDERS PIPELINE */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="font-semibold text-sm text-gray-900">Orders pipeline</h2>
                </div>
                <div className="grid grid-cols-5 gap-3 p-6">
                    {STAGES.map((stage, idx) => (
                        <Link
                            key={stage.key}
                            href={`/dashboard/orders?status=${stage.key}`}
                            className="text-center p-4 rounded-lg border border-gray-200 hover:border-[#b07c34] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                            style={{
                                animation: `fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 75}ms both`
                            }}
                        >
                            <div className="h-1 w-2/3 mx-auto rounded mb-3" style={{ background: stage.color }} />
                            <div className="text-2xl font-semibold tabular-nums text-gray-900">{pipeline.get(stage.key) ?? 0}</div>
                            <div className="text-[11px] uppercase tracking-wide text-gray-500 mt-2 font-medium">{stage.label}</div>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-8">

                {isAdmin && (
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-[#b07c34] transition-all duration-300">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                            <h2 className="font-semibold text-sm text-gray-900">Pending staff</h2>
                            <Link href="/dashboard/staff" className="text-xs text-[#b07c34] font-medium hover:underline transition">Staff Management →</Link>
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
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-[#b07c34] transition-all duration-300">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                        <h2 className="font-semibold text-sm text-gray-900">Recent activity</h2>
                        <Link href="/dashboard/activity" className="text-xs text-[#b07c34] font-medium hover:underline transition">View all →</Link>
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
