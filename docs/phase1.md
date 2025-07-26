# Phase 1: Project Foundation & Configuration - Complete Implementation

I'll create the complete scaffolding for the SponsorFlow project with production-ready configuration files. Let me carefully implement each file with all necessary configurations.

## 1. Initialize Next.js Project

First, run this command to create the project:

```bash
npx create-next-app@latest sponsorflow --typescript --tailwind --app --src-dir --import-alias "@/*"
cd sponsorflow
```

## 2. Complete Configuration Files

### 📦 `package.json`

```json
{
  "name": "sponsorflow",
  "version": "1.0.0",
  "description": "YouTube Sponsorship Workflow Management System - Transform your sponsorship chaos into organized success",
  "author": "SponsorFlow Team",
  "license": "MIT",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint && eslint . --ext .ts,.tsx",
    "lint:fix": "next lint --fix && eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "postinstall": "prisma generate",
    "prepare": "husky install",
    "analyze": "ANALYZE=true next build",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@auth/prisma-adapter": "^1.0.12",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^3.3.4",
    "@prisma/client": "^5.8.1",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.17.9",
    "@tanstack/react-table": "^8.11.6",
    "@vercel/analytics": "^1.1.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "cmdk": "^0.2.0",
    "date-fns": "^3.2.0",
    "embla-carousel-react": "^8.0.0",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.309.0",
    "next": "14.1.0",
    "next-auth": "^5.0.0-beta.4",
    "next-themes": "^0.2.1",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.2",
    "react-hot-toast": "^2.4.1",
    "recharts": "^2.10.4",
    "socket.io-client": "^4.6.0",
    "sonner": "^1.3.1",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "usehooks-ts": "^2.9.1",
    "vaul": "^0.8.0",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.4.4",
    "@commitlint/config-conventional": "^18.4.4",
    "@next/bundle-analyzer": "^14.1.0",
    "@playwright/test": "^1.41.0",
    "@storybook/addon-essentials": "^7.6.7",
    "@storybook/addon-interactions": "^7.6.7",
    "@storybook/addon-links": "^7.6.7",
    "@storybook/blocks": "^7.6.7",
    "@storybook/nextjs": "^7.6.7",
    "@storybook/react": "^7.6.7",
    "@storybook/testing-library": "^0.2.2",
    "@testing-library/jest-dom": "^6.2.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.2",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.18.1",
    "@typescript-eslint/parser": "^6.18.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-storybook": "^0.6.15",
    "eslint-plugin-tailwindcss": "^3.14.0",
    "husky": "^8.0.3",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "lint-staged": "^15.2.0",
    "postcss": "^8.4.33",
    "prettier": "^3.2.2",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "prisma": "^5.8.1",
    "storybook": "^7.6.7",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,mdx,css,scss}": [
      "prettier --write"
    ]
  },
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@9.8.1"
}
```

