import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPublishedItems } from '@/lib/storage';
import type { UserRole } from '@nclex/shared-api-types';

export async function GET() {
    try {
        const session = await getServerSession();
        const userRole = (session?.user as any)?.role as UserRole | undefined;

        const items = await getPublishedItems(userRole);
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
