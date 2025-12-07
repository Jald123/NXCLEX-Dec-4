import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, TABLES } from '@/lib/supabase';
import type { StudentUser } from '@nclex/shared-api-types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user in Supabase
        const { data: newUser, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .insert({
                email: email.toLowerCase(),
                password_hash: passwordHash,
                name,
                subscription_status: 'free_trial',
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // Return user without password hash
        const response: Partial<StudentUser> = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            subscriptionStatus: newUser.subscription_status,
            createdAt: newUser.created_at,
            lastLoginAt: newUser.created_at,
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
