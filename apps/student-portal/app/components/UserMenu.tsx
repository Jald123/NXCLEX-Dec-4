'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function UserMenu() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="text-sm text-gray-500">Loading...</div>;
    }

    if (!session) {
        return (
            <div className="flex items-center gap-4">
                <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                    Login
                </Link>
                <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    Sign Up
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{session.user?.name}</span>
            </span>
            <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-gray-700 hover:text-red-600 text-sm font-medium flex items-center gap-1"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </button>
        </div>
    );
}
