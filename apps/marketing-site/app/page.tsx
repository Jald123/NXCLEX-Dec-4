'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gradient">NCLEX NGN Prep</h1>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
                            <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Reviews</a>
                            <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</a>
                            <Link
                                href="http://localhost:3001/login"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="http://localhost:3001/register"
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in">
                            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                ⭐ Trusted by 10,000+ Nursing Students
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Pass Your NCLEX on the{' '}
                                <span className="text-gradient">First Try</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                AI-powered adaptive learning with 1000+ Next Generation NCLEX questions.
                                Personalized study plans, spaced repetition, and wellness tools designed
                                for nursing students.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    href="http://localhost:3001/register"
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all text-center"
                                >
                                    Start Free 7-Day Trial →
                                </Link>
                                <a
                                    href="#demo"
                                    className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition-all text-center"
                                >
                                    Watch Demo
                                </a>
                            </div>
                            <div className="flex items-center gap-8 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Cancel anytime</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative animate-slide-up">
                            <div className="glass rounded-2xl p-8 shadow-2xl">
                                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white mb-6">
                                    <div className="text-sm font-semibold mb-2">NCLEX Readiness Score</div>
                                    <div className="text-5xl font-bold mb-2">87%</div>
                                    <div className="text-sm opacity-90">Ready to Test ✅</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Overall Accuracy</span>
                                        <span className="text-green-600 font-bold">92%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Questions Practiced</span>
                                        <span className="text-blue-600 font-bold">847</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Study Streak</span>
                                        <span className="text-purple-600 font-bold">14 days 🔥</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
                            <div className="text-blue-100">Pass Rate</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
                            <div className="text-blue-100">NGN Questions</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                            <div className="text-blue-100">Students</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">4.9★</div>
                            <div className="text-blue-100">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Everything You Need to <span className="text-gradient">Pass NCLEX</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our AI-powered platform adapts to your learning style and focuses on your weak areas
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🤖',
                                title: 'AI-Powered Adaptive Learning',
                                description: 'Smart algorithm identifies your weak areas and creates personalized study plans that adapt as you improve.'
                            },
                            {
                                icon: '📚',
                                title: '1000+ NGN Practice Questions',
                                description: 'Comprehensive question bank covering all Next Generation NCLEX item types with detailed explanations.'
                            },
                            {
                                icon: '🎯',
                                title: 'Spaced Repetition System',
                                description: 'Science-backed review scheduling ensures you remember what you learn for the long term.'
                            },
                            {
                                icon: '📊',
                                title: 'Advanced Analytics Dashboard',
                                description: 'Track your progress with detailed metrics, trend analysis, and NCLEX readiness predictions.'
                            },
                            {
                                icon: '💡',
                                title: 'Clinical Pearls & Expert Tips',
                                description: 'Learn from experienced nurses with memorable insights and real-world application strategies.'
                            },
                            {
                                icon: '🧘',
                                title: 'Wellness & Stress Management',
                                description: 'Unique breathing exercises and meditation tools to manage test anxiety and prevent burnout.'
                            },
                        ].map((feature, index) => (
                            <div key={index} className="glass rounded-xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Why Choose <span className="text-gradient">NCLEX NGN Prep</span>?
                        </h2>
                        <p className="text-xl text-gray-600">
                            See how we compare to other NCLEX prep platforms
                        </p>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                                <tr>
                                    <th className="py-4 px-6 text-left">Feature</th>
                                    <th className="py-4 px-6 text-center">NCLEX NGN Prep</th>
                                    <th className="py-4 px-6 text-center">UWorld ($429/yr)</th>
                                    <th className="py-4 px-6 text-center">Kaplan ($499)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {[
                                    { feature: 'AI Adaptive Learning', us: true, uworld: false, kaplan: false },
                                    { feature: 'Spaced Repetition', us: true, uworld: false, kaplan: false },
                                    { feature: 'Wellness Tools', us: true, uworld: false, kaplan: false },
                                    { feature: 'Clinical Pearls', us: true, uworld: true, kaplan: false },
                                    { feature: 'NGN Questions', us: true, uworld: true, kaplan: true },
                                    { feature: 'Detailed Analytics', us: true, uworld: true, kaplan: true },
                                    { feature: 'Price (Annual)', us: '$299', uworld: '$429', kaplan: '$499' },
                                ].map((row, index) => (
                                    <tr key={index} className="hover:bg-blue-50 transition-colors">
                                        <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                                        <td className="py-4 px-6 text-center">
                                            {typeof row.us === 'boolean' ? (
                                                row.us ? <span className="text-green-500 text-2xl">✓</span> : <span className="text-gray-300 text-2xl">✗</span>
                                            ) : (
                                                <span className="font-bold text-blue-600">{row.us}</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {typeof row.uworld === 'boolean' ? (
                                                row.uworld ? <span className="text-green-500 text-2xl">✓</span> : <span className="text-gray-300 text-2xl">✗</span>
                                            ) : (
                                                <span className="text-gray-600">{row.uworld}</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {typeof row.kaplan === 'boolean' ? (
                                                row.kaplan ? <span className="text-green-500 text-2xl">✓</span> : <span className="text-gray-300 text-2xl">✗</span>
                                            ) : (
                                                <span className="text-gray-600">{row.kaplan}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Simple, Transparent <span className="text-gradient">Pricing</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            Choose the plan that works best for you
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Monthly Plan */}
                        <div className="glass rounded-2xl p-8 hover:shadow-2xl transition-all">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    $29<span className="text-2xl text-gray-600">/mo</span>
                                </div>
                                <p className="text-gray-600">Perfect for focused study</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Full access to 1000+ questions',
                                    'AI adaptive learning',
                                    'Spaced repetition system',
                                    'Advanced analytics',
                                    'Wellness tools',
                                    'Clinical pearls',
                                    'Cancel anytime'
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="http://localhost:3001/register"
                                className="block w-full py-4 bg-blue-600 text-white rounded-full font-bold text-center hover:bg-blue-700 transition-colors"
                            >
                                Start Free Trial
                            </Link>
                        </div>

                        {/* Annual Plan */}
                        <div className="glass rounded-2xl p-8 hover:shadow-2xl transition-all border-4 border-blue-600 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                                BEST VALUE - Save $60
                            </div>
                            <div className="text-center mb-6 mt-4">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Annual</h3>
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    $299<span className="text-2xl text-gray-600">/yr</span>
                                </div>
                                <p className="text-gray-600">Just $24.92/month</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Everything in Monthly, plus:',
                                    '2 months FREE',
                                    'Priority support',
                                    'Early access to new features',
                                    'Downloadable study guides',
                                    'Lifetime access to notes',
                                    'Money-back guarantee'
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className={index === 0 ? 'font-bold text-gray-900' : 'text-gray-700'}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="http://localhost:3001/register"
                                className="block w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-bold text-center hover:shadow-lg transition-all"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Loved by <span className="text-gradient">Nursing Students</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            See what our students are saying
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Sarah M.',
                                role: 'RN, BSN',
                                rating: 5,
                                text: 'I passed NCLEX on my first try! The adaptive learning really helped me focus on my weak areas. The wellness tools were a game-changer for managing test anxiety.',
                                image: '👩‍⚕️'
                            },
                            {
                                name: 'James L.',
                                role: 'New Grad RN',
                                rating: 5,
                                text: 'Best NCLEX prep platform hands down. The clinical pearls from expert nurses were so helpful. Way better than UWorld and half the price!',
                                image: '👨‍⚕️'
                            },
                            {
                                name: 'Emily R.',
                                role: 'BSN Student',
                                rating: 5,
                                text: 'The spaced repetition system is brilliant! I actually retained what I studied. The analytics dashboard showed me exactly where I needed to improve.',
                                image: '👩‍🎓'
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="glass rounded-xl p-8">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.text}</p>
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl">{testimonial.image}</div>
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Frequently Asked <span className="text-gradient">Questions</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'How does the free trial work?',
                                a: 'Start with a 7-day free trial with full access to all features. No credit card required. Cancel anytime before the trial ends and you won\'t be charged.'
                            },
                            {
                                q: 'What makes your platform different from UWorld or Kaplan?',
                                a: 'We offer AI-powered adaptive learning that personalizes your study plan, spaced repetition for better retention, and unique wellness tools to manage test anxiety. Plus, we\'re more affordable at $299/year vs $429-499 for competitors.'
                            },
                            {
                                q: 'How many practice questions do you have?',
                                a: 'We have 1000+ Next Generation NCLEX questions covering all item types (MCQ, SATA, Matrix, Bow-Tie, etc.) with detailed explanations and clinical pearls from expert nurses.'
                            },
                            {
                                q: 'Can I use this on my phone or tablet?',
                                a: 'Yes! Our platform is fully responsive and works on all devices - desktop, tablet, and mobile. Study anywhere, anytime.'
                            },
                            {
                                q: 'What is your pass rate?',
                                a: 'Our students have a 95% first-time pass rate on the NCLEX exam, significantly higher than the national average of 82%.'
                            },
                            {
                                q: 'Do you offer a money-back guarantee?',
                                a: 'Yes! If you don\'t pass NCLEX after using our platform for 90 days, we\'ll refund your subscription. We\'re that confident in our system.'
                            }
                        ].map((faq, index) => (
                            <div key={index} className="glass rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
                                >
                                    <span className="font-bold text-gray-900 text-lg">{faq.q}</span>
                                    <svg
                                        className={`w-6 h-6 text-blue-600 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === index && (
                                    <div className="px-8 pb-6 text-gray-700 leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Pass Your NCLEX?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join 10,000+ nursing students who are crushing their NCLEX prep
                    </p>
                    <Link
                        href="http://localhost:3001/register"
                        className="inline-block px-12 py-5 bg-white text-blue-600 rounded-full font-bold text-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                    >
                        Start Your Free 7-Day Trial →
                    </Link>
                    <p className="mt-6 text-blue-100">
                        No credit card required • Cancel anytime • 95% pass rate
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="text-white font-bold text-xl mb-4">NCLEX NGN Prep</h3>
                            <p className="text-sm leading-relaxed">
                                AI-powered NCLEX preparation platform designed to help nursing students pass on their first try.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="http://localhost:3002" className="hover:text-white transition-colors">Free Trial</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Connect</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>&copy; 2025 NCLEX NGN Prep. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
