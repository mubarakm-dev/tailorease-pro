import { NextRequest, NextResponse, ProxyConfig } from "next/server"
import { decrypt } from "@/app/libs/session"

export const proxy = async (request: NextRequest) => {
    const token: string | undefined = request.cookies.get("token")?.value

    const loginUrl = new URL("/login", request.url)

    if (!token) {
        return NextResponse.redirect(loginUrl)
    }

    const auth = await decrypt(token)

    if (auth.status !== 200) {
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config: ProxyConfig = {
    matcher: ["/dashboard/:path*"],
}
