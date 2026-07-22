"use server"

import { JWTPayload, jwtVerify, SignJWT } from "jose"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface SessionPayload extends JWTPayload {
    staffId: string
    companyId: string
    role: string
    status: string
}

const secretKey = process.env.AUTH_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export const encrypt = async (payload: SessionPayload): Promise<string> => {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7h")
        .sign(encodedKey)

    return token
}

export const decrypt = async (token: string): Promise<{
    status: number
    payload?: SessionPayload
    message?: string
}> => {
    try {
        const { payload } = await jwtVerify(token, encodedKey, {
            algorithms: ["HS256"]
        })

        return {
            status: 200,
            payload: payload as SessionPayload
        }
    } catch (error) {
        return {
            status: 401,
            message: "Unauthorized"
        }
    }
}

export const setSession = async (payload: SessionPayload): Promise<void> => {
     const expiresAt = new Date(Date.now() + 7 * 60 * 60 * 1000)
    const token = await encrypt(payload)
    const cookieStore = await cookies()

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
     path: "/",
  })

}

export const getSession = async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (!token) return null

  const result = await decrypt(token.value)

  if (result.status !== 200 || !result.payload) return null

  return result.payload
}


export const isAuth = async (): Promise<SessionPayload> => {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}
