import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { topic, questionType = 'Multiple Choice', count = 1, type = 'item' } = body;

        if (type === 'item') {
            const prompt = `You are an expert NCLEX-RN question writer. Generate ${count} complete, high-quality NCLEX question(s) about: ${topic || 'general nursing practice'}.

Requirements:
- Question type: ${questionType}
- Clear, realistic clinical scenario in the stem
- 4 plausible options (one correct, three distractors)
- Distractors should be tempting but clearly incorrect
- Detailed rationale explaining why the correct answer is right
- Aligned with NCLEX-RN test plan
- Appropriate difficulty for entry-level nurses

Return a JSON array of question objects:
[
  {
    "stem": "A nurse is caring for a client with [condition]. Which action should the nurse take first?",
    "options": [
      { "id": "1", "text": "Option A text", "isCorrect": false },
      { "id": "2", "text": "Option B text", "isCorrect": true },
      { "id": "3", "text": "Option C text", "isCorrect": false },
      { "id": "4", "text": "Option D text", "isCorrect": false }
    ],
    "rationale": "Detailed explanation of why option B is correct and why others are incorrect.",
    "questionType": "${questionType}",
    "clientNeed": "One of: Safe and Effective Care Environment, Health Promotion and Maintenance, Psychosocial Integrity, Physiological Integrity",
    "cognitiveLevel": "One of: Knowledge, Comprehension, Application, Analysis"
  }
]

Generate realistic, clinically accurate questions that test critical thinking.`;

            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON response
            let questions;
            try {
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
                const jsonText = jsonMatch ? jsonMatch[1] : text;
                questions = JSON.parse(jsonText);

                // Ensure it's an array
                if (!Array.isArray(questions)) {
                    questions = [questions];
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', text);
                return NextResponse.json(
                    { error: 'Failed to parse AI generation response', details: text },
                    { status: 500 }
                );
            }

            // Add metadata to each question
            const items = questions.map((q: any, index: number) => ({
                id: `item-${Date.now()}-${index}`,
                entryMode: 'ai_generated',
                status: 'draft',
                stem: q.stem,
                options: q.options || [],
                rationale: q.rationale,
                questionType: q.questionType || questionType,
                clientNeed: q.clientNeed,
                cognitiveLevel: q.cognitiveLevel,
                createdBy: 'AI Generator (Gemini 2.0 Flash)',
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString()
            }));

            return NextResponse.json({ items });

        } else if (type === 'trap') {
            const prompt = `You are an expert in NCLEX distractor analysis. Generate a trap analysis for this question stem: ${topic}

Create 4 distractors with trap analysis:
- 2-3 should be "traps" (target common misconceptions)
- All should be plausible
- Include trap reasoning

Return a JSON object:
{
  "stem": "${topic}",
  "options": [
    { "id": "1", "text": "Distractor text", "isTrap": true, "trapReason": "Targets misconception about X" },
    { "id": "2", "text": "Distractor text", "isTrap": false },
    { "id": "3", "text": "Distractor text", "isTrap": true, "trapReason": "Students often confuse Y with Z" },
    { "id": "4", "text": "Distractor text", "isTrap": true, "trapReason": "Partial knowledge trap" }
  ]
}`;

            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            let trapData;
            try {
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
                const jsonText = jsonMatch ? jsonMatch[1] : text;
                trapData = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('Failed to parse AI response:', text);
                return NextResponse.json(
                    { error: 'Failed to parse trap generation response' },
                    { status: 500 }
                );
            }

            const trapSet = {
                id: `trap-${Date.now()}`,
                entryMode: 'ai_generated',
                status: 'draft',
                ...trapData,
                createdBy: 'AI Generator (Gemini 2.0 Flash)',
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString()
            };

            return NextResponse.json({ items: [trapSet] });

        } else if (type === 'mnemonic') {
            const prompt = `You are an expert in nursing education mnemonics. Create a memorable mnemonic for: ${topic}

Requirements:
- Easy to remember
- Clinically accurate
- Appropriate for NCLEX level
- Clear explanation of each letter

Return a JSON object:
{
  "concept": "${topic}",
  "mnemonicText": "ABCDE (or similar)",
  "explanation": "A = First point\\nB = Second point\\n...",
  "category": "Assessment" | "Intervention" | "Pharmacology" | "Pathophysiology" | "Other"
}`;

            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            let mnemonicData;
            try {
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
                const jsonText = jsonMatch ? jsonMatch[1] : text;
                mnemonicData = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('Failed to parse AI response:', text);
                return NextResponse.json(
                    { error: 'Failed to parse mnemonic generation response' },
                    { status: 500 }
                );
            }

            const mnemonic = {
                id: `mnemonic-${Date.now()}`,
                entryMode: 'ai_generated',
                status: 'draft',
                ...mnemonicData,
                createdBy: 'AI Generator (Gemini 2.0 Flash)',
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString()
            };

            return NextResponse.json({ items: [mnemonic] });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    } catch (error) {
        console.error('AI Generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate items', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
