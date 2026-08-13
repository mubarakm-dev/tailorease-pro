import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { redirect } from "next/navigation"
import { approveStaff, rejectStaff, suspendStaff, reactivateStaff } from "../action"
import CopyButton from "../components/CopyButton"
import ConfirmButton from "@/app/components/ConfirmButton"

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        APPROVED: "bg-green-50 text-green-700",
        PENDING: "bg-amber-50 text-amber-700",
        SUSPENDED: "bg-orange-50 text-orange-700",
        REJECTED: "bg-red-50 text-red-700",
        UNVERIFIED: "bg-gray-100 text-gray-700",
    }
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    )
}

export default async function StaffManagementPage() {
    const session = await isAuth()
    if (session.role !== "SUPER_ADMIN") redirect("/dashboard")
    const companyId = session.companyId

    const [company, staff] = await Promise.all([
        prisma.company.findUnique({ where: { id: companyId }, select: { companyCode: true } }),
        prisma.staff.findMany({
            where: { companyId },
            orderBy: { createdAt: "desc" },
            select: { id: true, fullName: true, email: true, role: true, status: true },
        }),
    ])

    const pendingCount = staff.filter((s: any) => s.status === "PENDING").length

    return (
        <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Staff Management</h1>
                <p className="text-gray-700 text-sm mt-1">
                    {staff.length} {staff.length === 1 ? "member" : "members"}
                    {pendingCount > 0 && <span className="text-amber-600"> · {pendingCount} pending</span>}
                </p>
            </div>

            {/* INVITE CODE */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Invite your team</p>
                    <p className="text-sm text-gray-700 mt-0.5">Share this code so staff can register and join {""}</p>
                </div>
                <code className="text-base font-mono font-semibold tracking-wider bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    {company?.companyCode ?? "—"}
                </code>
                <CopyButton value={company?.companyCode ?? ""} />
            </div>

            {/* STAFF ROSTER */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-sm">All staff</h2>
                </div>

                {staff.length === 0 ? (
                    <p className="text-sm text-gray-700 px-5 py-8 text-center">No staff yet.</p>
                ) : (
                    staff.map((s: any) => {
                        const canManage = s.role !== "SUPER_ADMIN"
                        return (
                            <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-b-0">
                                <span className="w-9 h-9 rounded-full grid place-items-center bg-slate-600 text-white text-sm font-semibold shrink-0">
                                    {s.fullName.charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold truncate">
                                        {s.fullName}
                                        {s.role === "SUPER_ADMIN" && <span className="ml-2 text-[10px] uppercase tracking-wide text-[#b07c34]">Owner</span>}
                                    </p>
                                    <p className="text-xs text-gray-700 truncate">{s.email}</p>
                                </div>

                                <StatusBadge status={s.status} />

                                {canManage && (
                                    <div className="flex items-center gap-2">
                                        {s.status === "PENDING" && (
                                            <>
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
                                            </>
                                        )}
                                        {s.status === "APPROVED" && (
                                            <ConfirmButton
                                                action={suspendStaff.bind(null, s.id)}
                                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100"
                                                title="Suspend this staff member?"
                                                message={`${s.fullName} will immediately lose the ability to make changes and be notified by email. You can reactivate them later.`}
                                                confirmText="Suspend"
                                                pendingText="Suspending…"
                                                danger
                                            >
                                                Suspend
                                            </ConfirmButton>
                                        )}
                                        {s.status === "SUSPENDED" && (
                                            <ConfirmButton
                                                action={reactivateStaff.bind(null, s.id)}
                                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                                                title="Reactivate this staff member?"
                                                message={`${s.fullName} will regain full access and be notified by email.`}
                                                confirmText="Reactivate"
                                                pendingText="Reactivating…"
                                            >
                                                Reactivate
                                            </ConfirmButton>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </section>
        </div>
    )
}
