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

        const { priceId } = await req.json();

        if (!priceId) {
            return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
        }

        const userId = (session.user as any).id;
        const userEmail = session.user.email!;

        // Get user from Supabase
        const { data: user, error: userError } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create or retrieve Stripe customer
        let customerId = user.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    userId: userId,
                },
            });
            customerId = customer.id;

            // Save customer ID to user record in Supabase
            await supabaseAdmin
                .from(TABLES.USERS)
                .update({ stripe_customer_id: customerId })
                .eq('id', userId);
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
            metadata: {
                userId: userId,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
