"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useRef, useTransition } from "react"

export default function SearchBox({ placeholder = "Search…" }: { placeholder?: string }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const [isPending, startTransition] = useTransition()
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const onSearch = (term: string) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString()) // keep other filters
            if (term) params.set("q", term)
            else params.delete("q")
            params.delete("page") // any new search goes back to page 1
            startTransition(() => replace(`${pathname}?${params.toString()}`))
        }, 300)
    }

    return (
        <div className="relative flex-1">
            <input
                type="text"
                defaultValue={searchParams.get("q") ?? ""}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-9"
            />
            {isPending && (
                <span
                    aria-hidden
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"
                />
            )}
        </div>
    )
}
