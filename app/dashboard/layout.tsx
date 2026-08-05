import { prisma } from "../libs/prisma"
import { isAuth } from "../libs/session"

import DashboardShell from "./components/DashboardShell"
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
        <DashboardShell
            companyName={staff.company.companyName}
            companyImage={staff.company.companyImage}
            staffName={staff.fullName}
            role={session.role}
        >
            {children}
        </DashboardShell>
    )
}