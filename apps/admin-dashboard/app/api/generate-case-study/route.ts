import { NextRequest, NextResponse } from 'next/server';
import type { CaseStudyGenerationParams, ExamProfile } from '@nclex/shared-api-types';
import { generateCaseStudyLLM } from '@/lib/llm/generateCaseStudy';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.params || !body.examProfile) {
            return NextResponse.json(
                { error: 'Missing required fields: params and examProfile' },
                { status: 400 }
            );
        }

        const { params, examProfile } = body as {
            params: CaseStudyGenerationParams;
            examProfile: ExamProfile;
        };

        // Validate params structure
        if (!params.ageGroup || !params.clinicalDomain || !params.complexity) {
            return NextResponse.json(
                { error: 'Invalid params: missing ageGroup, clinicalDomain, or complexity' },
                { status: 400 }
            );
        }

        // Validate examProfile
        if (examProfile !== 'nclex_2025' && examProfile !== 'nclex_2026') {
            return NextResponse.json(
                { error: 'Invalid examProfile: must be nclex_2025 or nclex_2026' },
                { status: 400 }
            );
        }

        // Generate case study using LLM (stub for now)
        const items = await generateCaseStudyLLM(params, examProfile);

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error generating case study:', error);
        return NextResponse.json(
            { error: 'Failed to generate case study' },
            { status: 500 }
        );
    }
}
