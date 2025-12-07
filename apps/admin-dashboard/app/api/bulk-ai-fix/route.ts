import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const ITEMS_FILE = path.join(process.cwd(), 'data', 'items.json');

interface BulkFixRequest {
    itemIds: string[];
    type: 'item' | 'trap' | 'mnemonic';
}

interface BulkFixResult {
    itemId: string;
    success: boolean;
    fixedItem?: any;
    error?: string;
}

export async function POST(req: Request) {
    try {
        const { itemIds, type = 'item' }: BulkFixRequest = await req.json();

        if (!itemIds || itemIds.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        // Load items
        const itemsData = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8'));
        const items = itemsData.filter((item: any) => itemIds.includes(item.id));

        const results: BulkFixResult[] = [];
        const batchSize = 3; // Reduced to avoid rate limits
        let successCount = 0;
        let failCount = 0;

        // Process in batches
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);

            const batchResults = await Promise.allSettled(
                batch.map(async (item: any) => {
                    try {
                        if (!item.auditReport) {
                            throw new Error('Item must be audited before fixing');
                        }

                        const fixedItem = await performAIFix(item, type);

                        // Update item in storage
                        const updatedItems = itemsData.map((it: any) =>
                            it.id === item.id
                                ? { ...fixedItem, status: 'ai_fix', lastUpdatedAt: new Date().toISOString() }
                                : it
                        );
                        fs.writeFileSync(ITEMS_FILE, JSON.stringify(updatedItems, null, 2));

                        successCount++;
                        return { itemId: item.id, success: true, fixedItem };
                    } catch (error) {
                        failCount++;
                        return {
                            itemId: item.id,
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error'
                        };
                    }
                })
            );

            results.push(...batchResults.map((r, idx) =>
                r.status === 'fulfilled'
                    ? r.value
                    : { itemId: batch[idx].id, success: false, error: 'Processing failed' }
            ));

            // Rate limit delay between batches
            if (i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
            }
        }

        return NextResponse.json({
            results,
            summary: {
                total: itemIds.length,
                successful: successCount,
                failed: failCount
            }
        });
    } catch (error) {
        console.error('Bulk AI fix error:', error);
        return NextResponse.json(
            { error: 'Failed to perform bulk fix', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

async function performAIFix(item: any, type: string): Promise<any> {
    const issuesList = item.auditReport.issues.map((issue: any, i: number) =>
        `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.message}\n   Fix: ${issue.suggested_fix}`
    ).join('\n\n');

    const prompt = `Fix these issues in this NCLEX question.

Current:
Stem: ${item.stem}
Options: ${item.options?.map((o: any, i: number) => `${i + 1}. ${o.text} ${o.isCorrect ? '(CORRECT)' : ''}`).join('\n')}
Rationale: ${item.rationale}

Issues:
${issuesList}

Return JSON: {"stem": "...", "options": [{"id": "1", "text": "...", "isCorrect": false}], "rationale": "...", "fixSummary": "..."}`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        const fixedData = JSON.parse(jsonText);

        return {
            ...item,
            ...fixedData,
            lastUpdatedAt: new Date().toISOString()
        };
    } catch (error) {
        // Return original item if fix fails
        return {
            ...item,
            fixSummary: 'AI fix failed. Manual review required.'
        };
    }
}
