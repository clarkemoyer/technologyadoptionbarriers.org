# Google Tag Manager (GTM) Component

This component implements Google Tag Manager integration for the Technology Adoption Barriers (TABS) website.

## Overview

Google Tag Manager (GTM) is a tag management system that allows you to manage and deploy marketing tags (snippets of code or tracking pixels) on your website without having to modify the code directly.

## Implementation Details

### Components

1. **GoogleTagManager** - Main component that injects the GTM script into the page
2. **GoogleTagManagerNoScript** - Fallback iframe for users with JavaScript disabled

### Features

- ✅ Standard GTM implementation following Google's guidelines
- ✅ Initializes `dataLayer` before GTM loads
- ✅ Uses Next.js `Script` component with `lazyOnload` strategy
- ✅ Includes noscript fallback for accessibility
- ✅ Integrates with existing cookie consent system
- ✅ GTM ID configured via environment variable `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID`

## Configuration

### Setting Your GTM ID

The GTM container ID is managed via the `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` environment variable.

### Local Development / Fallback

The component includes a default fallback ID (`GTM-P5GBFCTL`) for development convenience if the environment variable is not set.

### Production

Ensure the `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` repository variable is set in GitHub Settings > Secrets and variables > Actions > Variables.

1. Open `src/components/google-tag-manager/index.tsx`
2. Update the `GTM_ID` constant with your actual GTM container ID:

```tsx
// Google Tag Manager ID - Update this with your actual GTM container ID
const GTM_ID = 'GTM-XXXXXXX' // Replace with your actual GTM ID
```

Replace `GTM-XXXXXXX` with your actual GTM container ID from Google Tag Manager (e.g., `GTM-ABC1234`).

## Usage

The component is automatically integrated into the root layout (`src/app/layout.tsx`):

```tsx
import GoogleTagManager, { GoogleTagManagerNoScript } from './../components/google-tag-manager'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <GoogleTagManager />
      </head>
      <body>
        <GoogleTagManagerNoScript />
        {/* ... rest of body content */}
      </body>
    </html>
  )
}
```

## How It Works

### 1. Script Injection

The GTM script is loaded using Next.js's `Script` component with the `lazyOnload` strategy, which means:

- The script loads after the browser finishes loading the page
- It doesn't block the initial page load
- It's optimal for analytics and marketing tags

### 2. DataLayer Initialization

The GTM script automatically initializes the `window.dataLayer` array with:

- A timestamp (`gtm.start`)
- The initial event (`gtm.js`)

This ensures the dataLayer is ready to receive events as soon as the page loads.

### 3. Cookie Consent Integration

GTM works as a **functional script** and is always active. The existing `CookieConsent` component manages:

- Analytics scripts (Google Analytics, Microsoft Clarity)
- Marketing scripts (Meta Pixel)

When users accept cookies, the `CookieConsent` component pushes a `consent_update` event to the dataLayer, which GTM can use to conditionally fire tags based on consent status.

### 4. Noscript Fallback

For users with JavaScript disabled, the component includes an iframe fallback that allows GTM to track basic page views.

## Testing

There is no dedicated GTM E2E test file in this repo right now. If you add one, good coverage includes:

- DataLayer initialization
- GTM script loading (`#gtm-script`)
- Noscript fallback presence
- Cookie consent integration behavior

## Deployment

### GitHub Pages Deployment

The GTM implementation works with static exports and GitHub Pages deployments.

The GTM ID is hardcoded in the component, so no additional configuration is needed for deployment.

### Local Development

To test GTM locally:

```bash
# Start development server
npm run dev
```

The GTM script will load automatically with the configured GTM ID.

## Debugging

### Verify GTM is Loading

Open your browser's developer console and check:

```javascript
// Check if dataLayer exists
console.log(window.dataLayer)

// Check if GTM script is loaded
console.log(document.querySelector('script[id="gtm-script"]'))
```

### Google Tag Assistant

Use the [Tag Assistant Chrome Extension](https://tagassistant.google.com/) to verify:

- GTM container is loading
- Tags are firing correctly
- Data is being sent to Google Analytics, Ads, etc.

### Preview Mode

In GTM, use Preview mode to:

1. See which tags fire on your pages
2. Debug tag configurations
3. Test before publishing changes

## Security Considerations

- ✅ GTM ID is hardcoded in the component (visible in source code)
- ✅ Script uses official Google CDN
- ✅ No sensitive data is sent to GTM by default
- ✅ Integrates with cookie consent for privacy compliance

**Note**: Since the GTM ID is hardcoded and visible in the source code, ensure you're using proper GTM security features like allowlists and container permissions to prevent unauthorized modifications.

## Performance

The GTM implementation is optimized for performance:

- Uses Next.js Script component for optimal loading
- Loads after the page finishes loading (doesn't block rendering)
- DataLayer is initialized early to capture events
- Minimal overhead (~7-10KB for GTM container)

## Troubleshooting

### GTM Not Loading

1. Verify the GTM ID in `src/components/google-tag-manager/index.tsx` is correct

2. Check GTM ID format (should be `GTM-XXXXXXX`)

3. Check browser console for errors

### DataLayer Events Not Firing

1. Verify dataLayer is initialized:

   ```javascript
   console.log(window.dataLayer)
   ```

2. Check cookie consent status

3. Use GTM Preview mode to debug

### Ad Blockers

Note: Ad blockers may prevent GTM from loading. This is expected behavior and affects all analytics implementations.

## Updating the GTM ID

To change the GTM container ID:

1. Open `src/components/google-tag-manager/index.tsx`
2. Update the `GTM_ID` constant:
   ```tsx
   const GTM_ID = 'GTM-NEW1234' // Your new GTM ID
   ```
3. Commit and push the changes
4. The changes will be deployed automatically via GitHub Actions

## Additional Resources

- [Google Tag Manager Documentation](https://developers.google.com/tag-manager)
- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [GTM Implementation Guide](https://support.google.com/tagmanager/answer/6103696)
