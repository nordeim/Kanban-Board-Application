/**
 * Environment Variables Type Declarations
 * Provides type safety for process.env
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_APP_URL: string
    NEXT_PUBLIC_APP_NAME: string

    // Database
    DATABASE_URL: string
    DATABASE_URL_NON_POOLING?: string
    SHADOW_DATABASE_URL?: string

    // NextAuth
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string

    // OAuth Providers
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GITHUB_CLIENT_ID?: string
    GITHUB_CLIENT_SECRET?: string

    // Email
    EMAIL_SERVER_HOST: string
    EMAIL_SERVER_PORT: string
    EMAIL_SERVER_USER: string
    EMAIL_SERVER_PASSWORD: string
    EMAIL_FROM: string

    // Optional Services
    SENTRY_DSN?: string
    NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
    UPLOADTHING_SECRET?: string
    UPLOADTHING_APP_ID?: string
  }
}
