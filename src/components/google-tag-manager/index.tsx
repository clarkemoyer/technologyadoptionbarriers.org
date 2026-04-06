'use client'

import Script from 'next/script'

const DEFAULT_GTM_ID = 'GTM-P5GBFCTL'

// Sanitize GTM_ID to prevent XSS: only allow alphanumeric characters and hyphens.
// Falls back to the default if the value contains any other characters.
// Exported so it can be unit-tested directly without duplicating the logic.
export function sanitizeGtmId(rawId: string): string {
  return /^[a-zA-Z0-9-]+$/.test(rawId) ? rawId : DEFAULT_GTM_ID
}

// Evaluate once at module load time
const sanitizedGtmId = sanitizeGtmId(
  process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || DEFAULT_GTM_ID
)

export default function GoogleTagManager() {
  return (
    <>
      {/* Google Tag Manager Script - loaded with lazyOnload for better performance */}
      <Script
        id="gtm-script"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${sanitizedGtmId}');
          `,
        }}
      />
    </>
  )
}

// Export a component for the noscript iframe that goes in the body
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${sanitizedGtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}
