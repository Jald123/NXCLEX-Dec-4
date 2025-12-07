import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin, TABLES } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function updateUserByCustomerId(customerId: string, updates: Record<string, any>) {
    try {
        const { error } = await supabaseAdmin
            .from(TABLES.USERS)
            .update(updates)
            .eq('stripe_customer_id', customerId);

        if (error) {
            console.error(`Error updating user for customer ${customerId}:`, error);
        } else {
            console.log(`Updated user for customer ${customerId}:`, updates);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature')!;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.mode === 'subscription' && session.customer) {
                    const customerId = session.customer as string;
                    const subscriptionId = session.subscription as string;

                    // Get subscription details
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = subscription.items.data[0].price.id;

                    // Determine plan type
                    const plan = priceId === process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID
                        ? 'annual'
                        : 'monthly';

                    // Update user to paid status in Supabase
                    await updateUserByCustomerId(customerId, {
                        subscription_status: 'paid',
                        stripe_subscription_id: subscriptionId,
                        subscription_plan: plan,
                        subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
                    });
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const priceId = subscription.items.data[0].price.id;

                const plan = priceId === process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID
                    ? 'annual'
                    : 'monthly';

                await updateUserByCustomerId(customerId, {
                    subscription_status: subscription.status === 'active' ? 'paid' : 'free_trial',
                    subscription_plan: plan,
                    subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Downgrade user to free trial
                await updateUserByCustomerId(customerId, {
                    subscription_status: 'free_trial',
                    stripe_subscription_id: null,
                    subscription_plan: null,
                    subscription_end_date: null,
                });
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
