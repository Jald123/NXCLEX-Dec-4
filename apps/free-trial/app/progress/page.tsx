import { Card } from '@nclex/shared-ui'

export default function ProgressPage() {
    return (
        <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
            <p className="text-gray-600 mb-6">Track your performance and improvement over time</p>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
                <Card title="Overall Statistics">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Total Questions Attempted</span>
                            <span className="text-lg font-bold text-gray-900">0</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Correct Answers</span>
                            <span className="text-lg font-bold text-green-600">0</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Incorrect Answers</span>
                            <span className="text-lg font-bold text-red-600">0</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Overall Accuracy</span>
                            <span className="text-lg font-bold text-blue-600">--%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Study Time (Total)</span>
                            <span className="text-lg font-bold text-gray-900">0 hours</span>
                        </div>
                    </div>
                </Card>

                <Card title="Performance by Topic">
                    <div className="space-y-3">
                        <div className="text-sm text-gray-400 text-center py-8">
                            No data available yet
                            <p className="text-xs mt-2">Start practicing to see your performance breakdown</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Progress Over Time">
                <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <div className="text-4xl mb-2">📈</div>
                        <p className="text-sm">Performance chart will appear here</p>
                        <p className="text-xs mt-1">Complete practice sessions to see your progress</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
                <Card title="Strengths">
                    <p className="text-sm text-gray-500 mb-3">Topics you excel at</p>
                    <div className="text-sm text-gray-400 text-center py-4">
                        No data yet
                    </div>
                </Card>

                <Card title="Areas for Improvement">
                    <p className="text-sm text-gray-500 mb-3">Topics to focus on</p>
                    <div className="text-sm text-gray-400 text-center py-4">
                        No data yet
                    </div>
                </Card>

                <Card title="Study Streak">
                    <p className="text-sm text-gray-500 mb-3">Keep your momentum going!</p>
                    <div className="text-center py-4">
                        <div className="text-4xl mb-2">🔥</div>
                        <div className="text-3xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-600 mt-1">days</div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
