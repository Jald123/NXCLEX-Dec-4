import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import type { StudentUser } from '@nclex/shared-api-types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getUsers(): StudentUser[] {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        const data = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

function updateUserByCustomerId(customerId: string, updates: Partial<StudentUser>) {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.stripeCustomerId === customerId);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
            console.log(`Updated user ${users[userIndex].email}:`, updates);
        } else {
            console.error(`User not found for customer ID: ${customerId}`);
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

                    // Update user to paid status
                    updateUserByCustomerId(customerId, {
                        subscriptionStatus: 'paid',
                        stripeSubscriptionId: subscriptionId,
                        subscriptionPlan: plan,
                        subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
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

                updateUserByCustomerId(customerId, {
                    subscriptionStatus: subscription.status === 'active' ? 'paid' : 'free_trial',
                    subscriptionPlan: plan,
                    subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Downgrade user to free trial
                updateUserByCustomerId(customerId, {
                    subscriptionStatus: 'free_trial',
                    stripeSubscriptionId: undefined,
                    subscriptionPlan: undefined,
                    subscriptionEndDate: undefined,
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
