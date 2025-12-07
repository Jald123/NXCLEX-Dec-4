'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // Optional: Verify the session with your backend
        if (sessionId) {
            console.log('Checkout session:', sessionId);
        }
    }, [sessionId]);

    return (
        <div className="px-4 py-12 sm:px-0 max-w-2xl mx-auto">
            <Card className="text-center p-12">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to Premium!
                    </h1>
                    <p className="text-xl text-gray-600">
                        Your subscription is now active
                    </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        What's Next?
                    </h2>
                    <ul className="text-left space-y-2 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">✓</span>
                            Access all premium NCLEX NGN questions
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">✓</span>
                            Use Trap Hunter and Mnemonics tools
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">✓</span>
                            Track your progress and performance
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">✓</span>
                            Prepare for both 2025 and 2026+ exams
                        </li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/questions"
                        className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Start Practicing Now →
                    </Link>
                    <Link
                        href="/account"
                        className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Manage Subscription
                    </Link>
                </div>

                <p className="mt-6 text-sm text-gray-500">
                    A confirmation email has been sent to your inbox
                </p>
            </Card>
        </div>
    );
}
