import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'NCLEX NGN Prep - Pass Your NCLEX Exam with AI-Powered Practice | #1 NCLEX Study Platform',
    description: 'Ace your NCLEX-RN exam with our AI-powered practice platform. 1000+ Next Generation NCLEX questions, adaptive learning, spaced repetition, and wellness tools. 95% pass rate. Start your free trial today!',
    keywords: 'NCLEX prep, NCLEX-RN, NCLEX practice questions, Next Generation NCLEX, NGN NCLEX, nursing exam prep, NCLEX study guide, NCLEX review, nursing student resources, NCLEX test prep',
    authors: [{ name: 'NCLEX NGN Prep' }],
    openGraph: {
        title: 'NCLEX NGN Prep - AI-Powered NCLEX Exam Preparation',
        description: 'Pass your NCLEX exam on the first try with adaptive learning, 1000+ practice questions, and personalized study plans.',
        type: 'website',
        url: 'https://nclexngnprep.com',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'NCLEX NGN Prep Platform',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NCLEX NGN Prep - Pass Your NCLEX Exam',
        description: 'AI-powered NCLEX preparation with adaptive learning and 1000+ practice questions.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="canonical" href="https://nclexngnprep.com" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'EducationalOrganization',
                            name: 'NCLEX NGN Prep',
                            description: 'AI-powered NCLEX exam preparation platform',
                            url: 'https://nclexngnprep.com',
                            sameAs: [
                                'https://facebook.com/nclexngnprep',
                                'https://twitter.com/nclexngnprep',
                                'https://instagram.com/nclexngnprep',
                            ],
                            offers: {
                                '@type': 'Offer',
                                category: 'Educational Services',
                                priceCurrency: 'USD',
                                price: '29.99',
                                priceValidUntil: '2025-12-31',
                            },
                        }),
                    }}
                />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    )
}
