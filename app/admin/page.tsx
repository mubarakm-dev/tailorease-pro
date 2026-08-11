import { isAuthAdmin } from "@/app/libs/adminSession"
import { prisma } from "@/app/libs/prisma"
import { adminLogout, approveCompany, rejectCompany, suspendCompany, reactivateCompany } from "./action"
import ConfirmButton from "@/app/components/ConfirmButton"
import Link from "next/link"

export default async function AdminDashboardPage() {
    const admin = await isAuthAdmin()

    const [stats, unverifiedCompanies, pendingCompanies, approvedCompanies, suspendedCompanies, recentActivity] = await Promise.all([
        Promise.all([
            prisma.company.count(),
            prisma.company.count({ where: { status: "UNVERIFIED" } }),
            prisma.company.count({ where: { status: "PENDING" } }),
            prisma.company.count({ where: { status: "APPROVED" } }),
            prisma.company.count({ where: { status: "SUSPENDED" } }),
            prisma.staff.count(),
            prisma.customer.count(),
            prisma.order.count(),
        ]),
        prisma.company.findMany({
            where: { status: "UNVERIFIED" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                companyName: true,
                createdAt: true,
                staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } },
            },
        }),
        prisma.company.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                companyName: true,
                createdAt: true,
                staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } },
            },
        }),
        prisma.company.findMany({
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                companyName: true,
                createdAt: true,
                staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } },
                _count: { select: { staff: true, customers: true, orders: true } },
            },
        }),
        prisma.company.findMany({
            where: { status: "SUSPENDED" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                companyName: true,
                createdAt: true,
                staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } },
                _count: { select: { staff: true, customers: true, orders: true } },
            },
        }),
        prisma.activityLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                id: true,
                action: true,
                summary: true,
                createdAt: true,
            },
        }),
    ])

    const [totalCompanies, unverifiedCount, pendingCount, approvedCount, suspendedCount, staffCount, customerCount, orderCount] = stats

    return (
        <div className="min-h-screen bg-gray-50">
          
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <img
                                src="/images/logo.png"
                                alt="TailorEase"
                                className="h-8 w-auto"
                            />
                            <span className="text-lg font-bold tracking-tight">
                                Tailor<span className="text-[#b07c34]">Ease</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Platform Admin
                                </div>
                                <div className="text-sm font-medium text-gray-900 mt-0.5">
                                    {admin.email}
                                </div>
                            </div>
                            <form action={adminLogout}>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                                >
                                    Log out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

        
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Platform Dashboard
                    </h1>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-3 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#b07c34] hover:shadow-md transition-all duration-300">
                        <div className="text-2xl font-bold text-gray-900 font-variant-numeric">{totalCompanies}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mt-2">
                            Total
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#b07c34] hover:shadow-md transition-all duration-300">
                        <div className="text-2xl font-bold text-slate-600 font-variant-numeric">{unverifiedCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mt-2">
                            Unverified
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#b07c34] hover:shadow-md transition-all duration-300">
                        <div className="text-2xl font-bold text-blue-600 font-variant-numeric">{pendingCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mt-2">
                            Pending
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#b07c34] hover:shadow-md transition-all duration-300">
                        <div className="text-2xl font-bold text-green-600 font-variant-numeric">{approvedCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mt-2">
                            Approved
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#b07c34] hover:shadow-md transition-all duration-300">
                        <div className="text-2xl font-bold text-red-600 font-variant-numeric">{suspendedCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mt-2">
                            Suspended
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#b07c34] hover:shadow-md transition-all duration-300">
                        <div className="text-2xl font-bold text-gray-900 font-variant-numeric">{staffCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mt-2">
                            Staff
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#b07c34] hover:shadow-md transition-all duration-300">
                        <div className="text-2xl font-bold text-gray-900 font-variant-numeric">{customerCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mt-2">
                            Customers
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#b07c34] hover:shadow-md transition-all duration-300">
                        <div className="text-2xl font-bold text-gray-900 font-variant-numeric">{orderCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mt-2">
                            Orders
                        </div>
                    </div>
                </div>

               
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Action Card - Pending Approvals */}
                        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-[#b07c34] rounded-xl p-7 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex gap-6">
                                <div className="shrink-0 w-20 h-20 bg-[#b07c34] rounded-xl flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-white font-variant-numeric">
                                            {pendingCount}
                                        </div>
                                        <div className="text-xs font-semibold text-white uppercase tracking-wide mt-1">
                                            Pending
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Companies Awaiting Approval
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                        New registrations ready for review. Approve to activate and send company codes.
                                    </p>
                                    <div className="text-xs font-medium text-[#b07c34] mt-3">
                                        See details below ↓
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900">Payment Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">This Month Collected</span>
                                    <span className="font-bold text-green-600 font-variant-numeric">₦2,847,500</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Pending Payment</span>
                                    <span className="font-bold text-amber-600 font-variant-numeric">₦1,250,000</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Total Revenue</span>
                                        <span className="font-bold text-[#b07c34] font-variant-numeric text-lg">₦4,097,500</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Recent Activity */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900">Recent Activity</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentActivity.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-500">
                                        No recent activity
                                    </div>
                                ) : (
                                    recentActivity.map((activity: any) => (
                                        <div key={activity.id} className="px-6 py-4 flex gap-3">
                                            <div className="shrink-0 w-2 h-2 rounded-full bg-[#b07c34] mt-2"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.summary}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 font-variant-numeric">
                                                    {new Date(activity.createdAt).toLocaleString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unverified Companies */}
                {unverifiedCount > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200 bg-slate-50">
                            <h2 className="font-semibold text-gray-900">Unverified ({unverifiedCount})</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {unverifiedCompanies.map((company) => (
                                <div key={company.id} className="p-6 hover:bg-gray-50 transition">
                                    <h3 className="font-semibold text-gray-900">{company.companyName}</h3>
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                        <p><strong>Owner:</strong> {company.staff[0]?.fullName}</p>
                                        <p><strong>Email:</strong> {company.staff[0]?.email}</p>
                                        <p className="text-xs text-gray-500 mt-2">Registered {new Date(company.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Companies */}
                {pendingCount > 0 && (
                    <div className="bg-white border border-blue-200 rounded-xl overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                            <h2 className="font-semibold text-gray-900">Pending Approval ({pendingCount})</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {pendingCompanies.map((company) => (
                                <div key={company.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{company.companyName}</h3>
                                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                <p><strong>Owner:</strong> {company.staff[0]?.fullName}</p>
                                                <p><strong>Email:</strong> {company.staff[0]?.email}</p>
                                                <p className="text-xs text-gray-500 mt-2">Applied {new Date(company.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <ConfirmButton
                                                action={approveCompany.bind(null, company.id)}
                                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                                                title="Approve this company?"
                                                message={`${company.companyName} will be activated, and the owner will receive approval email with company code.`}
                                                confirmText="Approve"
                                                pendingText="Approving…"
                                            >
                                                Approve
                                            </ConfirmButton>
                                            <ConfirmButton
                                                action={rejectCompany.bind(null, company.id)}
                                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                                                title="Reject this company?"
                                                message={`${company.companyName} will be rejected and the owner will be notified.`}
                                                confirmText="Reject"
                                                pendingText="Rejecting…"
                                                danger
                                            >
                                                Reject
                                            </ConfirmButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Approved Companies */}
                {approvedCount > 0 && (
                    <div className="bg-white border border-green-200 rounded-xl overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                            <h2 className="font-semibold text-gray-900">Approved ({approvedCount})</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {approvedCompanies.map((company) => (
                                <div key={company.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{company.companyName}</h3>
                                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                <p><strong>Owner:</strong> {company.staff[0]?.fullName}</p>
                                                <p><strong>Email:</strong> {company.staff[0]?.email}</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 font-variant-numeric">{company._count.staff}</div>
                                                    <div className="text-xs text-gray-600 mt-1">Staff</div>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 font-variant-numeric">{company._count.customers}</div>
                                                    <div className="text-xs text-gray-600 mt-1">Customers</div>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 font-variant-numeric">{company._count.orders}</div>
                                                    <div className="text-xs text-gray-600 mt-1">Orders</div>
                                                </div>
                                            </div>
                                        </div>
                                        <ConfirmButton
                                            action={suspendCompany.bind(null, company.id)}
                                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shrink-0"
                                            title="Suspend this company?"
                                            message={`${company.companyName} will be suspended. All staff lose access on next request.`}
                                            confirmText="Suspend"
                                            pendingText="Suspending…"
                                            danger
                                        >
                                            Suspend
                                        </ConfirmButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suspended Companies */}
                {suspendedCount > 0 && (
                    <div className="bg-white border border-red-200 rounded-xl overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                            <h2 className="font-semibold text-gray-900">Suspended ({suspendedCount})</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {suspendedCompanies.map((company) => (
                                <div key={company.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{company.companyName}</h3>
                                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                <p><strong>Owner:</strong> {company.staff[0]?.fullName}</p>
                                                <p><strong>Email:</strong> {company.staff[0]?.email}</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 font-variant-numeric">{company._count.staff}</div>
                                                    <div className="text-xs text-gray-600 mt-1">Staff</div>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 font-variant-numeric">{company._count.customers}</div>
                                                    <div className="text-xs text-gray-600 mt-1">Customers</div>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 font-variant-numeric">{company._count.orders}</div>
                                                    <div className="text-xs text-gray-600 mt-1">Orders</div>
                                                </div>
                                            </div>
                                        </div>
                                        <ConfirmButton
                                            action={reactivateCompany.bind(null, company.id)}
                                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shrink-0"
                                            title="Reactivate this company?"
                                            message={`${company.companyName} will be restored to active.`}
                                            confirmText="Reactivate"
                                            pendingText="Reactivating…"
                                        >
                                            Reactivate
                                        </ConfirmButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
