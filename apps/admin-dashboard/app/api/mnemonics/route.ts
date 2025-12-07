import { NextRequest, NextResponse } from 'next/server';
import { getAllMnemonics, createMnemonic } from '@/lib/storage';
import type { MnemonicDraft } from '@nclex/shared-api-types';

export async function GET() {
    try {
        const mnemonics = await getAllMnemonics();
        return NextResponse.json({ mnemonics });
    } catch (error) {
        console.error('Error fetching mnemonics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch mnemonics' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const mnemonic = await createMnemonic(body as MnemonicDraft);
        return NextResponse.json(mnemonic);
    } catch (error) {
        console.error('Error creating mnemonic:', error);
        return NextResponse.json(
            { error: 'Failed to create mnemonic' },
            { status: 500 }
        );
    }
}
