"use client"

import { useState, useActionState } from "react"
import { updateCompanyDetails, CompanyUpdateState } from "./action"
import SubmitButton from "@/app/components/SubmitButton"
import FormMessage from "@/app/components/FormMessage"

const initialState: CompanyUpdateState = { success: false, error: null }

export default function CompanyForm({
    companyName,
    ownerFullname,
    ownerPhone,
    companyImage,
}: {
    companyName: string
    ownerFullname: string
    ownerPhone: string
    companyImage: string | null
}) {
    const [state, formAction] = useActionState(updateCompanyDetails, initialState)
    const [imagePreview, setImagePreview] = useState<string | null>(companyImage)
    const [tempImage, setTempImage] = useState<File | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setTempImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <form action={formAction} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-sm">Edit details</h2>

            <FormMessage state={state} />

            <div>
                <label className="block text-sm font-medium mb-1">Company name</label>
                <input name="companyName" defaultValue={companyName} required
                    className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Company Logo/Image</label>
                {imagePreview && (
                    <div className="mb-4 relative">
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-300" />
                    </div>
                )}
                <input type="file" name="companyImage" accept="image/*" onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                <p className="text-xs text-gray-700 mt-1">JPG, PNG, or WebP (max 2MB)</p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Owner full name</label>
                <input name="ownerFullname" defaultValue={ownerFullname}
                    className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Owner phone</label>
                <input name="ownerPhone" defaultValue={ownerPhone}
                    className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>

            <SubmitButton className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800" pendingText="Saving…">
                Save changes
            </SubmitButton>
        </form>
    )
}
