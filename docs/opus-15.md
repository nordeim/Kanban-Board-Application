# SponsorFlow Codebase Summary

## Project Overview

**Elevator Pitch**: SponsorFlow is a production-ready Kanban board application that transforms YouTube sponsorship management from chaotic spreadsheets into a streamlined visual workflow with real-time collaboration, advanced analytics, and automated notifications.

**Key Differentiators**:
- 9-stage sponsorship-specific workflow (New Leads → Completed)
- Real-time drag-and-drop with optimistic updates
- Built-in analytics dashboard with revenue tracking
- Enterprise-grade security with Row Level Security
- Full offline support with service workers

**Primary Use Cases**:
- Track sponsorship deals through custom workflow stages
- Collaborate with team members on deal negotiations
- Analyze sponsorship performance and revenue metrics
- Automate notifications for deadlines and stage changes

## Quick Start

```bash
# Clone and install
git clone https://github.com/nordeim/Kanban-Board-Application.git
cd Kanban-Board-Application
npm install

# Setup database
cp .env.example .env.local
# Edit .env.local with your database credentials
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Run development server
npm run dev

# Open http://localhost:3000
# Login: demo@sponsorflow.io / demo123
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│   Next.js App   │────▶│  Prisma Client   │────▶│  PostgreSQL     │
│  (App Router)   │     │    (Type-safe)   │     │   Database      │
│                 │     │                  │     │                 │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │                                                 │
         │              ┌──────────────────┐              │
         │              │                  │              │
         └─────────────▶│   NextAuth.js    │◀─────────────┘
                        │  (OAuth + JWT)   │
                        │                  │
                        └──────────────────┘
```

**Key Design Decisions**:
- **Next.js 14 App Router**: Server components for performance, built-in caching
- **Prisma ORM**: Type-safe database queries, automatic migrations
- **Shadcn-UI**: Composable components with Radix UI primitives
- **Real-time Updates**: WebSocket for live collaboration, SSE for notifications
- **Optimistic UI**: Immediate feedback with rollback on errors

**Technology Choices**:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes, tRPC-like server actions
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v5 with Google/GitHub OAuth
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel with Edge Functions

## Core Components

### 1. Board System (`src/components/board/`)
**Location**: `src/components/board/BoardView.tsx:42-289`
**Responsibility**: Manages the Kanban board with drag-and-drop functionality
**Key Components**:
- `BoardView`: Main container with DnD context
- `BoardColumn`: Individual stage columns
- `DealCard`: Draggable deal cards with real-time updates

**Usage Example**:
```typescript
<BoardView 
  initialDeals={deals} 
  userId={session.user.id} 
/>
```

### 2. Deal Management (`src/components/deals/`)
**Location**: `src/components/deals/CreateDealDialog.tsx:156-834`
**Responsibility**: CRUD operations for sponsorship deals
**Key Components**:
- `CreateDealDialog`: Multi-step form with validation
- `EditDealDialog`: Update existing deals
- `DealFilters`: Advanced filtering system

**Usage Example**:
```typescript
// Server action
const result = await createDeal(formData)
```

### 3. Analytics Engine (`src/lib/analytics/`)
**Location**: `src/lib/analytics/queries.ts:24-401`
**Responsibility**: Aggregates and calculates business metrics
**Key Functions**:
- `getAnalyticsData()`: Main analytics aggregation
- `calculateRevenueOverTime()`: Time-series revenue data
- `getTopSponsors()`: Sponsor performance metrics

### 4. Authentication System (`src/lib/auth/`)
**Location**: `src/lib/auth/auth.ts:15-89`
**Responsibility**: Secure authentication with role-based access
**Key Components**:
- OAuth providers (Google, GitHub)
- JWT session management
- Role-based middleware

### 5. Database Layer (`src/lib/db/`)
**Location**: `prisma/schema.prisma:1-863`
**Responsibility**: Data persistence and relationships
**Key Models**:
- `Deal`: Core sponsorship deals with 20+ fields
- `User`: Authentication and profile
- `Sponsor`: Company relationships
- `Activity`: Audit logging

### 6. Real-time System (`src/lib/hooks/`)
**Location**: `src/lib/hooks/useRealtimeDeals.ts:12-134`
**Responsibility**: WebSocket connections for live updates
**Key Hooks**:
- `useRealtimeDeals`: Deal updates subscription
- `useRealtimeNotifications`: Push notifications

### 7. UI Component Library (`src/components/ui/`)
**Location**: `src/components/ui/` (30+ components)
**Responsibility**: Consistent, accessible UI components
**Key Components**:
- Form controls with built-in validation
- Data display (tables, cards, charts)
- Feedback (toasts, dialogs, loading states)

## Development Commands

### Setup/Installation
```bash
# Initial setup
npm install
cp .env.example .env.local

# Database setup
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Install Shadcn-UI components
npx shadcn-ui@latest init
./scripts/install-ui.sh
```

### Running Locally
```bash
# Development server
npm run dev              # http://localhost:3000

# Database tools
npm run db:studio        # Prisma Studio GUI
npm run db:push          # Push schema changes
npm run db:reset         # Reset and reseed

# Type checking
npm run type-check       # Check TypeScript
```

