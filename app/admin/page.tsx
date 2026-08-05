import { isAuthAdmin } from "@/app/libs/adminSession"
import { prisma } from "@/app/libs/prisma"
import { adminLogout, approveCompany, reactivateCompany, rejectCompany, suspendCompany } from "./action"
import ConfirmButton from "@/app/components/ConfirmButton"

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    )
}

export default async function AdminDashboardPage() {
    const admin = await isAuthAdmin()

    const [unverified, pending, approved, suspended, rejected, totalStaff, totalCustomers, totalOrders, pendingCompanies, companies] =
        await Promise.all([
            prisma.company.count({ where: { status: "UNVERIFIED" } }),
            prisma.company.count({ where: { status: "PENDING" } }),
            prisma.company.count({ where: { status: "APPROVED" } }),
            prisma.company.count({ where: { status: "SUSPENDED" } }),
            prisma.company.count({ where: { status: "REJECTED" } }),
            prisma.staff.count(),
            prisma.customer.count(),
            prisma.order.count(),
            prisma.company.findMany({
                where: { status: "PENDING" },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true, companyName: true, createdAt: true,
                    staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } },
                },
            }),


            prisma.company.findMany({
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    companyName: true,
                    status: true,
                    createdAt: true,
                    staff: { where: { role: "SUPER_ADMIN" }, select: { email: true, fullName: true } },
                    _count: {
                        select: {
                            staff: true,
                            orders: true,
                            customers: true

                        }
                    }


                }
            })
        ])



    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Platform Admin</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{admin.email}</span>
                        <form action={adminLogout}>
                            <button type="submit" className="text-sm text-red-600 underline">
                                Log out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
                {/* // Status Card */}
                <section>
                    <h2 className="text-lg font-semibold mb-4">Companies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Unverified" value={unverified} />
                        <StatCard label="Pending" value={pending} />
                        <StatCard label="Approved" value={approved} />
                        <StatCard label="Suspended" value={suspended} />
                        <StatCard label="Rejected" value={rejected} />
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-4">Platform totals</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Staff" value={totalStaff} />
                        <StatCard label="Customers" value={totalCustomers} />
                        <StatCard label="Orders" value={totalOrders} />
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-4">
                        Pending approvals ({pendingCompanies.length})
                    </h2>
                    {pendingCompanies.length === 0 ? (
                        <p className="text-gray-500">No companies awaiting approval.</p>
                    ) : (
                        <div className="bg-white rounded-lg shadow divide-y">
                            {pendingCompanies.map((company) => (
                                <div key={company.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="font-medium">{company.companyName}</p>
                                        <p className="text-sm text-gray-500">{company.staff[0]?.email}</p>
                                        <p className="text-sm text-gray-500">{company.staff[0]?.fullName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ConfirmButton
                                            action={approveCompany.bind(null, company.id)}
                                            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                            title="Approve this company?"
                                            message={`${company.companyName} will be activated, its owner's account approved, and an approval email sent with the company code.`}
                                            confirmText="Approve"
                                            pendingText="Approving…"
                                        >
                                            Approve
                                        </ConfirmButton>
                                        <ConfirmButton
                                            action={rejectCompany.bind(null, company.id)}
                                            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                            title="Reject this company?"
                                            message={`${company.companyName} will be rejected and its owner notified by email.`}
                                            confirmText="Reject"
                                            pendingText="Rejecting…"
                                            danger
                                        >
                                            Reject
                                        </ConfirmButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>


                <section>
                    <h2 className="text-lg font-semibold mb-4">
                        Companies ({companies.length})
                    </h2>

                    {companies.length === 0 ? (
                        <p className="text-gray-500">No companies.</p>
                    ) : (
                        <div className="bg-white rounded-lg shadow divide-y">
                            {companies.map((company) => (
                                <div key={company.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="font-medium">{company.companyName}</p>
                                        <p className="text-sm text-gray-500">{company.staff[0]?.email}</p>
                                        <p className="text-sm text-gray-500">{company.staff[0]?.fullName}</p>
                                        <p className="text-sm text-gray-500">Staff:{company._count.staff}</p>
                                        <p className="text-sm text-gray-500">Customer: {company._count.customers}</p>
                                        <p className="text-sm text-gray-500">Orders: {company._count.orders}</p>
                                        <p className="text-sm text-gray-500">Date Created: {company.createdAt.toLocaleDateString()}</p>

                                        <div>
                                            {company.status === "APPROVED" && (
                                                <ConfirmButton
                                                    action={suspendCompany.bind(null, company.id)}
                                                    className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    title="Suspend this company?"
                                                    message={`${company.companyName} will be suspended — all its staff lose access on their next request, and the owner is notified by email.`}
                                                    confirmText="Suspend"
                                                    pendingText="Suspending…"
                                                    danger
                                                >
                                                    Suspend
                                                </ConfirmButton>
                                            )}

                                            {company.status === "SUSPENDED" && (
                                                <ConfirmButton
                                                    action={reactivateCompany.bind(null, company.id)}
                                                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                    title="Reactivate this company?"
                                                    message={`${company.companyName} will be restored to active and the owner notified by email.`}
                                                    confirmText="Reactivate"
                                                    pendingText="Reactivating…"
                                                >
                                                    Re-activate
                                                </ConfirmButton>
                                            )}
                                        </div>





                                    </div>

                                </div>

                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
