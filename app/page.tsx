import Link from "next/link"

export default function LandingPage() {
    return (
        <div className="bg-[#F1EFE9]">
            <style>{`
                .nav-link {
                    position: relative;
                    color: #1B2233;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: #b07c34;
                    transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .nav-link:hover {
                    color: #b07c34;
                }
                .nav-link:hover::after {
                    width: 100%;
                }
            `}</style>

            {/* Navbar */}
            <nav className="sticky top-0 z-100 flex items-center justify-between px-12 py-6 border-b border-black/8 bg-[#F1EFE9]">
                <Link href="/" className="flex items-center gap-1">
                    <img src="/images/logo.png" alt="TailorEase" className="h-14 w-auto" />
                    <span className="font-serif text-2xl font-semibold">
                        <span className="text-[#1B2233]">Tailor</span><span className="text-[#B07C34]">Ease</span>
                    </span>
                </Link>
                <ul className="hidden md:flex gap-10 list-none">
                    <li><a href="#features" className="nav-link">Features</a></li>
                    <li><a href="#how" className="nav-link">How it works</a></li>
                    <li><a href="#team" className="nav-link">For your team</a></li>
                </ul>
                <Link href="/login" className="bg-white text-[#1B2233] px-6 py-2 rounded border border-black/20 font-medium transition-all duration-300 hover:bg-[#B07C34] hover:text-white hover:border-[#B07C34] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(176,124,52,0.15)]">
                    Sign in
                </Link>
            </nav>

            {/* Hero */}
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24 items-center">
                <div>
                    <div className="text-[#B07C34] text-xs font-semibold uppercase tracking-wider mb-4">
                        For tailoring houses & fashion studios
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
                        The measure of a <em className="italic text-[#B07C34]">well-run</em> workshop.
                    </h1>
                    <p className="text-[#B07C34] text-sm font-semibold uppercase tracking-wider mb-8">
                        Manage. Measure. Master.
                    </p>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        TailorEase holds every customer, their measurements, and each order — from <em>received to ready for pickup</em> — in one calm place. So your hands stay on the cloth, not the paperwork.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <Link href="/register/company" className="bg-[#B07C34] text-white px-8 py-3 rounded font-semibold hover:bg-[#9a6a2a] transition text-center">
                            Get started free
                        </Link>
                        <a href="#how" className="border border-[#1B2233] text-[#1B2233] px-8 py-3 rounded font-semibold hover:bg-black/5 transition text-center">
                            Learn more
                        </a>
                    </div>
                    <p className="text-sm text-gray-600">
                        <span className="text-[#B07C34] mr-2">✱</span>
                        Built for busy shops — <strong>owners, tailors, and every order</strong>, in one workspace.
                    </p>
                </div>
                <div className="bg-white border border-black/8 rounded-lg p-8 shadow-sm">
                    <span className="inline-block bg-[#FBF0E6] text-[#B07C34] text-xs font-semibold px-3 py-1 rounded mb-4">Sewing</span>
                    <h3 className="font-serif text-xl mb-6">Wedding Agbada</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between pb-4 border-b border-black/5">
                            <span className="text-gray-500">Customer</span>
                            <span className="font-semibold">Bisi Lawal</span>
                        </div>
                        <div className="flex justify-between pb-4 border-b border-black/5">
                            <span className="text-gray-500">Chest</span>
                            <span className="font-semibold">44 in</span>
                        </div>
                        <div className="flex justify-between pb-4 border-b border-black/5">
                            <span className="text-gray-500">Length</span>
                            <span className="font-semibold">58 in</span>
                        </div>
                        <div className="flex justify-between pb-4 border-b border-black/5">
                            <span className="text-gray-500">Sleeve</span>
                            <span className="font-semibold">25 in</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Price</span>
                            <span className="font-semibold">₦85,000</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-black/5 text-sm text-green-600">
                        ✓ Customer will be texted the moment it's marked ready
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="bg-[#F1EFE9] py-16 md:py-24 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-[#B07C34] text-xs font-semibold uppercase tracking-wider mb-4">
                        Everything the shop needs
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
                        The whole job, from first fitting to final pickup.
                    </h2>
                    <p className="text-gray-600 mb-12 max-w-2xl">
                        No more scattered notebooks, lost measurements, or "is it ready yet?" calls. Four things, done properly.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white border border-black/8 rounded-lg p-8">
                            <div className="w-12 h-12 bg-[#F5E6D3] rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="font-serif text-lg mb-2">Every client, one tap away</h3>
                            <p className="text-gray-600">Keep names, phone numbers, and history in order. Open a customer to see their measurements and every order they've placed — at a glance.</p>
                        </div>

                        <div className="bg-white border border-black/8 rounded-lg p-8">
                            <div className="w-12 h-12 bg-[#F5E6D3] rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-serif text-lg mb-2">Your templates, their numbers</h3>
                            <p className="text-gray-600">Define what you measure once — Kaftan, Agbada, Suit — then record each client against it. Edit a template later and past measurements stay exactly as they were taken.</p>
                        </div>

                        <div className="bg-white border border-black/8 rounded-lg p-8">
                            <div className="w-12 h-12 bg-[#F5E6D3] rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8-4m-8 4v10l8-4m0 0l-8 4m8-4l-8-4" />
                                </svg>
                            </div>
                            <h3 className="font-serif text-lg mb-2">From received to ready</h3>
                            <p className="text-gray-600">Move each order through the workshop — Received, Cutting, Sewing, Finishing, Completed — with a full record of who did what and when.</p>
                        </div>

                        <div className="bg-white border border-black/8 rounded-lg p-8">
                            <div className="w-12 h-12 bg-[#F5E6D3] rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <h3 className="font-serif text-lg mb-2">Tell them it's ready — automatically</h3>
                            <p className="text-gray-600">The moment an order is marked complete, the customer hears their garment is ready for pickup. No follow-up calls, no forgetting to notify.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section id="how" className="bg-[#1B2233] text-white py-16 md:py-24 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-[#B07C34] text-xs font-semibold uppercase tracking-wider mb-4">
                        The workshop, in motion
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
                        Watch an order move down the line.
                    </h2>
                    <p className="text-gray-300 mb-12 max-w-2xl">
                        Every garment follows the same path — and everyone in the shop can see exactly where it stands. When it reaches the end, the customer is notified for you.
                    </p>

                    <div className="relative mb-8">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-3 left-0 right-0 h-0.5 bg-gradient-to-r from-[#B07C34] via-[#B07C34] to-[#B07C34] bg-[length:15px_2px] bg-repeat-x" style={{backgroundImage: "repeating-linear-gradient(90deg, #B07C34 0px, #B07C34 15px, transparent 15px, transparent 30px)"}}></div>

                        <div className="grid md:grid-cols-5 gap-4 md:gap-0 relative z-10">
                            {[
                                { stage: "01", title: "Received", desc: "Order logged against the customer, with price and notes." },
                                { stage: "02", title: "Cutting", desc: "Cloth cut to the recorded measurements." },
                                { stage: "03", title: "Sewing", desc: "The garment takes shape on the machine." },
                                { stage: "04", title: "Finishing", desc: "Buttons, hems, and the final press." },
                                { stage: "05", title: "Completed", desc: "Only an owner can mark it done — then the client is told." }
                            ].map((step: any, idx: number) => (
                                <div key={idx} className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-6 h-6 border-4 border-[#B07C34] rounded-full bg-[#1B2233]"></div>
                                    </div>
                                    <div className="text-[#B07C34] text-xs font-semibold uppercase tracking-wider mb-2">Stage {step.stage}</div>
                                    <h3 className="font-serif text-lg mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-300">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black/30 border border-[#B07C34]/30 rounded p-6">
                        <p className="text-gray-200">"Your Wedding Agbada is ready for pickup." — sent automatically on completion.</p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="team" className="bg-[#F1EFE9] py-16 md:py-24 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-[#B07C34] text-xs font-semibold uppercase tracking-wider mb-4">
                        Built for the whole shop
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
                        Owners set the rules. Tailors do the work.
                    </h2>
                    <p className="text-gray-600 mb-12">
                        Add your team, and everyone sees only your shop's customers and orders — never anyone else's.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white border border-black/8 rounded-lg p-8">
                            <span className="inline-block bg-[#FBF0E6] text-[#B07C34] text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded mb-4">Owner · Super Admin</span>
                            <h3 className="font-serif text-2xl mb-6">You hold the keys</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start"><span className="text-[#B07C34] mr-3 font-bold">✓</span>Approve or suspend staff with a tap</li>
                                <li className="flex items-start"><span className="text-[#B07C34] mr-3 font-bold">✓</span>Create the measurement templates the shop uses</li>
                                <li className="flex items-start"><span className="text-[#B07C34] mr-3 font-bold">✓</span>Set prices and mark orders complete</li>
                                <li className="flex items-start"><span className="text-[#B07C34] mr-3 font-bold">✓</span>Edit your company name and details</li>
                            </ul>
                        </div>

                        <div className="bg-white border border-black/8 rounded-lg p-8">
                            <span className="inline-block bg-[#FBF0E6] text-[#B07C34] text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded mb-4">Tailors · Staff</span>
                            <h3 className="font-serif text-2xl mb-6">The team gets to work</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start"><span className="text-[#B07C34] mr-3 font-bold">✓</span>Add customers and record their measurements</li>
                                <li className="flex items-start"><span className="text-[#B07C34] mr-3 font-bold">✓</span>Take new orders and move them through the workflow</li>
                                <li className="flex items-start"><span className="text-[#B07C34] mr-3 font-bold">✓</span>Join in seconds with the shop's invite code</li>
                                <li className="flex items-start"><span className="text-[#B07C34] mr-3 font-bold">✓</span>See only what belongs to their shop</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-[#F1EFE9] py-16 md:py-24 px-6 md:px-12">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="text-[#B07C34] text-xs font-semibold uppercase tracking-wider mb-4">
                        Ready when you are
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
                        Give your workshop its measure.
                    </h2>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        Register your shop, add your team, and start turning measurements into finished orders — with the client notified at every finish line.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
                        <Link href="/register/company" className="bg-[#B07C34] text-white px-8 py-3 rounded font-semibold hover:bg-[#9a6a2a] transition">
                            Get started
                        </Link>
                        <Link href="/login" className="border border-[#1B2233] text-[#1B2233] px-8 py-3 rounded font-semibold hover:bg-black/5 transition">
                            Sign in
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500">
                        Free to start · No card needed · Your shop is approved before it goes live.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1B2233] text-white text-center py-12 px-6 space-y-6">
                <div>
                    <p className="text-sm text-[#B07C34] font-semibold uppercase tracking-wider mb-2">Manage. Measure. Master.</p>
                    <p className="mb-2">&copy; 2026 TailorEase. Built for busy shops.</p>
                </div>
                <p className="text-sm text-gray-400">
                    <a href="#" className="text-[#B07C34] hover:underline">Privacy</a>
                    {" "} · {" "}
                    <a href="#" className="text-[#B07C34] hover:underline">Terms</a>
                    {" "} · {" "}
                    <a href="#" className="text-[#B07C34] hover:underline">Contact</a>
                </p>
            </footer>
        </div>
    )
}
