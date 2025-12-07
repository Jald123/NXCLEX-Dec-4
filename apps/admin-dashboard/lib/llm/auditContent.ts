import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NclexItemDraft, TrapSetDraft, MnemonicDraft, AuditReport } from '@nclex/shared-api-types';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

type AuditType = 'item' | 'trap' | 'mnemonic';

export async function auditContent(
    type: AuditType,
    data: NclexItemDraft | TrapSetDraft | MnemonicDraft
): Promise<AuditReport> {
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    let prompt = '';

    switch (type) {
        case 'item':
            prompt = constructItemAuditPrompt(data as NclexItemDraft);
            break;
        case 'trap':
            prompt = constructTrapAuditPrompt(data as TrapSetDraft);
            break;
        case 'mnemonic':
            prompt = constructMnemonicAuditPrompt(data as MnemonicDraft);
            break;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse JSON from AI response');
        }

        return JSON.parse(jsonMatch[0]) as AuditReport;
    } catch (error) {
        console.error('AI Audit failed:', error);
        throw error;
    }
}

function constructItemAuditPrompt(item: NclexItemDraft): string {
    return `
    You are an expert NCLEX-NGN content auditor. Analyze the following item for clinical accuracy, NGN style compliance, and quality.

    Item Data:
    ${JSON.stringify(item, null, 2)}

    Output a JSON object matching this schema:
    {
        "overallRisk": "low" | "medium" | "high",
        "issues": [
            {
                "id": "string",
                "category": "clinical_accuracy" | "ngn_style" | "distractor_quality" | "bias_fairness",
                "severity": "low" | "medium" | "high",
                "message": "string",
                "suggested_fix": "string (optional)"
            }
        ]
    }

    Focus on:
    1. Clinical accuracy of the stem and rationale.
    2. Plausibility of distractors.
    3. Adherence to NGN item writing guidelines (clear, concise, no "all of the above").
    `;
}

function constructTrapAuditPrompt(trapSet: TrapSetDraft): string {
    return `
    You are an expert in educational assessment and psychometrics. Analyze the following "Trap Set" (a collection of distractors designed to test specific misconceptions).

    Trap Set Data:
    ${JSON.stringify(trapSet, null, 2)}

    Output a JSON object matching this schema:
    {
        "overallRisk": "low" | "medium" | "high",
        "issues": [
            {
                "id": "string",
                "category": "trap_quality" | "clinical_safety" | "bias_fairness" | "copyright_originality",
                "severity": "low" | "medium" | "high",
                "message": "string",
                "suggested_fix": "string (optional)"
            }
        ]
    }

    Focus on:
    1. Subtlety of the trap (it should not be obviously wrong).
    2. Clinical safety (distractors should not suggest dangerous practices without correction).
    3. Fairness (avoiding trick questions that rely on trivia).
    `;
}

function constructMnemonicAuditPrompt(mnemonic: MnemonicDraft): string {
    return `
    You are a nursing educator specializing in memory aids. Analyze the following mnemonic for effectiveness and clarity.

    Mnemonic Data:
    ${JSON.stringify(mnemonic, null, 2)}

    Output a JSON object matching this schema:
    {
        "overallRisk": "low" | "medium" | "high",
        "issues": [
            {
                "id": "string",
                "category": "clinical_accuracy" | "clarity" | "bias_fairness" | "copyright_originality",
                "severity": "low" | "medium" | "high",
                "message": "string",
                "suggested_fix": "string (optional)"
            }
        ]
    }

    Focus on:
    1. Memorability and simplicity.
    2. Accuracy of the association (does the letter actually stand for the concept?).
    3. Clarity of the explanation.
    `;
}

export async function generateFix(
    type: AuditType,
    data: NclexItemDraft | TrapSetDraft | MnemonicDraft,
    auditReport: AuditReport
): Promise<any> {
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    let prompt = '';

    switch (type) {
        case 'item':
            prompt = constructItemFixPrompt(data as NclexItemDraft, auditReport);
            break;
        case 'trap':
            prompt = constructTrapFixPrompt(data as TrapSetDraft, auditReport);
            break;
        case 'mnemonic':
            prompt = constructMnemonicFixPrompt(data as MnemonicDraft, auditReport);
            break;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse JSON from AI response');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('AI Fix Generation failed:', error);
        throw error;
    }
}

function constructItemFixPrompt(item: NclexItemDraft, auditReport: AuditReport): string {
    return `
    You are an expert NCLEX-NGN content editor. Your task is to FIX the following item based on the audit report.

    Original Item:
    ${JSON.stringify(item, null, 2)}

    Audit Report (Issues to Fix):
    ${JSON.stringify(auditReport, null, 2)}

    Instructions:
    1. Address ALL issues listed in the audit report.
    2. Maintain the original intent and topic of the question.
    3. Ensure the output is a valid JSON object matching the NclexItemDraft structure.
    4. Do NOT change the ID, createdBy, or createdAt fields.

    Output ONLY the fixed JSON object.
    `;
}

function constructTrapFixPrompt(trapSet: TrapSetDraft, auditReport: AuditReport): string {
    return `
    You are an expert educational content editor. Your task is to FIX the following Trap Set based on the audit report.

    Original Trap Set:
    ${JSON.stringify(trapSet, null, 2)}

    Audit Report (Issues to Fix):
    ${JSON.stringify(auditReport, null, 2)}

    Instructions:
    1. Address ALL issues listed in the audit report.
    2. Ensure distractors are subtle but fair.
    3. Ensure the output is a valid JSON object matching the TrapSetDraft structure.
    4. Do NOT change the ID, createdBy, or createdAt fields.

    Output ONLY the fixed JSON object.
    `;
}

function constructMnemonicFixPrompt(mnemonic: MnemonicDraft, auditReport: AuditReport): string {
    return `
    You are an expert nursing educator. Your task is to FIX the following Mnemonic based on the audit report.

    Original Mnemonic:
    ${JSON.stringify(mnemonic, null, 2)}

    Audit Report (Issues to Fix):
    ${JSON.stringify(auditReport, null, 2)}

    Instructions:
    1. Address ALL issues listed in the audit report.
    2. Improve clarity and memorability.
    3. Ensure the output is a valid JSON object matching the MnemonicDraft structure.
    4. Do NOT change the ID, createdBy, or createdAt fields.

    Output ONLY the fixed JSON object.
    `;
}
