import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET() {
    try {
        console.log('Listing available Gemini models...');

        // Try to list models
        const models = await genAI.listModels();

        const modelList = models.map(model => ({
            name: model.name,
            displayName: model.displayName,
            description: model.description,
            supportedGenerationMethods: model.supportedGenerationMethods,
        }));

        console.log('Available models:', modelList);

        return NextResponse.json({
            success: true,
            apiKeyConfigured: !!process.env.GEMINI_API_KEY,
            modelsFound: modelList.length,
            models: modelList
        });
    } catch (error) {
        console.error('Error listing models:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            apiKeyConfigured: !!process.env.GEMINI_API_KEY,
            details: 'Failed to list available models. Check API key and permissions.'
        }, { status: 500 });
    }
}
