'use client';

import { signOut, useSession } from 'next-auth/react';

export default function LogoutButton() {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="ml-4 text-gray-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
        </button>
    );
}
