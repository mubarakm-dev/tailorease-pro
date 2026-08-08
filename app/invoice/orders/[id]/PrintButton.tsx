"use client"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-[#b07c34] text-white rounded-lg text-sm hover:bg-[#9a6a2a] transition"
    >
      Print / Save as PDF
    </button>
  )
}
