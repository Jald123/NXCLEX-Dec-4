import { NextRequest, NextResponse } from 'next/server';
import { auditContent } from '@/lib/llm/auditContent';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json(
                { error: 'Missing type or data' },
                { status: 400 }
            );
        }

        const auditReport = await auditContent(type, data);
        return NextResponse.json(auditReport);
    } catch (error) {
        console.error('Audit API Error:', error);
        return NextResponse.json(
            { error: 'Failed to perform AI audit', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
