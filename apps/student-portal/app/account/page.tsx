'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@nclex/shared-ui';

export default function AccountPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const userRole = (session?.user as any)?.role;
    const subscriptionStatus = (session?.user as any)?.subscriptionStatus;
    const isPaid = userRole === 'student_paid';

    const handleManageSubscription = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/stripe/create-portal-session', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No portal URL returned');
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('Failed to open subscription management. Please try again.');
            setLoading(false);
        }
    };

    if (!session) {
        router.push('/login');
        return null;
    }

    return (
        <div className="px-4 py-12 sm:px-0 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

            <div className="space-y-6">
                {/* Profile Information */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-gray-900">{session.user?.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900">{session.user?.email}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Subscription Status */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>

                        {isPaid ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                                            <span className="text-lg font-semibold text-gray-900">Premium Active</span>
                                        </div>
                                        <p className="text-gray-600">
                                            You have full access to all content
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleManageSubscription}
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Loading...' : 'Manage Subscription'}
                                </button>

                                <p className="mt-4 text-sm text-gray-500">
                                    Update payment method, view invoices, or cancel your subscription
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full"></span>
                                            <span className="text-lg font-semibold text-gray-900">Free Trial</span>
                                        </div>
                                        <p className="text-gray-600">
                                            Limited access to trial content
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Upgrade to Premium</h3>
                                    <ul className="text-sm text-gray-700 space-y-1 mb-3">
                                        <li>✓ Unlimited access to all questions</li>
                                        <li>✓ NCLEX NGN 2025 & 2026+ content</li>
                                        <li>✓ Progress tracking & analytics</li>
                                        <li>✓ Trap Hunter & Mnemonics</li>
                                    </ul>
                                    <button
                                        onClick={() => router.push('/pricing')}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        View Plans
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
                        <p className="text-gray-600 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                            className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            onClick={() => alert('Account deletion not implemented yet')}
                        >
                            Delete Account
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
