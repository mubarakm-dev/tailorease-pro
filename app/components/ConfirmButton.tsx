"use client"

import { useEffect, useState, useTransition } from "react"

type Props = {
    
    action: () => Promise<unknown>
    children: React.ReactNode 
    className?: string 
    title: string
    message: string
    confirmText?: string
    pendingText?: string
    danger?: boolean 
}

export default function ConfirmButton({
    action,
    children,
    className,
    title,
    message,
    confirmText = "Confirm",
    pendingText = "Working…",
    danger = false,
}: Props) {
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isPending) setOpen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, isPending])

    const onConfirm = () => {
        setError(null)
        startTransition(async () => {
            try {
                await action()
                setOpen(false)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Something went wrong"
                setError(errorMessage)
            }
        })
    }

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className}>
                {children}
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => !isPending && setOpen(false)}
                        aria-hidden
                    />
                    <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="mt-2 text-sm text-gray-500">{message}</p>
                        {error && (
                            <p className="text-red-600 text-sm mt-4">
                                {error}
                            </p>
                        )}
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isPending}
                                autoFocus
                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
                                    danger ? "bg-red-600 hover:bg-red-700" : "bg-[#1b2233] hover:bg-[#141a28]"
                                }`}
                            >
                                {isPending ? pendingText : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
