'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total: 0,
        inQA: 0,
        published: 0,
        loading: true
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            const items = data.items || [];

            setStats({
                total: items.length,
                inQA: items.filter((i: any) => ['ai_audit', 'ai_fix', 'human_signoff'].includes(i.status)).length,
                published: items.filter((i: any) => ['published_student', 'published_trial'].includes(i.status)).length,
                loading: false
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card title="NCLEX NGN Generator">
                    <p className="text-sm">
                        Create and manage NCLEX NGN questions through the complete workflow:
                        draft → QA → approval → publish
                    </p>
                    <div className="mt-4">
                        <Link href="/generator" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Open Generator →
                        </Link>
                    </div>
                </Card>

                <Card title="Trap Hunter">
                    <p className="text-sm">
                        Analyze and generate distractors and traps for questions to enhance
                        critical thinking assessment
                    </p>
                    <div className="mt-4">
                        <Link href="/trap-hunter" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Open Trap Hunter →
                        </Link>
                    </div>
                </Card>

                <Card title="Mnemonic Creator">
                    <p className="text-sm">
                        Create latest, evidence-informed mnemonics to help students
                        remember key concepts
                    </p>
                    <div className="mt-4">
                        <Link href="/mnemonic-creator" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Open Mnemonic Creator →
                        </Link>
                    </div>
                </Card>

                <Card title="QA Workflow">
                    <p className="text-sm">
                        Review and approve questions in the QA pipeline before publishing
                        to students
                    </p>
                    <div className="mt-4">
                        <Link href="/qa" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View QA Queue →
                        </Link>
                    </div>
                </Card>

                <Card title="Statistics">
                    <p className="text-sm">
                        View platform statistics and analytics
                    </p>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Questions:</span>
                            <span className="font-semibold">
                                {stats.loading ? '...' : stats.total}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">In QA:</span>
                            <span className="font-semibold">
                                {stats.loading ? '...' : stats.inQA}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Published:</span>
                            <span className="font-semibold">
                                {stats.loading ? '...' : stats.published}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card title="Quick Actions">
                    <p className="text-sm mb-4">Common administrative tasks</p>
                    <div className="space-y-2">
                        <Link href="/generator" className="block">
                            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                                + Create New Question
                            </button>
                        </Link>
                        <Link href="/mnemonic-creator" className="block">
                            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                                + Create New Mnemonic
                            </button>
                        </Link>
                        <Link href="/qa" className="block">
                            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                                📊 View QA Queue
                            </button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}
