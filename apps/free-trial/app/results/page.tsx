'use client';

import { useSearchParams } from 'next/navigation';
import { Card, Button } from '@nclex/shared-ui';
import Link from 'next/link';

export default function ResultsPage() {
    const searchParams = useSearchParams();
    const score = searchParams.get('score') || '0';
    const total = searchParams.get('total') || '0';
    const percentage = Math.round((parseInt(score) / parseInt(total)) * 100) || 0;

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <Card className="text-center p-8">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h1>
                <p className="text-gray-600 mb-8">Great job completing your practice session.</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Score</p>
                        <p className="text-2xl font-bold text-blue-900">{score}/{total}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Accuracy</p>
                        <p className="text-2xl font-bold text-green-900">{percentage}%</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Status</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {percentage >= 75 ? 'Pass' : 'Review'}
                        </p>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Link href="/questions">
                        <Button variant="outline">Practice More</Button>
                    </Link>
                    <Link href="/">
                        <Button>Back to Dashboard</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
