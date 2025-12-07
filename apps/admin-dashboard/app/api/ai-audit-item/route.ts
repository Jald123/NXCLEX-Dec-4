import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item, type = 'item' } = body;

    if (!item) {
      return NextResponse.json({ error: 'Item is required' }, { status: 400 });
    }

    let prompt = '';

    if (type === 'item') {
      prompt = `You are an expert NCLEX question reviewer. Analyze this NCLEX question for quality issues.

Question:
Stem: ${item.stem}
Options: ${item.options?.map((o: any, i: number) => `${i + 1}. ${o.text}`).join('\n')}
Correct Answer: ${item.options?.find((o: any) => o.isCorrect)?.text || 'Not specified'}
Rationale: ${item.rationale}

Analyze for:
1. Clarity and completeness of stem
2. Plausibility of all distractors
3. Correctness and defensibility of answer
4. Alignment with NCLEX test plan
5. Clinical accuracy
6. Appropriate difficulty level
7. No cueing or giveaways
8. Grammar and formatting

Return a JSON object:
{
  "overallRisk": "low" | "medium" | "high",
  "issues": [
    {
      "id": "unique-id",
      "category": "stem_clarity" | "distractor_quality" | "answer_correctness" | "nclex_alignment" | "clinical_accuracy" | "difficulty" | "cueing" | "formatting",
      "severity": "low" | "medium" | "high",
      "message": "Description of the issue",
      "suggested_fix": "How to fix it"
    }
  ]
}

If there are no issues, return an empty issues array with overallRisk: "low".`;
    } else if (type === 'trap') {
      prompt = `You are an expert in NCLEX distractor analysis. Analyze these distractors for trap effectiveness.

Question Stem: ${item.stem}
Distractors: ${item.options?.map((o: any, i: number) => `${i + 1}. ${o.text} ${o.isTrap ? '(marked as trap)' : ''}`).join('\n')}

Analyze for:
1. Plausibility of each distractor
2. Effectiveness of traps (do they target common misconceptions?)
3. Appropriate difficulty
4. No obvious giveaways
5. Clinical relevance

Return a JSON object:
{
  "overallRisk": "low" | "medium" | "high",
  "issues": [
    {
      "id": "unique-id",
      "category": "plausibility" | "trap_effectiveness" | "difficulty" | "giveaways" | "clinical_relevance",
      "severity": "low" | "medium" | "high",
      "message": "Description of the issue",
      "suggested_fix": "How to fix it"
    }
  ]
}`;
    } else if (type === 'mnemonic') {
      prompt = `You are an expert in nursing education mnemonics. Analyze this mnemonic for effectiveness.

Concept: ${item.concept || 'Not specified'}
Mnemonic: ${item.mnemonicText}
Explanation: ${item.explanation}

Analyze for:
1. Accuracy of information
2. Memorability and effectiveness
3. Clarity of explanation
4. Clinical relevance
5. Appropriate for NCLEX level

Return a JSON object:
{
  "overallRisk": "low" | "medium" | "high",
  "issues": [
    {
      "id": "unique-id",
      "category": "accuracy" | "memorability" | "clarity" | "clinical_relevance" | "nclex_level",
      "severity": "low" | "medium" | "high",
      "message": "Description of the issue",
      "suggested_fix": "How to fix it"
    }
  ]
}`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let auditReport;
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      auditReport = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      auditReport = {
        overallRisk: 'medium',
        issues: [{
          id: 'parse-error',
          category: 'formatting',
          severity: 'medium',
          message: 'AI audit completed but response format was unexpected. Manual review recommended.',
          suggested_fix: 'Review the item manually for quality issues.'
        }]
      };
    }

    auditReport.timestamp = new Date().toISOString();
    return NextResponse.json(auditReport);
  } catch (error) {
    console.error('AI Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to perform AI audit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
