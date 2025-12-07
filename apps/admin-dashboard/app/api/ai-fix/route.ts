import { NextRequest, NextResponse } from 'next/server';
import { generateFix } from '@/lib/llm/auditContent';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data, auditReport } = body;

        if (!type || !data || !auditReport) {
            return NextResponse.json(
                { error: 'Missing type, data, or auditReport' },
                { status: 400 }
            );
        }

        const fixedContent = await generateFix(type, data, auditReport);
        return NextResponse.json(fixedContent);
    } catch (error) {
        console.error('AI Fix API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI fix', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
