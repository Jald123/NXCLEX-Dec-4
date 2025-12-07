import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { QuestionNote } from '@nclex/shared-api-types';

const NOTES_FILE = path.join(process.cwd(), 'data', 'notes.json');

function getNotes(): QuestionNote[] {
    try {
        if (!fs.existsSync(NOTES_FILE)) {
            const dir = path.dirname(NOTES_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(NOTES_FILE, '[]', 'utf-8');
            return [];
        }
        const data = fs.readFileSync(NOTES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading notes:', error);
        return [];
    }
}

function saveNotes(notes: QuestionNote[]) {
    try {
        const dir = path.dirname(NOTES_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving notes:', error);
    }
}

// GET: Get note for a question
export async function GET(
    req: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const notes = getNotes();
        const note = notes.find(n => n.userId === userId && n.questionId === params.questionId);

        return NextResponse.json({ note: note || null });
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            { error: 'Failed to fetch note' },
            { status: 500 }
        );
    }
}

// POST: Create or update note
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
        const { note: noteText } = body;

        const notes = getNotes();
        const existingIndex = notes.findIndex(
            n => n.userId === userId && n.questionId === params.questionId
        );

        const now = new Date().toISOString();

        if (existingIndex >= 0) {
            // Update existing note
            notes[existingIndex].note = noteText;
            notes[existingIndex].updatedAt = now;
            saveNotes(notes);
            return NextResponse.json({ note: notes[existingIndex] });
        } else {
            // Create new note
            const newNote: QuestionNote = {
                id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId,
                questionId: params.questionId,
                note: noteText,
                createdAt: now,
                updatedAt: now
            };
            notes.push(newNote);
            saveNotes(notes);
            return NextResponse.json({ note: newNote });
        }
    } catch (error) {
        console.error('Error saving note:', error);
        return NextResponse.json(
            { error: 'Failed to save note' },
            { status: 500 }
        );
    }
}
