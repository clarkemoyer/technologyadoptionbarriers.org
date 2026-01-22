# Microsoft Clarity Route Tracking

## Overview

The `ClarityRouteTracker` component ensures that Microsoft Clarity properly tracks page views in this Next.js single-page application (SPA).

## Problem

Microsoft Clarity doesn't automatically track client-side navigation in SPAs. When users navigate using Next.js Link components, the browser doesn't perform a full page reload, so Clarity's default tracking doesn't register new page views. This causes:

- Sessions to show incomplete navigation paths
- Heat maps to miss important user interactions
- Analytics data to be inaccurate

## Solution

The `ClarityRouteTracker` component hooks into Next.js's navigation system and manually notifies Clarity when the route changes.

### How It Works

1. **Route Detection**: Uses Next.js's `usePathname()` hook to detect route changes
2. **Clarity API Call**: Calls `window.clarity('set', 'page', pathname)` on each route change
3. **BasePath Support**: Automatically includes the GitHub Pages basePath when configured

### Implementation

The component is added to the root layout (`src/app/layout.tsx`) so it runs on every page:

```tsx
import ClarityRouteTracker from '@/components/clarity-route-tracker'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClarityRouteTracker />
        {/* rest of app */}
      </body>
    </html>
  )
}
```

## Technical Details

### Component Location

- **Path**: `src/components/clarity-route-tracker/index.tsx`
- **Type**: Client Component (`'use client'`)

### Dependencies

- `react` - useEffect hook
- `next/navigation` - usePathname hook

### Environment Variables

- `NEXT_PUBLIC_BASE_PATH` - Optional. Used for GitHub Pages deployment.

## Testing

Unit tests are located in `__tests__/components/ClarityRouteTracker.test.tsx` and cover:

- ✅ Clarity API calls on route changes
- ✅ BasePath handling
- ✅ Graceful handling when Clarity isn't loaded
- ✅ Multiple route changes in succession

Run tests with:

```bash
npm test -- ClarityRouteTracker
```

## References

- [Microsoft Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Clarity JavaScript API](https://docs.microsoft.com/en-us/clarity/setup-and-installation/clarity-api)
- [Next.js usePathname Hook](https://nextjs.org/docs/app/api-reference/functions/use-pathname)

## Notes

- The component returns `null` and doesn't render any UI
- It only runs on the client side (not during SSR)
- It safely handles cases where Clarity hasn't loaded yet
- Compatible with both custom domain and GitHub Pages deployments