### 🔧 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/lib/hooks/*"],
      "@/utils/*": ["./src/lib/utils/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/types/*": ["./src/types/*"],
      "@/app/*": ["./src/app/*"],
      "@/public/*": ["./public/*"]
    },
    "types": ["jest", "@testing-library/jest-dom", "node"]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src/**/*",
    "tests/**/*",
    "playwright.config.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "coverage",
    "storybook-static"
  ]
}
```

### 🎨 `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'
import animate from 'tailwindcss-animate'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom colors for Kanban board stages
        stage: {
          'new-leads': 'hsl(var(--stage-new-leads))',
          'initial-contact': 'hsl(var(--stage-initial-contact))',
          'negotiation': 'hsl(var(--stage-negotiation))',
          'contract-review': 'hsl(var(--stage-contract-review))',
          'content-creation': 'hsl(var(--stage-content-creation))',
          'review-approval': 'hsl(var(--stage-review-approval))',
          'publishing': 'hsl(var(--stage-publishing))',
          'payment-pending': 'hsl(var(--stage-payment-pending))',
          'completed': 'hsl(var(--stage-completed))',
        },
        // Priority colors
        priority: {
          low: 'hsl(var(--priority-low))',
          medium: 'hsl(var(--priority-medium))',
          high: 'hsl(var(--priority-high))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'drag-hover': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.02) rotate(1deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'drag-hover': 'drag-hover 0.3s ease-in-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
      boxShadow: {
        'card-hover': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'drag': '0 20px 50px rgba(0, 0, 0, 0.15)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [animate],
} satisfies Config

export default config
```

### 🔐 `.env.example`

```bash
# ==========================================
# ENVIRONMENT
# ==========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SponsorFlow"
NEXT_PUBLIC_APP_DESCRIPTION="YouTube Sponsorship Workflow Management"

# ==========================================
# DATABASE - PostgreSQL
# ==========================================
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://sponsorflow_user:your_secure_password@localhost:5432/sponsorflow_db?schema=public"
# For production with connection pooling (e.g., Prisma Data Proxy)
DATABASE_URL_NON_POOLING="postgresql://sponsorflow_user:your_secure_password@localhost:5432/sponsorflow_db?schema=public"

# Shadow database for migrations (development only)
SHADOW_DATABASE_URL="postgresql://sponsorflow_user:your_secure_password@localhost:5432/sponsorflow_shadow?schema=public"

# ==========================================
# AUTHENTICATION - NextAuth.js
# ==========================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# ==========================================
# OAuth Providers
# ==========================================
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# YouTube OAuth (if different from Google)
YOUTUBE_CLIENT_ID="your-youtube-client-id.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="your-youtube-client-secret"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# ==========================================
# EMAIL SERVICE
# ==========================================
# SMTP Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-specific-password"
EMAIL_FROM="SponsorFlow <noreply@sponsorflow.io>"

# Alternative: SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"

# Alternative: Resend
RESEND_API_KEY="your-resend-api-key"

# ==========================================
# REAL-TIME FEATURES
# ==========================================
# WebSocket Server URL
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
# For production
# NEXT_PUBLIC_WS_URL="wss://ws.sponsorflow.io"

# Pusher (alternative to WebSocket)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="us2"

# ==========================================
# FILE STORAGE
# ==========================================
# AWS S3 / Compatible Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="sponsorflow-uploads"

# Alternative: Uploadthing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# ==========================================
# EXTERNAL APIs
# ==========================================
# YouTube Data API
YOUTUBE_API_KEY="your-youtube-api-key"

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Sentry Error Tracking
SENTRY_DSN="https://your-key@sentry.io/your-project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-key@sentry.io/your-project-id"
SENTRY_ORG="your-org"
SENTRY_PROJECT="sponsorflow"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# ==========================================
# PAYMENT PROCESSING (Future Feature)
# ==========================================
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# ==========================================
# RATE LIMITING & SECURITY
# ==========================================
# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Rate limiting
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"

# ==========================================
# FEATURE FLAGS
# ==========================================
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_PWA="true"
NEXT_PUBLIC_ENABLE_REALTIME="true"
NEXT_PUBLIC_MAINTENANCE_MODE="false"

# ==========================================
# DEVELOPMENT TOOLS
# ==========================================
# Prisma Studio
BROWSER="none"

# Debug mode
DEBUG="sponsorflow:*"
NEXT_PUBLIC_DEBUG_MODE="false"

# ==========================================
# CRON JOBS
# ==========================================
CRON_SECRET="your-cron-secret-for-security"

# ==========================================
# MISC
# ==========================================
# Timezone for the application
TZ="America/New_York"

# API Version
API_VERSION="v1"

# Cache TTL in seconds
CACHE_TTL="3600"
```

## 3. Additional Scaffolding Files

### 📄 `.gitignore`

```gitignore
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
.nyc_output
playwright-report
playwright/.cache
test-results

# Next.js
.next
out
build
dist

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Misc
.DS_Store
*.pem
.vscode/*
!.vscode/extensions.json
.idea

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env*.local
.env.development
.env.test
.env.production

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
prisma/migrations/dev
*.db
*.db-journal
*.sqlite
*.sqlite3

# IDE
.idea
*.swp
*.swo
*~
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# OS
.DS_Store
Thumbs.db

# Storybook
storybook-static

# Bundle analyzer
.next/analyze

# PWA
public/sw.js
public/workbox-*.js
public/worker-*.js
public/sw.js.map
public/workbox-*.js.map
public/worker-*.js.map

# Sentry
.sentryclirc
```

### 🔧 `.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:tailwindcss/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "tailwindcss"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        "prefer": "type-imports"
      }
    ],
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/classnames-order": "warn",
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "ignorePatterns": [
    "node_modules",
    ".next",
    "out",
    "public",
    "*.config.js",
    "*.config.ts"
  ]
}
```

### 🎨 `.prettierrc`

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindConfig": "./tailwind.config.ts",
  "importOrder": [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "^@/types/(.*)$",
    "^@/config/(.*)$",
    "^@/lib/(.*)$",
    "^@/hooks/(.*)$",
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/styles/(.*)$",
    "^@/app/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

### 🚀 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    domains: [
      'localhost',
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub profile images
      'i.ytimg.com', // YouTube thumbnails
      'yt3.ggpht.com', // YouTube channel avatars
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/board',
        permanent: false,
      },
    ]
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

## 4. Project Structure Creation Script

Create a file `scripts/scaffold.sh` to set up the directory structure:

```bash
#!/bin/bash

# Create directory structure
mkdir -p src/{app,components,lib,styles,types}
mkdir -p src/app/{api,"(auth)","(dashboard)"}
mkdir -p src/app/"(auth)"/{login,register,forgot-password}
mkdir -p src/app/"(dashboard)"/{board,deals,analytics,settings}
mkdir -p src/app/api/{auth,deals,webhooks}
mkdir -p src/components/{ui,board,deals,layout,shared,analytics}
mkdir -p src/lib/{auth,db,hooks,utils,validations,stores}
mkdir -p src/styles/themes
mkdir -p prisma/migrations
mkdir -p public/{images,fonts}
mkdir -p tests/{unit,integration,e2e}

# Create placeholder files
touch src/app/layout.tsx
touch src/app/page.tsx
touch src/app/globals.css
touch src/lib/utils.ts
touch prisma/schema.prisma
touch README.md
touch CONTRIBUTING.md
touch LICENSE

echo "✅ Project structure created successfully!"
```

Make it executable and run:

```bash
chmod +x scripts/scaffold.sh
./scripts/scaffold.sh
```

## 5. Install Dependencies

```bash
# Install all dependencies
npm install

# Generate Prisma client
npx prisma generate

# Install Shadcn-UI CLI
npx shadcn-ui@latest init
```

When prompted by Shadcn-UI init, use these settings:
- Would you like to use TypeScript? → Yes
- Which style would you like to use? → Default
- Which color would you like to use as base color? → Slate
- Where is your global CSS file? → src/app/globals.css
- Would you like to use CSS variables for colors? → Yes
- Where is your tailwind.config.ts located? → tailwind.config.ts
- Configure the import alias for components? → @/components
- Configure the import alias for utils? → @/lib/utils

## 6. Verification Checklist

Run these commands to verify everything is set up correctly:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format checking
npm run format:check

# Build test
npm run build
```

This completes Phase 1 with a robust, production-ready foundation for the SponsorFlow project. All configuration files are optimized for the Kanban board application with comprehensive settings for development, testing, and deployment.
