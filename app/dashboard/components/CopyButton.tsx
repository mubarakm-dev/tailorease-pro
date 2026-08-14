"use client"

import { useState } from "react"

export default function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
           
        }
    }

    return (
        <button
            type="button"
            onClick={copy}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#b07c34] text-white hover:brightness-105 whitespace-nowrap"
        >
            {copied ? "Copied!" : "Copy code"}
        </button>
    )
}
