export default function ComingSoon({ title, description }: { title: string; description?: string }) {
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <div className="mt-6 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm p-14 text-center">
                <p className="text-gray-400 text-sm">{description ?? "Coming soon."}</p>
            </div>
        </div>
    )
}