### Testing Commands
```bash
# Unit tests
npm test                 # Run all tests
npm test:watch          # Watch mode
npm test:coverage       # Coverage report

# E2E tests
npm run e2e             # Run Playwright tests
npm run e2e:ui          # Playwright UI mode
```

### Code Quality
```bash
# Linting
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix issues

# Formatting
npm run format          # Prettier format
npm run format:check    # Check formatting

# Bundle analysis
npm run analyze         # Analyze bundle size
```

### Deployment
```bash
# Production build
npm run build           # Create production build
npm run start           # Run production server

# Vercel deployment
vercel                  # Deploy preview
vercel --prod          # Deploy to production
```

## Configuration

### Required Environment Variables
```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/sponsorflow"

# Authentication (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (At least one required)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Optional Configurations
```env
# Email Service
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email"
EMAIL_SERVER_PASSWORD="app-specific-password"

# Real-time Features
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### Common Gotchas
- **Database URL**: Must include `?schema=public` for Prisma
- **OAuth Redirect**: Set to `{NEXTAUTH_URL}/api/auth/callback/{provider}`
- **CORS Issues**: WebSocket server needs proper origin configuration
- **Build Errors**: Run `prisma generate` before building

### Security Considerations
- All API routes check authentication via middleware
- Database uses Row Level Security policies
- Environment variables never exposed to client
- CSRF protection enabled by default

## File Structure

```
sponsorflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Public auth pages
│   │   │   └── login/         # Login page
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── board/         # Main Kanban board
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   └── deals/         # Deal management
│   │   └── api/               # API endpoints
│   │       ├── auth/          # NextAuth handlers
│   │       └── deals/         # Deal CRUD operations
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn-UI primitives (30+ files)
│   │   ├── board/            # Kanban board components
│   │   ├── deals/            # Deal forms and modals
│   │   └── analytics/        # Charts and metrics
│   ├── lib/                  # Utilities and logic
│   │   ├── auth/            # Authentication setup
│   │   ├── db/              # Database client
│   │   ├── hooks/           # Custom React hooks
│   │   └── validations/     # Zod schemas
│   └── types/               # TypeScript definitions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Seed data script
├── public/                 # Static assets
├── tests/                  # Test files
└── Configuration files     # .env, next.config.js, etc.
```

### Key File Mappings
| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/(dashboard)/board/page.tsx` | Main Kanban board page |
| `src/components/board/BoardView.tsx` | Drag-and-drop logic |
| `src/lib/auth/auth.ts` | NextAuth configuration |
| `prisma/schema.prisma` | Complete data model |
| `src/lib/validations/deal.ts` | Form validation schemas |

## Extension Guide

### Adding a New Deal Stage
1. Update enum in `prisma/schema.prisma:19`
2. Add to `STAGES` array in `src/components/board/BoardView.tsx:181`
3. Add color mapping in `src/lib/utils.ts:89`
4. Run `npx prisma generate` and migrate

### Creating a New API Endpoint
```typescript
// src/app/api/your-endpoint/route.ts
import { getCurrentUser } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your logic here
}
```

### Adding a New Chart
1. Create component in `src/components/analytics/charts/`
2. Import Recharts components
3. Add to `AnalyticsDashboard` in appropriate tab
4. Update `getAnalyticsData` if new metrics needed

### Custom Deal Fields
1. Add to `customFields` JSONB in deal creation
2. Display in `DealCard` using conditional rendering
3. Add form fields in `CreateDealDialog`

## Testing & Quality

### Test Structure
```
src/__tests__/
├── components/         # Component unit tests
├── hooks/             # Hook tests
└── utils/             # Utility function tests

e2e/
├── auth.spec.ts       # Authentication flows
├── board.spec.ts      # Kanban board interactions
└── deals.spec.ts      # Deal management
```

### Running Tests
```bash
# Unit test a specific component
npm test -- DealCard

# Run E2E test on specific browser
npx playwright test --project=chromium

# Debug a failing test
npx playwright test --debug
```

### Code Style Rules
- ESLint with Next.js recommended rules
- Prettier for consistent formatting
- TypeScript strict mode enabled
- Import sorting enforced

### Performance Considerations
- Server Components used by default
- Images optimized with Next.js Image
- Bundle splitting per route
- Database queries use indexes
- Implement virtual scrolling for large lists

## Common Development Scenarios

### Adding a New Feature
1. Create feature branch from `develop`
2. Add database schema if needed
3. Create UI components in `src/components/`
4. Add server actions in `src/app/actions/`
5. Write tests (unit + E2E)
6. Update this documentation

### Debugging Database Issues
```bash
# Check current schema
npx prisma studio

# View migration history
npx prisma migrate status

# Reset if corrupted
npx prisma migrate reset
```

### Debugging Real-time Updates
1. Check WebSocket connection in Network tab
2. Verify `NEXT_PUBLIC_WS_URL` is correct
3. Check `useRealtimeDeals` hook subscription
4. Monitor server logs for emit events

### Performance Optimization
1. Use React DevTools Profiler
2. Check bundle size with `npm run analyze`
3. Implement `React.memo` for expensive components
4. Use `useCallback` and `useMemo` appropriately
5. Enable React Query cache

---

**Note**: This codebase implements enterprise patterns including soft deletes, audit logging, and role-based access control. Always consider security implications when modifying authentication or data access layers.
