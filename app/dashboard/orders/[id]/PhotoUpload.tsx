"use client"

import { useActionState, useRef, useState, useEffect } from "react"
import { uploadPhoto } from "./action"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"

type Props = {
    orderId: string
}

type UploadState = { success: boolean; error: string | null; message?: string }

export default function PhotoUpload({ orderId }: Props) {
    const [state, formAction] = useActionState((prevState: UploadState, formData: FormData) =>
        uploadPhoto(orderId, formData) as Promise<UploadState>,
        { success: false, error: null }
    )
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string>("")

    useEffect(() => {
        if (state.success) {
            setPreview(null)
            setFileName("")
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }, [state.success])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setPreview(event.target?.result as string)
                setFileName(file.name)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-sm mb-4">Add photo</h3>

            <form action={formAction} className="flex flex-col gap-3">
                {preview ? (
                    <div className="relative">
                        <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        <button
                            type="button"
                            onClick={() => {
                                setPreview(null)
                                setFileName("")
                                if (fileInputRef.current) fileInputRef.current.value = ""
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                        >
                            Clear
                        </button>
                    </div>
                ) : (
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <p className="text-sm text-gray-600">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, WebP up to 5MB
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">
                        Caption (optional)
                    </label>
                    <input
                        type="text"
                        name="caption"
                        placeholder="e.g. Front view, progress photo"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500"
                    />
                </div>

                <FormMessage state={state} />

                <SubmitButton
                    className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
                    pendingText="Uploading…"
                >
                    Upload photo
                </SubmitButton>
            </form>
        </div>
    )
}
