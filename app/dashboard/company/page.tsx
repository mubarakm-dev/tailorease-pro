import { isAuth } from "@/app/libs/session"
import { redirect } from "next/navigation"
import { prisma } from "@/app/libs/prisma"
import CompanyForm from "./CompanyForm"
import CopyButton from "../components/CopyButton"

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-0.5 text-gray-800">{children}</p>
        </div>
    )
}

export default async function CompanyManagementPage() {
    const session = await isAuth()
    if (session.role !== "SUPER_ADMIN") redirect("/dashboard")

    const company = await prisma.company.findUnique({
        where: { id: session.companyId },
        select: {
            companyName: true,
            companyCode: true,
            companyImage: true,
            email: true,
            status: true,
            createdAt: true,
            staff: { where: { role: "SUPER_ADMIN" }, select: { fullName: true, email: true, phone: true } },
            _count: { select: { staff: true, customers: true, orders: true } },
        },
    })

    const owner = company?.staff[0]

    return (
        <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Company Management</h1>
                <p className="text-gray-500 text-sm mt-1">Your company details.</p>
            </div>

            {/* DETAILS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 grid grid-cols-2 gap-5 text-sm">
                <Detail label="Company code">
                    <span className="inline-flex items-center gap-2">
                        <code className="font-mono font-semibold tracking-wider">{company?.companyCode}</code>
                        <CopyButton value={company?.companyCode ?? ""} />
                    </span>
                </Detail>
                <Detail label="Status">{company?.status}</Detail>
                <Detail label="Company email">{company?.email}</Detail>
                <Detail label="Owner">{owner?.fullName} · {owner?.email}</Detail>
                <Detail label="Created">{company?.createdAt.toLocaleDateString()}</Detail>
                <Detail label="Team">
                    {company?._count.staff ?? 0} staff · {company?._count.customers ?? 0} customers · {company?._count.orders ?? 0} orders
                </Detail>
            </div>

            {/* EDIT FORM */}
            <CompanyForm
                companyName={company?.companyName ?? ""}
                ownerFullname={owner?.fullName ?? ""}
                ownerPhone={owner?.phone ?? ""}
                companyImage={company?.companyImage ?? null}
            />
        </div>
    )
}
