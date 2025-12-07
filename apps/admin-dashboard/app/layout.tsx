import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { ExamProfileProvider } from './context/ExamProfileContext'
import ExamProfileSelector from './components/ExamProfileSelector'
import LogoutButton from './components/LogoutButton'
import SessionProviderWrapper from './components/SessionProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'NCLEX NGN Admin Dashboard',
    description: 'Admin portal for NCLEX NGN content creation and management',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <SessionProviderWrapper>
                    <ExamProfileProvider>
                        <div className="min-h-screen bg-gray-50">
                            {/* Navigation */}
                            <nav className="bg-white shadow-sm border-b border-gray-200">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                    <div className="flex justify-between h-16">
                                        <div className="flex">
                                            <div className="flex-shrink-0 flex items-center">
                                                <h1 className="text-xl font-bold text-blue-600">NCLEX NGN Admin</h1>
                                            </div>
                                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                                <Link
                                                    href="/"
                                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/generator"
                                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                                >
                                                    Generator
                                                </Link>
                                                <Link
                                                    href="/trap-hunter"
                                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                                >
                                                    Trap Hunter
                                                </Link>
                                                <Link
                                                    href="/mnemonic-creator"
                                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                                >
                                                    Mnemonic Creator
                                                </Link>
                                                <Link
                                                    href="/qa"
                                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                                >
                                                    QA Workflow
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <ExamProfileSelector />
                                            <LogoutButton />
                                        </div>
                                    </div>
                                </div>
                            </nav>

                            {/* Main Content */}
                            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                                {children}
                            </main>
                        </div>
                    </ExamProfileProvider>
                </SessionProviderWrapper>
            </body>
        </html>
    )
}
