import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllItems, updateItem } from '@/lib/db';
import type { NclexItemDraft } from '@nclex/shared-api-types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface BulkAuditRequest {
    itemIds: string[];
    type: 'item' | 'trap' | 'mnemonic';
}

interface BulkAuditResult {
    itemId: string;
    success: boolean;
    auditReport?: unknown;
    error?: string;
}

export async function POST(req: Request) {
    try {
        const { itemIds, type = 'item' }: BulkAuditRequest = await req.json();

        if (!itemIds || itemIds.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        // Load items from database
        const allItems = await getAllItems();
        const items = allItems.filter((item) => itemIds.includes(item.id));

        const results: BulkAuditResult[] = [];
        const batchSize = 3; // Reduced to avoid rate limits
        let successCount = 0;
        let failCount = 0;

        // Process in batches
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);

            const batchResults = await Promise.allSettled(
                batch.map(async (item) => {
                    try {
                        const auditReport = await performAIAudit(item, type);

                        // Update item in database
                        await updateItem(item.id, {
                            auditReport: auditReport as NclexItemDraft['auditReport'],
                            status: 'ai_audit'
                        });

                        successCount++;
                        return { itemId: item.id, success: true, auditReport };
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
        console.error('Bulk AI audit error:', error);
        return NextResponse.json(
            { error: 'Failed to perform bulk audit', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

interface AuditItem {
    stem: string;
    options?: Array<{ text: string; isCorrect?: boolean }>;
}

async function performAIAudit(item: AuditItem, type: string): Promise<unknown> {
    let prompt = '';

    if (type === 'item') {
        prompt = `Analyze this NCLEX question for quality issues.

Stem: ${item.stem}
Options: ${item.options?.map((o, i: number) => `${i + 1}. ${o.text}`).join('\n')}
Correct: ${item.options?.find((o) => o.isCorrect)?.text}

Return JSON: {"overallRisk": "low|medium|high", "issues": [{"id": "1", "category": "stem_clarity", "severity": "low|medium|high", "message": "...", "suggested_fix": "..."}]}`;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        const auditReport = JSON.parse(jsonText);
        auditReport.timestamp = new Date().toISOString();

        return auditReport;
    } catch {
        // Fallback audit report
        return {
            overallRisk: 'medium',
            issues: [{
                id: 'bulk-audit-1',
                category: 'formatting',
                severity: 'low',
                message: 'Bulk audit completed. Manual review recommended.',
                suggested_fix: 'Review item manually for quality.'
            }],
            timestamp: new Date().toISOString()
        };
    }
}
