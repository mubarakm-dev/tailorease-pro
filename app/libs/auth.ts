import "server-only"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"
import { isAuth } from "./session"
import type { SessionPayload } from "./session"

// isAuth() only verifies the JWT (which was set at login and stays valid ~7h). This ALSO
// re-checks the LIVE status in the DB, so a staff member or company suspended/rejected AFTER
// login can no longer perform operations. Use this in mutating server actions (and any page
// that must reflect current status). It's one small query — fine on actions, which are infrequent.
export async function requireActiveStaff(): Promise<SessionPayload> {
    const session = await isAuth()

    const staff = await prisma.staff.findUnique({
        where: { id: session.staffId },
        select: { status: true, company: { select: { status: true } } },
    })

    if (!staff || staff.status !== "APPROVED" || staff.company.status !== "APPROVED") {
        redirect("/login")
    }

    return session
}
