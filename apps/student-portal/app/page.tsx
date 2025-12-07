import { Card } from '@nclex/shared-ui'

export default function StudentDashboard() {
    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                <p className="text-gray-600">Continue your NCLEX NGN preparation journey</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Questions Completed</p>
                            <p className="text-3xl font-bold mt-1">0</p>
                        </div>
                        <div className="text-4xl opacity-50">📝</div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Accuracy Rate</p>
                            <p className="text-3xl font-bold mt-1">--%</p>
                        </div>
                        <div className="text-4xl opacity-50">✓</div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Study Streak</p>
                            <p className="text-3xl font-bold mt-1">0 days</p>
                        </div>
                        <div className="text-4xl opacity-50">🔥</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card title="Quick Start">
                    <p className="text-sm text-gray-600 mb-4">
                        Jump into practice questions or review your progress
                    </p>
                    <div className="space-y-3">
                        <a
                            href="/questions"
                            className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Start Practice Session
                        </a>
                        <a
                            href="/progress"
                            className="block w-full text-center px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                            View My Progress
                        </a>
                    </div>
                </Card>

                <Card title="Recent Activity">
                    <p className="text-sm text-gray-500 mb-4">Your recent practice sessions</p>
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No recent activity</p>
                        <p className="text-xs mt-1">Start practicing to see your activity here</p>
                    </div>
                </Card>

                <Card title="Study Tips">
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">💡</span>
                            <span>Practice consistently - even 15 minutes daily helps</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">💡</span>
                            <span>Review explanations for both correct and incorrect answers</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">💡</span>
                            <span>Focus on understanding concepts, not memorization</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">💡</span>
                            <span>Use mnemonics to remember key information</span>
                        </li>
                    </ul>
                </Card>

                <Card title="Upcoming Features">
                    <p className="text-sm text-gray-500 mb-4">Coming soon to enhance your learning</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>🎯 Personalized question recommendations</li>
                        <li>📊 Detailed performance analytics</li>
                        <li>🧠 AI-powered study insights</li>
                        <li>👥 Study groups and peer learning</li>
                    </ul>
                </Card>
            </div>
        </div>
    )
}
