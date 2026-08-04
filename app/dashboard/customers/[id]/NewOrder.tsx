"use client"

import { useActionState } from "react"
import { createOrder, OrderCreateState } from "./orderAction"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"

const initialState: OrderCreateState = { success: false, error: null }

export default function NewOrder({ customerId }: { customerId: string }) {
    const [state, formAction] = useActionState(createOrder, initialState)

    return (
        <form action={formAction} className="p-5 flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50">
            <input type="hidden" name="customerId" value={customerId} />
            <h3 className="font-semibold text-sm">New order</h3>

            <FormMessage state={state} />

            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">Title</label>
                    <input type="text" name="title" required placeholder="e.g. Wedding Kaftan"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">
                        Amount <span className="text-gray-400">(optional)</span>
                    </label>
                    <input type="number" name="amount" min="0" step="1" placeholder="e.g. 25000"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">
                    Notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea name="notes" rows={2} placeholder="Instructions…"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" />
            </div>

            <div>
                <SubmitButton className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800" pendingText="Creating…">
                    Create order
                </SubmitButton>
            </div>
        </form>
    )
}
