import { NextResponse } from 'next/server';

// Known Gemini models - listModels is not available in the client SDK
const GEMINI_MODELS = [
    { name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', description: 'Fast and efficient model for quick responses' },
    { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'Advanced model with large context window' },
    { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', description: 'Fast model with good balance of speed and quality' },
    { name: 'gemini-pro', displayName: 'Gemini Pro', description: 'Versatile model for various tasks' },
];

export async function GET() {
    try {
        console.log('Returning known Gemini models...');

        return NextResponse.json({
            success: true,
            apiKeyConfigured: !!process.env.GEMINI_API_KEY,
            modelsFound: GEMINI_MODELS.length,
            models: GEMINI_MODELS
        });
    } catch (error) {
        console.error('Error listing models:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            apiKeyConfigured: !!process.env.GEMINI_API_KEY,
            details: 'Failed to list available models.'
        }, { status: 500 });
    }
}
