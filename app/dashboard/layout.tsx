import { prisma } from "../libs/prisma"
import { isAuth } from "../libs/session"

import Sidebar from "./components/Sidebar"
import TopBar from "./components/TopBar"
import AccessRevoked from "./components/AccessRevoked"


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const session = await isAuth()

    const staff = await prisma.staff.findUnique({
        where: { id: session.staffId },
        include: {
            company: true
        }
    })

    // Live session guard: the login gate checks status, but an already-issued token
    // stays valid for 7h. If the account or company is no longer APPROVED (e.g. the
    // platform admin suspended the company, or the owner rejected/suspended the staff),
    // bounce them on their next navigation/refresh instead of letting them keep working.
    if (!staff || staff.status !== "APPROVED" || staff.company.status !== "APPROVED") {
     const message = !staff ? "Your Account no longer exist" : staff.company.status === "SUSPENDED" ? "Your company has been suspended. Please contact support."
     : staff.company.status === "REJECTED" ? "Your company registration was rejected."
     : staff.status === "SUSPENDED" ? "Your Staff acount has been suspended, kindly contact your company admin"
     : staff.status === "REJECTED" ? "Your Staff acount has been rejected, kindly contact your company admin"
      : "Your access has been revoked."

      return <AccessRevoked message ={message}/>
    }

    return (
        <div className="flex min-h-screen bg-[#f1efe9]">
            <Sidebar
                companyName={staff?.company.companyName ?? ""}
                companyImage={staff?.company.companyImage ?? ""}
                staffName={staff?.fullName ?? ""}
                role={session.role}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar companyName={staff?.company.companyName ?? ""} />
                <main className="flex-1">{children}</main>
                <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
                    Powered by <span className="text-[#b07c34] font-semibold">TailorEase</span>
                </footer>
            </div>



        </div>
    )
}