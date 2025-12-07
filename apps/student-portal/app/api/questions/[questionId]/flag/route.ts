import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { QuestionFlag } from '@nclex/shared-api-types';

const FLAGS_FILE = path.join(process.cwd(), 'data', 'flags.json');

function getFlags(): QuestionFlag[] {
    try {
        if (!fs.existsSync(FLAGS_FILE)) {
            const dir = path.dirname(FLAGS_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(FLAGS_FILE, '[]', 'utf-8');
            return [];
        }
        const data = fs.readFileSync(FLAGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading flags:', error);
        return [];
    }
}

function saveFlags(flags: QuestionFlag[]) {
    try {
        const dir = path.dirname(FLAGS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(FLAGS_FILE, JSON.stringify(flags, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving flags:', error);
    }
}

// POST: Flag a question
export async function POST(
    req: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { reason } = body;

        const flags = getFlags();

        // Check if already flagged
        const existing = flags.find(f => f.userId === userId && f.questionId === params.questionId);
        if (existing) {
            return NextResponse.json({ message: 'Already flagged', flag: existing });
        }

        const newFlag: QuestionFlag = {
            id: `flag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            questionId: params.questionId,
            flaggedAt: new Date().toISOString(),
            reason
        };

        flags.push(newFlag);
        saveFlags(flags);

        return NextResponse.json({ flag: newFlag });
    } catch (error) {
        console.error('Error flagging question:', error);
        return NextResponse.json(
            { error: 'Failed to flag question' },
            { status: 500 }
        );
    }
}

// DELETE: Unflag a question
export async function DELETE(
    req: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const flags = getFlags();

        const filteredFlags = flags.filter(
            f => !(f.userId === userId && f.questionId === params.questionId)
        );

        saveFlags(filteredFlags);

        return NextResponse.json({ message: 'Flag removed' });
    } catch (error) {
        console.error('Error removing flag:', error);
        return NextResponse.json(
            { error: 'Failed to remove flag' },
            { status: 500 }
        );
    }
}
