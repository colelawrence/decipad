/// <reference types="vite/client" />

// Define .env variables to be available for typechecking.
// Prefix them with `VITE_`, otherwise they are not imported.
interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SENTRY_ORG: string;
  readonly VITE_SENTRY_PROJECT: string;
  readonly VITE_SENTRY_AUTH_TOKEN: string;
  readonly VITE_SENTRY_ENVIRONMENT: string;
  readonly VITE_ANALYTICS_WRITE_KEY: string;
  readonly VITE_GOOGLE_SHEETS_KEY: string;
  readonly VITE_STRIPE_PAYMENT_LINK: string;
  readonly VITE_STRIPE_CUSTOMER_PORTAL_LINK: string;
  readonly VITE_STRIPE_API_KEY: string;
  readonly VITE_MAX_CREDITS_PRO: string;
  readonly VITE_MAX_CREDITS_FREE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
