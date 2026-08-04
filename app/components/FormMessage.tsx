"use client"

import { useEffect, useState } from "react"

type FormState = { error?: string | null; success?: boolean; message?: string }

export default function FormMessage({ state, duration = 4000 }: { state: FormState; duration?: number }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const hasMessage = Boolean(state.error) || Boolean(state.success && state.message)
        if (!hasMessage) {
            setVisible(false)
            return
        }
        
        setVisible(true)
        const timer = setTimeout(() => setVisible(false), duration)
        return () => clearTimeout(timer)
    }, [state, duration])

    if (!visible) return null

    if (state.error) {
        return <p className="bg-red-100 text-red-700 p-3 rounded text-sm mb-3">{state.error}</p>
    }
    if (state.success && state.message) {
        return <p className="bg-green-100 text-green-700 p-3 rounded text-sm mb-3">{state.message}</p>
    }
    return null
}
