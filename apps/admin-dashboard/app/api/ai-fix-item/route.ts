import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { item, auditReport, type = 'item' } = body;

        if (!item || !auditReport) {
            return NextResponse.json({ error: 'Item and audit report are required' }, { status: 400 });
        }

        let prompt = '';

        if (type === 'item') {
            const issuesList = auditReport.issues.map((issue: any, i: number) =>
                `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.message}\n   Suggested fix: ${issue.suggested_fix}`
            ).join('\n\n');

            prompt = `You are an expert NCLEX question writer. Fix the following issues in this NCLEX question.

Current Question:
Stem: ${item.stem}
Options: ${item.options?.map((o: any, i: number) => `${i + 1}. ${o.text} ${o.isCorrect ? '(CORRECT)' : ''}`).join('\n')}
Rationale: ${item.rationale}

Issues to Fix:
${issuesList}

Return a JSON object with the improved question:
{
  "stem": "Improved stem text",
  "options": [
    { "id": "1", "text": "Option text", "isCorrect": false },
    { "id": "2", "text": "Option text", "isCorrect": true },
    { "id": "3", "text": "Option text", "isCorrect": false },
    { "id": "4", "text": "Option text", "isCorrect": false }
  ],
  "rationale": "Improved rationale",
  "fixSummary": "Brief summary of changes made"
}`;
        } else if (type === 'trap') {
            const issuesList = auditReport.issues.map((issue: any, i: number) =>
                `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.message}`
            ).join('\n\n');

            prompt = `You are an expert in NCLEX distractor creation. Improve these distractors based on the issues identified.

Current Distractors:
${item.options?.map((o: any, i: number) => `${i + 1}. ${o.text} ${o.isTrap ? '(trap)' : ''} - ${o.trapReason || ''}`).join('\n')}

Issues to Fix:
${issuesList}

Return a JSON object with improved distractors:
{
  "options": [
    { "id": "1", "text": "Improved distractor", "isTrap": true, "trapReason": "Targets X misconception" }
  ],
  "fixSummary": "Brief summary of improvements made"
}`;
        } else if (type === 'mnemonic') {
            const issuesList = auditReport.issues.map((issue: any, i: number) =>
                `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.message}`
            ).join('\n\n');

            prompt = `You are an expert in nursing education mnemonics. Improve this mnemonic based on the issues identified.

Current Mnemonic:
Concept: ${item.concept}
Mnemonic: ${item.mnemonicText}
Explanation: ${item.explanation}

Issues to Fix:
${issuesList}

Return a JSON object with the improved mnemonic:
{
  "mnemonicText": "Improved mnemonic",
  "explanation": "Improved explanation",
  "fixSummary": "Brief summary of improvements made"
}`;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let fixedData;
        try {
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            const jsonText = jsonMatch ? jsonMatch[1] : text;
            fixedData = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Failed to parse AI response:', text);
            return NextResponse.json(
                { error: 'Failed to parse AI fix response', details: text },
                { status: 500 }
            );
        }

        const fixedItem = {
            ...item,
            ...fixedData,
            lastUpdatedAt: new Date().toISOString()
        };

        return NextResponse.json(fixedItem);
    } catch (error) {
        console.error('AI Fix error:', error);
        return NextResponse.json(
            { error: 'Failed to perform AI fix', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
