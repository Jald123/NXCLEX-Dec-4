const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'apps', 'student-portal', '.env.local');

// Read existing .env.local or create new one
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
}

// Add Stripe variables if they don't exist
const stripeVars = `
# Stripe Configuration
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Webhook Secret (from https://dashboard.stripe.com/test/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (create products in Stripe Dashboard first)
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_monthly_id_here
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_annual_id_here
`;

if (!envContent.includes('STRIPE_SECRET_KEY')) {
    envContent += stripeVars;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Stripe environment variables added to .env.local');
    console.log('📝 Please update the placeholder values with your actual Stripe keys');
} else {
    console.log('ℹ️  Stripe variables already exist in .env.local');
}
