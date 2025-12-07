import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'NCLEX NGN Free Trial',
    description: 'Try NCLEX NGN practice questions for free',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                    {/* Navigation */}
                    <nav className="bg-white shadow-sm border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16">
                                <div className="flex">
                                    <div className="flex-shrink-0 flex items-center">
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            NCLEX NGN Free Trial
                                        </h1>
                                    </div>
                                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                        <Link
                                            href="/"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                        >
                                            Home
                                        </Link>
                                        <Link
                                            href="/demo"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                        >
                                            Try Demo
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                                        Sign In
                                    </a>
                                    <a
                                        href="#"
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                                    >
                                        Upgrade Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}
