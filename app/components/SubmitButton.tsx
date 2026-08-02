"use client"

import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"

export default function SubmitButton({
    children,
    pendingText,
    className,
}: {
    children: ReactNode
    pendingText?: string
    className?: string
}) {
    // useFormStatus reads the submitting state of the nearest parent <form>,
    // which is why this lives in its own component INSIDE the form.
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className={`${className ?? ""} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
            {pending ? (pendingText ?? "…") : children}
        </button>
    )
}
