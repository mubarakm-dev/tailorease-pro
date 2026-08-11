import Link from "next/link"
import { prisma } from "@/app/libs/prisma"
import { cleanupExpiredPasswordResetTokens } from "@/app/libs/tokenCleanup"
import { notFound } from "next/navigation"
import ResetForm from "../components/ResetForm"

export default async function ResetPasswordPage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  await cleanupExpiredPasswordResetTokens()

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#F1EFE9] flex flex-col">
      <div className="border-b border-black/8 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-1">
          <img src="/images/logo.png" alt="TailorEase" className="h-12 w-auto" />
          <span className="font-serif text-xl font-semibold">
            <span className="text-[#1B2233]">Tailor</span><span className="text-[#B07C34]">Ease</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <ResetForm token={token} />
      </div>

      <div className="border-t border-black/8 px-6 py-6 text-center text-sm text-gray-600 space-y-3">
        <p className="text-[#B07C34] font-semibold uppercase tracking-wider">Manage. Measure. Master.</p>
      </div>
    </div>
  )
}
