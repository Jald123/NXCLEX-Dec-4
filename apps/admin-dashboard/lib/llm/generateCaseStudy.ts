import type { CaseStudyGenerationParams, ExamProfile, NclexItemDraft } from '@nclex/shared-api-types';

/**
 * Generate a complete NGN case study (6 linked items) using Gemini API.
 */
export async function generateCaseStudyLLM(
    params: CaseStudyGenerationParams,
    examProfile: ExamProfile
): Promise<NclexItemDraft[]> {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set. Please add it to apps/admin-dashboard/.env.local');
    }

    // Construct the prompt
    const profileDescription = examProfile === 'nclex_2025'
        ? 'Use current NGN blueprint (2023–2026).'
        : 'Use 2026+ NCLEX blueprint (updated category weights, same NGN item types).';

    const prompt = `You are an expert NCLEX NGN question writer. Generate a complete clinical judgment case study consisting of exactly 6 linked items.

EXAM PROFILE: ${examProfile === 'nclex_2025' ? 'NCLEX NGN 2025' : 'NCLEX 2026+'}
${profileDescription}

PARAMETERS:
- Age Group: ${params.ageGroup}
- Clinical Domain: ${params.clinicalDomain}
- Clinical Complexity: ${params.complexity}

REQUIREMENTS:
1. Create exactly 6 items covering these phases in order:
   - Initial Assessment
   - Focused Assessment
   - Analysis
   - Planning
   - Intervention
   - Evaluation

2. Each item must use a different NGN item type (e.g., Multiple Choice, Select All That Apply, Matrix/Grid, Drag and Drop, Highlight, Bow-Tie)

3. For each item, provide:
   - A unique id (string)
   - entryMode: "ai_generated"
   - status: "draft"
   - questionType: (the NGN item type)
   - stem: (complete clinical scenario with question)
   - options: array of 4-6 options, each with:
     * id: string
     * text: string
     * isTrap: boolean (true if this is a distractor/trap)
     * trapReason: string (only if isTrap is true, explain why it's a trap)
   - rationale: (complete explanation of correct answer and why other options are incorrect)
   - createdBy: "AI Generator"
   - createdAt: current ISO timestamp
   - lastUpdatedAt: current ISO timestamp

4. Content must be:
   - Clinically accurate and aligned with modern US nursing practice
   - Original (no copyright issues)
   - Appropriate for ${params.ageGroup} patients
   - Focused on ${params.clinicalDomain}
   - At ${params.complexity} complexity level

6. For each item, include an "ehrDetails" object with realistic patient data consistent across all 6 items:
   - patientName: (e.g., "Eleanor Vance")
   - dob: (e.g., "1946-03-12")
   - mrn: (e.g., "EV789012")
   - gender: (e.g., "Female")
   - age: (e.g., "78 yrs")
   - admissionDate: "Today"
   - allergies: (e.g., "NKA" or specific allergies)
   - codeStatus: (e.g., "FULL CODE")
   - diagnosis: (Relevant medical diagnosis)

7. Return ONLY a valid JSON array of exactly 6 items. Do not include any markdown formatting, code blocks, or explanatory text.

EXAMPLE STRUCTURE (return 6 items like this):
[
  {
    "id": "item-1",
    "entryMode": "ai_generated",
    "status": "draft",
    "questionType": "Multiple Choice",
    "stem": "A 45-year-old adult patient...",
    "options": [
      { "id": "1", "text": "Option A", "isTrap": false },
      { "id": "2", "text": "Option B", "isTrap": true, "trapReason": "Common misconception" }
    ],
    "rationale": "The correct answer is...",
    "ehrDetails": {
        "patientName": "John Doe",
        "dob": "1978-05-15",
        "mrn": "JD123456",
        "gender": "Male",
        "age": "45 yrs",
        "admissionDate": "Today",
        "allergies": "Penicillin",
        "codeStatus": "FULL CODE",
        "diagnosis": "Acute Myocardial Infarction"
    },
    "createdBy": "AI Generator",
    "createdAt": "${new Date().toISOString()}",
    "lastUpdatedAt": "${new Date().toISOString()}"
  }
]`;

    try {
        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                        responseMimeType: 'application/json'
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        // Extract the generated text
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) {
            throw new Error('No content generated by Gemini API');
        }

        // Parse JSON
        let items: any[];
        try {
            items = JSON.parse(generatedText);
        } catch (parseError) {
            throw new Error(`Failed to parse Gemini response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        // Validate response
        if (!Array.isArray(items)) {
            throw new Error('Gemini response is not an array');
        }

        if (items.length !== 6) {
            throw new Error(`Expected 6 items, but received ${items.length}`);
        }

        // Basic field validation
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!item.id || typeof item.id !== 'string') {
                throw new Error(`Item ${i + 1}: Missing or invalid id`);
            }

            if (!item.stem || typeof item.stem !== 'string' || item.stem.trim().length === 0) {
                throw new Error(`Item ${i + 1}: Missing or empty stem`);
            }

            if (!Array.isArray(item.options) || item.options.length < 3) {
                throw new Error(`Item ${i + 1}: Must have at least 3 options`);
            }

            if (!item.questionType || typeof item.questionType !== 'string') {
                throw new Error(`Item ${i + 1}: Missing or invalid questionType`);
            }

            if (!item.rationale || typeof item.rationale !== 'string') {
                throw new Error(`Item ${i + 1}: Missing or invalid rationale`);
            }

            // Validate each option
            for (let j = 0; j < item.options.length; j++) {
                const option = item.options[j];
                if (!option.id || !option.text) {
                    throw new Error(`Item ${i + 1}, Option ${j + 1}: Missing id or text`);
                }
            }
        }

        // Return validated items as NclexItemDraft[]
        return items.map(item => ({
            ...item,
            examProfile: examProfile // Add the selected profile to the item
        })) as NclexItemDraft[];

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}
