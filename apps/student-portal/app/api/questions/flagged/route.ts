import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { QuestionFlag } from '@nclex/shared-api-types';

const FLAGS_FILE = path.join(process.cwd(), 'data', 'flags.json');

function getFlags(): QuestionFlag[] {
    try {
        if (!fs.existsSync(FLAGS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(FLAGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading flags:', error);
        return [];
    }
}

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const allFlags = getFlags();
        const userFlags = allFlags.filter(f => f.userId === userId);

        return NextResponse.json({ flags: userFlags });
    } catch (error) {
        console.error('Error fetching flagged questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch flagged questions' },
            { status: 500 }
        );
    }
}
