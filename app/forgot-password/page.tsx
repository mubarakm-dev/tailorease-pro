import Link from "next/link"
import RequestForm from "./components/RequestForm"

export default function ForgotPasswordPage() {
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
        <div className="w-full max-w-md">
          <RequestForm />
        </div>
      </div>

      <div className="border-t border-black/8 px-6 py-6 text-center text-sm text-gray-600 space-y-3">
        <p className="text-[#B07C34] font-semibold uppercase tracking-wider">Manage. Measure. Master.</p>
      </div>
    </div>
  )
}
