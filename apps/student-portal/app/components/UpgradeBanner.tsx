'use client';

import Link from 'next/link';

interface UpgradeBannerProps {
    lockedCount?: number;
}

export default function UpgradeBanner({ lockedCount = 0 }: UpgradeBannerProps) {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-white text-lg font-bold mb-2">
                        🎓 Upgrade to Premium
                    </h3>
                    <p className="text-blue-100 text-sm">
                        {lockedCount > 0
                            ? `Unlock ${lockedCount} more premium questions and get full access to all NCLEX NGN content!`
                            : 'Get full access to all NCLEX NGN content, including premium questions, analytics, and more!'}
                    </p>
                </div>
                <div className="ml-6">
                    <Link
                        href="/pricing"
                        className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
                    >
                        Upgrade Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
