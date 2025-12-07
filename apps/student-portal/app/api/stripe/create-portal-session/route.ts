import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { supabaseAdmin, TABLES } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Get user from Supabase
        const { data: user, error: userError } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (userError || !user || !user.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 404 }
            );
        }

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${process.env.NEXTAUTH_URL}/account`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        );
    }
}
