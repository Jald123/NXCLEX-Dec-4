import { Card } from '@nclex/shared-ui'

export default function FreeTrialHome() {
    return (
        <div className="px-4 py-6 sm:px-0">
            {/* Hero Section */}
            <div className="text-center mb-12 py-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Try NCLEX NGN Questions
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-2">
                        Completely Free
                    </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Experience our premium NCLEX NGN practice platform with no credit card required
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/demo"
                        className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-lg font-medium transition-colors"
                    >
                        Start Free Demo
                    </a>
                    <a
                        href="#features"
                        className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 text-lg font-medium transition-colors"
                    >
                        Learn More
                    </a>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="mb-12">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    What You'll Get in the Free Trial
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <div className="text-center">
                            <div className="text-4xl mb-3">📝</div>
                            <h3 className="font-semibold text-lg mb-2">Sample Questions</h3>
                            <p className="text-sm text-gray-600">
                                Access a curated selection of NCLEX NGN style questions
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="text-center">
                            <div className="text-4xl mb-3">💡</div>
                            <h3 className="font-semibold text-lg mb-2">Detailed Explanations</h3>
                            <p className="text-sm text-gray-600">
                                Understand the rationale behind each correct and incorrect answer
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="text-center">
                            <div className="text-4xl mb-3">🎯</div>
                            <h3 className="font-semibold text-lg mb-2">Trap Analysis</h3>
                            <p className="text-sm text-gray-600">
                                Learn to identify common traps and distractors
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="text-center">
                            <div className="text-4xl mb-3">🧠</div>
                            <h3 className="font-semibold text-lg mb-2">Mnemonics</h3>
                            <p className="text-sm text-gray-600">
                                Evidence-based memory aids to help you remember key concepts
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="text-center">
                            <div className="text-4xl mb-3">⏱️</div>
                            <h3 className="font-semibold text-lg mb-2">Timed Practice</h3>
                            <p className="text-sm text-gray-600">
                                Simulate real exam conditions with timed sessions
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="text-center">
                            <div className="text-4xl mb-3">📊</div>
                            <h3 className="font-semibold text-lg mb-2">Performance Tracking</h3>
                            <p className="text-sm text-gray-600">
                                See your progress and identify areas for improvement
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-lg mb-6 opacity-90">
                    Join thousands of nursing students preparing for NCLEX success
                </p>
                <a
                    href="/demo"
                    className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 text-lg font-medium transition-colors"
                >
                    Try Demo Questions Now
                </a>
                <p className="text-sm mt-4 opacity-75">
                    No sign-up required • No credit card needed • Instant access
                </p>
            </div>

            {/* Three Gates Section */}
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    Choose Your Path
                </h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="text-center">
                            <div className="text-5xl mb-4">👨‍💼</div>
                            <h3 className="font-bold text-xl mb-3">Admin Portal</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Create and manage NCLEX content with our powerful admin tools
                            </p>
                            <a
                                href="http://localhost:3000"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                                Admin Login →
                            </a>
                        </div>
                    </Card>

                    <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 border-purple-600">
                        <div className="text-center">
                            <div className="text-5xl mb-4">🎓</div>
                            <h3 className="font-bold text-xl mb-3">Student Portal</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Full access to all questions, progress tracking, and study tools
                            </p>
                            <a
                                href="http://localhost:3001"
                                className="inline-block px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium"
                            >
                                Student Login →
                            </a>
                        </div>
                    </Card>

                    <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="text-center">
                            <div className="text-5xl mb-4">✨</div>
                            <h3 className="font-bold text-xl mb-3">Free Trial</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Try our platform with sample questions - no commitment required
                            </p>
                            <a
                                href="/demo"
                                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                            >
                                Start Free Trial →
                            </a>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
