"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createOrder, OrderCreateState } from "./orderAction"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"

const initialState: OrderCreateState = { success: false, error: null }

export default function NewOrder({
    customerId,
    measurements
}: {
    customerId: string
    measurements: Array<{ id: string; createdAt: Date; template: { name: string } }>
}) {
    const router = useRouter()
    const [state, formAction] = useActionState(createOrder, initialState)

    useEffect(() => {
        if (state.success && state.orderId) {
            router.push(`/dashboard/orders/${state.orderId}`)
        }
    }, [state.success, state.orderId, router])

    return (
        <form action={formAction} className="p-5 flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50">
            <input type="hidden" name="customerId" value={customerId} />
            <h3 className="font-semibold text-sm text-gray-900">New order</h3>

            <FormMessage state={state} />

            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-900">Title</label>
                    <input type="text" name="title" required placeholder="e.g. Wedding Kaftan"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-900">
                        Amount <span className="text-gray-900">(optional)</span>
                    </label>
                    <input type="number" name="amount" min="0" step="1" placeholder="e.g. 25000"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500" />
                </div>
            </div>

            {measurements.length > 0 && (
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-900">
                        Measurement <span className="text-gray-900">(optional)</span>
                    </label>
                    <select name="measurementId"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900">
                        <option value="">No specific measurement</option>
                        {measurements.map((m: any) => (
                            <option key={m.id} value={m.id}>
                                {m.template.name} — {new Date(m.createdAt).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-900">
                        Due date <span className="text-gray-900">(optional)</span>
                    </label>
                    <input type="date" name="dueDate"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-900">
                        Due time <span className="text-gray-900">(optional)</span>
                    </label>
                    <input type="time" name="dueTime"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium mb-1 text-gray-900">
                    Notes <span className="text-gray-900">(optional)</span>
                </label>
                <textarea name="notes" rows={2} placeholder="Instructions…"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500" />
            </div>

            <div>
                <label className="block text-xs font-medium mb-1 text-gray-900">
                    Fabric/Material photo <span className="text-gray-900">(optional)</span>
                </label>
                <input type="file" name="fabric" accept="image/*"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" />
            </div>

            <div>
                <SubmitButton className="bg-[#b07c34] text-white px-4 py-2 rounded text-sm hover:bg-[#9a6a2a]" pendingText="Creating…">
                    Create order
                </SubmitButton>
            </div>
        </form>
    )
}
