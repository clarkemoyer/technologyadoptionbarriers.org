# Stripe Integration Setup Guide

This document provides step-by-step instructions for setting up the Stripe payment integration for the Technology Adoption Barriers (TABS) website.

## Overview

The TABS website uses Stripe for PCI-compliant contribution processing. The integration supports:

- **One-time contributions**: Single payment contributions
- **Recurring contributions**: Monthly subscription contributions
- **PCI Compliance**: All payment data is processed on Stripe's secure servers
- **Automatic receipts**: Contributors receive email receipts from Stripe

## Prerequisites

1. Stripe account (sign up at [stripe.com](https://stripe.com))
2. Access to GitHub repository settings
3. Admin access to create GitHub environments and secrets

## Setup Steps

### 1. Create Stripe Account and Get API Keys

1. Sign up for a Stripe account at [https://stripe.com](https://stripe.com)
2. Navigate to **Developers > API keys** in the Stripe Dashboard
3. Copy your **Secret key** (starts with `sk_`)

**Important**: Use test keys (`sk_test_...`) for development and live keys (`sk_live_...`) for production.

**Note**: The publishable key is not required for this integration since we use direct Payment Link redirects.

### 2. Create Stripe Products and Payment Links

**Important for Static Sites**: Since this is a static Next.js site, we use Stripe Payment Links instead of creating checkout sessions programmatically.

#### One-Time Contribution Payment Link

1. Go to **Payment Links** in the Stripe Dashboard
2. Click **+ New**
3. Configure the payment link:
   - **Product**: Create a new product or select existing
     - **Name**: "One-Time Contribution"
     - **Description**: "Support TABS research with a one-time contribution"
   - **Price**: Enter your default amount (e.g., $25.00)
   - **Payment method types**: Select Credit card, Debit card, and any other desired methods
   - **After payment**: Redirect to a specific page
     - **Success URL**: `https://technologyadoptionbarriers.org/donation-success`
     - **Cancel URL**: `https://technologyadoptionbarriers.org/donation-cancelled`
4. Click **Create link**
5. Copy the **Payment link URL** (e.g., `https://buy.stripe.com/xxxxxxxxxxxxx`)

#### Monthly Recurring Contribution Payment Link

1. Go to **Payment Links** in the Stripe Dashboard
2. Click **+ New**
3. Configure the payment link:
   - **Product**: Create a new product or select existing
     - **Name**: "Monthly Recurring Contribution"
     - **Description**: "Support TABS research with a monthly contribution"
   - **Price**: Enter your default amount (e.g., $10.00)
   - **Recurring**: Yes
   - **Billing period**: Monthly
   - **Payment method types**: Select Credit card, Debit card, and any other desired methods
   - **After payment**: Redirect to a specific page
     - **Success URL**: `https://technologyadoptionbarriers.org/donation-success`
     - **Cancel URL**: `https://technologyadoptionbarriers.org/donation-cancelled`
4. Click **Create link**
5. Copy the **Payment link URL** (e.g., `https://buy.stripe.com/xxxxxxxxxxxxx`)

**Note**: Payment Links are ideal for static sites because they're pre-configured hosted pages that don't require server-side code.

### 3. Configure GitHub Environment and Secrets

#### Create the `stripe-prod` Environment

1. Navigate to your GitHub repository
2. Go to **Settings > Environments**
3. Click **New environment**
4. Name it `stripe-prod`
5. Click **Configure environment**

#### Add Secrets to the Environment

Add the following secrets to the `stripe-prod` environment:

| Secret Name                                            | Value                          | Description                                             |
| ------------------------------------------------------ | ------------------------------ | ------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                                    | `sk_live_...` or `sk_test_...` | Stripe secret API key (for GitHub Actions verification) |
| `NEXT_PUBLIC_STRIPE_DONATION_PAYMENT_LINK_URL`         | `https://buy.stripe.com/...`   | One-time contribution payment link URL                  |
| `NEXT_PUBLIC_STRIPE_MONTHLY_DONATION_PAYMENT_LINK_URL` | `https://buy.stripe.com/...`   | Monthly contribution payment link URL                   |

**To add secrets:**

1. Click **Add secret**
2. Enter the secret name
3. Enter the secret value
4. Click **Add secret**
5. Repeat for all secrets

### 4. Configure Local Development (Optional)

For local development and testing, create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Stripe test credentials:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_DONATION_PAYMENT_LINK_URL=https://buy.stripe.com/test_your_onetime_link
NEXT_PUBLIC_STRIPE_MONTHLY_DONATION_PAYMENT_LINK_URL=https://buy.stripe.com/test_your_monthly_link
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 5. Verify the Integration

#### Automated Verification

The repository includes a GitHub Actions workflow that verifies the Stripe configuration:

1. Go to **Actions** in your GitHub repository
2. Select **Stripe Integration Verification**
3. Click **Run workflow**
4. Select the branch and click **Run workflow**
5. Review the results

#### Manual Testing

1. Build the site locally:

   ```bash
   npm install
   npm run build
   npm run preview
   ```

2. Navigate to the **Support TABS** contribution section
3. Click **Contribute Now**
4. You should be redirected to Stripe Checkout
5. Complete a test contribution using Stripe test card: `4242 4242 4242 4242`
6. Verify you're redirected to the success page
7. Check Stripe Dashboard to confirm the test contribution appears correctly

## Stripe Test Cards

Use these test card numbers in **test mode**:

| Card Number           | Description                   |
| --------------------- | ----------------------------- |
| `4242 4242 4242 4242` | Successful payment            |
| `4000 0000 0000 0002` | Declined payment              |
| `4000 0000 0000 9995` | Declined (insufficient funds) |

- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

See [Stripe Testing Documentation](https://stripe.com/docs/testing) for more test cards.

## PCI Compliance

This integration is PCI-compliant because:

1. **No card data touches our servers**: All payment information is collected and processed on Stripe's PCI-certified servers
2. **Stripe Checkout**: We use Stripe's hosted checkout page, which is PCI DSS Level 1 certified
3. **Secure communication**: All communication with Stripe uses HTTPS
4. **No data storage**: We don't store any payment card data

## Webhook Setup (Optional)

To receive real-time notifications about donation events:

1. Go to **Developers > Webhooks** in the Stripe Dashboard
2. Click **+ Add endpoint**
3. Enter your endpoint URL (requires API route, not available in static export)
4. Select events to listen for (e.g., `checkout.session.completed`)
5. Copy the **Signing secret** and add it to GitHub secrets as `STRIPE_WEBHOOK_SECRET`

**Note**: Webhooks require a server-side endpoint, which is not available in static export mode. This is optional and not required for basic contribution functionality.

## Monitoring and Analytics

Monitor contributions in the Stripe Dashboard:

1. **Payments**: View all successful payments
2. **Customers**: View contributor information
3. **Subscriptions**: View active recurring contributions
4. **Reports**: Generate financial reports

## Troubleshooting

### Contribution button doesn't work

1. Check browser console for errors
2. Verify Stripe secret key is correctly configured
3. Ensure payment link URLs are valid Stripe domains (buy.stripe.com or checkout.stripe.com)

### Redirect to Stripe fails

1. Verify payment link URLs are set correctly
2. Ensure URLs start with `https://`
3. Confirm URLs point to buy.stripe.com or checkout.stripe.com

### GitHub Actions workflow fails

1. Verify all secrets are added to the `stripe-prod` environment
2. Check secret names match exactly (case-sensitive)
3. Ensure API key starts with `sk_` and payment link URLs start with `https://`

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use test keys** for development and testing
3. **Rotate keys regularly** in production
4. **Monitor Stripe Dashboard** for suspicious activity
5. **Enable 2FA** on your Stripe account
6. **Review webhook signatures** if using webhooks

## Support

For issues with the integration:

- **Technical issues**: Contact the TABS development team
- **Stripe API issues**: Contact [Stripe Support](https://support.stripe.com)
- **Payment issues**: Check the Stripe Dashboard logs

## Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide)
