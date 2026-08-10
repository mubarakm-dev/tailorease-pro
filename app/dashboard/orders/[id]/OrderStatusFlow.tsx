"use client"

import { useState } from "react"
import { advanceOrderStatus } from "./action"
import type { OrderStatus } from "@prisma/client"

const STAGES: { key: OrderStatus; label: string; icon: string }[] = [
    { key: "RECEIVED", label: "Received", icon: "📋" },
    { key: "CUT_IN_PROGRESS", label: "Cutting", icon: "✂️" },
    { key: "SEWING_IN_PROGRESS", label: "Sewing", icon: "🪡" },
    { key: "FINISHING", label: "Finishing", icon: "✨" },
    { key: "COMPLETED", label: "Completed", icon: "✓" },
]

const stageIndex = (status: OrderStatus) => STAGES.findIndex(s => s.key === status)

export function OrderStatusFlow({ currentStatus, orderId }: { currentStatus: OrderStatus; orderId: string }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const currentIdx = stageIndex(currentStatus)

    const handleStageClick = async (stage: OrderStatus) => {
        if (stage === currentStatus) return

        const targetIdx = stageIndex(stage)
        if (targetIdx === -1) return

        const direction = targetIdx > currentIdx ? "advance" : "move back"
        const confirmed = confirm(
            `${direction.charAt(0).toUpperCase() + direction.slice(1)} order to "${STAGES[targetIdx].label}"?`
        )

        if (!confirmed) return

        setLoading(true)
        setMessage(null)

        try {
            const formData = new FormData()
            formData.append("targetStatus", stage)

            const result = await advanceOrderStatus(orderId, formData)

            if (result.success) {
                setMessage({ type: "success", text: "Status updated successfully!" })
            } else {
                setMessage({ type: "error", text: result.error || "Failed to update status" })
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-sm mb-6 text-gray-900">Order Status Timeline</h2>

            {/* Timeline */}
            <div className="flex items-center gap-2">
                {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentIdx
                    const isCurrent = idx === currentIdx
                    const isUpcoming = idx > currentIdx

                    return (
                        <div key={stage.key} className="flex items-center flex-1">
                            {/* Stage Button */}
                            <button
                                onClick={() => handleStageClick(stage.key)}
                                disabled={loading}
                                className={`
                                    relative w-14 h-14 rounded-full flex items-center justify-center font-semibold text-sm
                                    transition-all duration-300 shrink-0
                                    ${isCurrent
                                        ? "bg-[#b07c34] text-white shadow-lg ring-4 ring-[#b07c34] ring-opacity-20 scale-110"
                                        : isCompleted
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }
                                    ${isUpcoming && !isCurrent ? "cursor-pointer hover:scale-105" : ""}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                title={stage.label}
                            >
                                {isCompleted ? "✓" : stage.icon}
                            </button>

                            {/* Connector Line */}
                            {idx < STAGES.length - 1 && (
                                <div
                                    className={`flex-1 h-1 mx-1 rounded transition-colors ${
                                        idx < currentIdx ? "bg-green-400" : "bg-gray-300"
                                    }`}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Labels */}
            <div className="flex items-center gap-2 mt-6">
                {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentIdx
                    const isCurrent = idx === currentIdx

                    return (
                        <div key={stage.key} className="flex-1 text-center">
                            <p
                                className={`text-xs font-medium transition-colors ${
                                    isCurrent
                                        ? "text-[#b07c34] font-semibold"
                                        : isCompleted
                                            ? "text-green-700"
                                            : "text-gray-500"
                                }`}
                            >
                                {stage.label}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Current Status Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Current Status:</span>{" "}
                    <span className="text-[#b07c34] font-medium">{STAGES[currentIdx]?.label || "Unknown"}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Click any stage to move to it</p>
            </div>

            {/* Error/Success Message */}
            {message && (
                <div className={`mt-4 p-3 rounded-lg border ${
                    message.type === "success"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                }`}>
                    <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>
                        {message.text}
                    </p>
                </div>
            )}
        </div>
    )
}
