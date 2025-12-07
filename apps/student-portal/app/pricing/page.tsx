'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@nclex/shared-ui';

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (priceId: string, planName: string) => {
        if (!session) {
            router.push('/login?callbackUrl=/pricing');
            return;
        }

        setLoading(planName);

        try {
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to start checkout. Please try again.');
            setLoading(null);
        }
    };

    const userRole = (session?.user as any)?.role;
    const isPaid = userRole === 'student_paid';

    return (
        <div className="px-4 py-12 sm:px-0 max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-xl text-gray-600">
                    Unlock full access to NCLEX NGN preparation materials
                </p>
            </div>

            {isPaid && (
                <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">
                        ✅ You already have an active subscription!
                    </p>
                    <button
                        onClick={() => router.push('/account')}
                        className="mt-2 text-green-700 underline hover:text-green-900"
                    >
                        Manage your subscription →
                    </button>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Monthly Plan */}
                <Card className="relative">
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Monthly Plan
                        </h3>
                        <div className="mb-6">
                            <span className="text-5xl font-bold text-gray-900">$29.99</span>
                            <span className="text-gray-600">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Unlimited access to all questions</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">NCLEX NGN 2025 & 2026+ content</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Trap Hunter & Mnemonics</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Progress tracking & analytics</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Cancel anytime</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCheckout(
                                process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
                                'monthly'
                            )}
                            disabled={loading !== null || isPaid}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading === 'monthly' ? 'Loading...' : isPaid ? 'Current Plan' : 'Choose Monthly'}
                        </button>
                    </div>
                </Card>

                {/* Annual Plan */}
                <Card className="relative border-2 border-blue-500">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                        BEST VALUE
                    </div>
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Annual Plan
                        </h3>
                        <div className="mb-2">
                            <span className="text-5xl font-bold text-gray-900">$299.99</span>
                            <span className="text-gray-600">/year</span>
                        </div>
                        <p className="text-green-600 font-medium mb-6">
                            Save $60 (2 months free!)
                        </p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Everything in Monthly Plan</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700 font-semibold">2 months free ($60 savings)</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Priority support</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Early access to new content</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Cancel anytime</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCheckout(
                                process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!,
                                'annual'
                            )}
                            disabled={loading !== null || isPaid}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading === 'annual' ? 'Loading...' : isPaid ? 'Current Plan' : 'Choose Annual'}
                        </button>
                    </div>
                </Card>
            </div>

            <div className="mt-12 text-center text-gray-600 text-sm">
                <p>💳 Secure payment processing by Stripe</p>
                <p className="mt-2">🔒 Cancel anytime, no questions asked</p>
            </div>
        </div>
    );
}
