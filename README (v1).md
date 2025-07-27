<div align="center">
  <img src="https://github.com/nordeim/Kanban-Board-Application/assets/sponsorflow-logo.png" alt="SponsorFlow Logo" width="200"/>
  
  # SponsorFlow - YouTube Sponsorship Workflow Management
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-Latest-black?style=for-the-badge)](https://ui.shadcn.com/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
  
  **Transform your YouTube sponsorship chaos into organized success**
  
  [Live Demo](https://sponsorflow-demo.vercel.app) | [Documentation](https://docs.sponsorflow.io) | [Report Bug](https://github.com/nordeim/Kanban-Board-Application/issues) | [Request Feature](https://github.com/nordeim/Kanban-Board-Application/discussions)
</div>

## 🌟 Welcome to SponsorFlow

SponsorFlow is a revolutionary Kanban board application meticulously crafted for YouTube creators who want to transform their sponsorship management from chaotic spreadsheets to a streamlined, visual workflow. Built with cutting-edge web technologies and an obsessive attention to user experience, SponsorFlow empowers creators to track sponsorship deals through nine carefully designed workflow stages, from initial contact to successful completion.

### 🎯 Why SponsorFlow?

In the rapidly evolving creator economy, managing sponsorships efficiently can make the difference between sustainable growth and missed opportunities. Traditional project management tools weren't designed with creators in mind – they're either too complex for individual creators or too simple for professional sponsorship workflows. SponsorFlow bridges this gap with:

- **Creator-Centric Design**: Every feature is built specifically for YouTube sponsorship workflows
- **Visual Workflow Management**: See all your deals at a glance with our intuitive Kanban board
- **Smart Automation**: Reduce manual work with intelligent deal tracking and notifications
- **Collaborative Features**: Perfect for creators working with teams or agencies
- **Data-Driven Insights**: Make better decisions with comprehensive analytics

## 🚀 Key Features

### 📊 Intelligent Kanban Board
- **9 Specialized Workflow Stages**: From "New Leads" to "Completed" – each stage is optimized for sponsorship management
- **Drag-and-Drop Simplicity**: Move deals between stages with smooth, responsive interactions
- **Real-Time Updates**: See changes instantly without refreshing
- **Smart Card Design**: All essential information visible at a glance

### 🔍 Advanced Search & Filtering
- **Global Search**: Find any deal instantly across all stages
- **Multi-Criteria Filtering**: Filter by sponsor, value, date, priority, and more
- **Quick Filters**: One-click access to active deals, due this week, and high priority items
- **Saved Filter Sets**: Create custom filter combinations for different workflows

### 📱 Responsive Design Excellence
- **Desktop-First, Mobile-Ready**: Optimized for productivity on large screens while maintaining full functionality on mobile
- **Touch-Optimized**: Smooth touch interactions for tablet users
- **Adaptive Layouts**: Intelligent UI adjustments based on screen size
- **Progressive Web App**: Install as a native app on any device

### 🎨 Modern UI/UX
- **Beautiful Shadcn-UI Components**: Consistent, accessible, and customizable
- **Dark Mode Support**: Easy on the eyes during late-night editing sessions
- **Smooth Animations**: Delightful micro-interactions throughout
- **Customizable Themes**: Personalize your workspace

### 🔐 Enterprise-Grade Security
- **Secure Authentication**: Multiple login options with industry-standard security
- **Data Encryption**: All sensitive information encrypted at rest and in transit
- **Role-Based Access**: Control who can see and edit deals
- **Audit Logging**: Track all changes for compliance and security

## 📁 Project Structure

```
sponsorflow/
├── 📱 app/                          # Next.js 14 App Directory
│   ├── (auth)/                      # Authentication routes group
│   │   ├── login/                   # Login page
│   │   │   ├── page.tsx            # Login page component
│   │   │   └── layout.tsx          # Auth layout wrapper
│   │   ├── register/               # Registration page
│   │   └── forgot-password/        # Password recovery
│   ├── (dashboard)/                # Protected dashboard routes
│   │   ├── board/                  # Main Kanban board
│   │   │   ├── page.tsx           # Board page component
│   │   │   └── loading.tsx        # Loading state
│   │   ├── deals/                  # Deal management
│   │   │   ├── [id]/              # Individual deal pages
│   │   │   └── new/               # New deal creation
│   │   ├── analytics/             # Analytics dashboard
│   │   └── settings/              # User settings
│   ├── api/                       # API routes
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── deals/                 # Deal CRUD operations
│   │   └── webhooks/              # External integrations
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles
│
├── 🧩 components/                  # React components
│   ├── ui/                        # Shadcn-UI components
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── dialog.tsx            # Modal dialog
│   │   ├── input.tsx             # Input fields
│   │   └── [30+ more components] # Full component library
│   ├── board/                     # Kanban board components
│   │   ├── BoardColumn.tsx       # Individual column
│   │   ├── DealCard.tsx          # Deal card component
│   │   ├── BoardHeader.tsx       # Board header with filters
│   │   └── QuickActions.tsx      # Quick action buttons
│   ├── deals/                     # Deal-related components
│   │   ├── DealForm.tsx          # Create/edit form
│   │   ├── DealDetails.tsx       # Detail view sidebar
│   │   └── DealFilters.tsx       # Filter controls
│   ├── layout/                    # Layout components
│   │   ├── Header.tsx            # App header
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── Footer.tsx            # App footer
│   └── shared/                    # Shared components
│       ├── SearchCommand.tsx      # Global search
│       ├── NotificationBell.tsx   # Notifications
│       └── UserMenu.tsx          # User profile menu
│
├── 🛠️ lib/                        # Utility libraries
│   ├── db/                        # Database utilities
│   │   ├── prisma.ts             # Prisma client
│   │   └── queries.ts            # Database queries
│   ├── auth/                      # Authentication helpers
│   │   ├── auth.ts               # NextAuth configuration
│   │   └── session.ts            # Session management
│   ├── utils/                     # General utilities
│   │   ├── cn.ts                 # Class name helper
│   │   ├── formatters.ts         # Data formatters
│   │   └── validators.ts         # Validation schemas
│   └── hooks/                     # Custom React hooks
│       ├── useDeals.ts           # Deal management hook
│       ├── useDragDrop.ts        # Drag and drop logic
│       └── useFilters.ts         # Filter state management
│
├── 🎨 styles/                     # Additional styles
│   ├── animations.css            # Custom animations
│   └── themes/                   # Theme variations
│
├── 🏢 prisma/                     # Database schema
│   ├── schema.prisma             # Prisma schema file
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
│
├── 📦 public/                     # Static assets
│   ├── images/                   # Images and icons
│   ├── fonts/                    # Custom fonts
│   └── manifest.json             # PWA manifest
│
├── 🧪 tests/                      # Test suites
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│
├── 📄 Configuration Files
│   ├── .env.example              # Environment variables template
│   ├── .eslintrc.json           # ESLint configuration
│   ├── .prettierrc              # Prettier configuration
│   ├── next.config.js           # Next.js configuration
│   ├── tailwind.config.ts       # Tailwind CSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── package.json             # Project dependencies
│
└── 📚 Documentation
    ├── API.md                   # API documentation
    ├── CONTRIBUTING.md          # Contribution guidelines
    └── DEPLOYMENT.md            # Deployment guide
```

## 🔄 System Architecture & Flow Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Browser/PWA] --> B[Next.js Frontend]
        B --> C{Route Type}
        C -->|Public| D[Landing/Auth Pages]
        C -->|Protected| E[Dashboard Pages]
    end
    
    subgraph "Application Layer"
        E --> F[Board View]
        E --> G[Deal Management]
        E --> H[Analytics]
        
        F --> I[Drag & Drop Handler]
        F --> J[Real-time Updates]
        
        G --> K[CRUD Operations]
        G --> L[Bulk Actions]
    end
    
    subgraph "API Layer"
        I --> M[WebSocket Connection]
        J --> M
        K --> N[REST API]
        L --> N
        
        M --> O[Event Handler]
        N --> P[Request Validator]
    end
    
    subgraph "Service Layer"
        O --> Q[Deal Service]
        P --> Q
        Q --> R[Auth Service]
        Q --> S[Notification Service]
    end
    
    subgraph "Data Layer"
        Q --> T[(PostgreSQL)]
        R --> U[(Redis Cache)]
        S --> V[Email Queue]
    end
    
    subgraph "External Services"
        R --> W[OAuth Providers]
        S --> X[Email Service]
        Q --> Y[YouTube API]
    end
```

## 📋 File Descriptions

### Core Application Files

#### `/app` Directory
- **`layout.tsx`**: Root layout component that wraps all pages with common elements like providers, fonts, and metadata
- **`page.tsx`**: Landing page showcasing SponsorFlow features and benefits
- **`globals.css`**: Global CSS file importing Tailwind and defining CSS variables for theming

#### `/app/(auth)` Directory
- **`login/page.tsx`**: Secure login page with email/password and social authentication options
- **`register/page.tsx`**: User registration with comprehensive form validation
- **`layout.tsx`**: Authentication layout providing consistent styling for auth pages

#### `/app/(dashboard)` Directory
- **`board/page.tsx`**: Main Kanban board interface with 9-stage workflow visualization
- **`deals/[id]/page.tsx`**: Individual deal detail page with full edit capabilities
- **`analytics/page.tsx`**: Comprehensive analytics dashboard with charts and insights
- **`settings/page.tsx`**: User preferences, account settings, and customization options

### Component Library

#### `/components/ui` Directory
Contains 30+ meticulously crafted Shadcn-UI components:
- **`button.tsx`**: Versatile button component with multiple variants and sizes
- **`card.tsx`**: Container component for deal cards and content sections
- **`dialog.tsx`**: Modal system for forms and confirmations
- **`command.tsx`**: Powerful search interface with keyboard navigation
- **`calendar.tsx`**: Date picker for scheduling and deadlines
- **`select.tsx`**: Accessible dropdown menus for filtering and selection

#### `/components/board` Directory
- **`BoardColumn.tsx`**: Manages individual Kanban columns with drag-and-drop zones
- **`DealCard.tsx`**: Rich deal cards displaying sponsor info, timelines, and actions
- **`BoardHeader.tsx`**: Contains view controls, filters, and board-level actions
- **`DragOverlay.tsx`**: Visual feedback during drag operations

### Utility Libraries

#### `/lib/db` Directory
- **`prisma.ts`**: Singleton Prisma client for database connections
- **`queries.ts`**: Optimized database queries with proper indexing

#### `/lib/hooks` Directory
- **`useDeals.ts`**: Custom hook managing deal state and operations
- **`useDragDrop.ts`**: Encapsulates drag-and-drop logic with touch support
- **`useFilters.ts`**: Advanced filtering logic with URL persistence
- **`useKeyboardShortcuts.ts`**: Power user keyboard navigation

## ✅ Current Features Implementation Status

### Fully Implemented ✅
- ✅ **Authentication System**: Complete with email/password and social logins
- ✅ **Kanban Board Core**: 9-stage workflow with smooth drag-and-drop
- ✅ **Deal CRUD Operations**: Create, read, update, delete with validation
- ✅ **Basic Filtering**: Filter by stage, priority, and date range
- ✅ **Responsive Design**: Mobile-first approach with desktop optimizations
- ✅ **Dark Mode**: System-aware with manual toggle
- ✅ **Real-time Updates**: WebSocket integration for live collaboration

### Partially Implemented 🚧
- 🚧 **Analytics Dashboard**: Basic charts implemented, advanced metrics pending
- 🚧 **Email Notifications**: System emails working, custom templates in progress
- 🚧 **Bulk Operations**: Multi-select implemented, bulk actions being refined
- 🚧 **Search Functionality**: Basic search complete, advanced search in development

### Planned Features 📋
- 📋 **AI-Powered Insights**: Smart recommendations for deal optimization
- 📋 **Calendar Integration**: Sync with Google Calendar and other platforms
- 📋 **Revenue Forecasting**: Predictive analytics for income planning
- 📋 **Template Library**: Pre-built templates for common sponsorship types

## 🗺️ Development Roadmap

### Immediate Goals (Next 3 Months)

#### Month 1: Core Enhancements
- [ ] Complete advanced search with filters
- [ ] Implement comprehensive activity logging
- [ ] Add custom field support for deals
- [ ] Enhance mobile drag-and-drop experience
- [ ] Implement keyboard shortcuts throughout

#### Month 2: Integration & Analytics
- [ ] YouTube API integration for channel stats
- [ ] Advanced analytics with custom reports
- [ ] Email template builder
- [ ] Zapier/Make.com webhook support
- [ ] Export functionality (CSV, PDF)

#### Month 3: Collaboration Features
- [ ] Team workspaces with permissions
- [ ] Comment threads on deals
- [ ] @mentions and notifications
- [ ] Shared deal templates
- [ ] Guest access for sponsors

### Long-term Goals (6-12 Months)

#### Advanced Features
- [ ] **AI Assistant**: Natural language commands and smart suggestions
- [ ] **Automated Workflows**: If-this-then-that automation rules
- [ ] **Multi-channel Support**: Expand beyond YouTube to other platforms
- [ ] **Revenue Intelligence**: Advanced forecasting and optimization
- [ ] **White-label Option**: Custom branding for agencies

#### Platform Expansion
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **Browser Extensions**: Quick deal capture from any webpage
- [ ] **API Marketplace**: Third-party integrations ecosystem
- [ ] **Plugin System**: Extensible architecture for custom features

#### Enterprise Features
- [ ] **SSO/SAML Support**: Enterprise authentication
- [ ] **Advanced Security**: SOC 2 compliance, audit logs
- [ ] **Custom Workflows**: Configurable stage definitions
- [ ] **SLA Management**: Service level agreement tracking
- [ ] **Multi-currency Support**: Global sponsorship management

## 🚀 Deployment Guide

### Prerequisites
Before you begin, ensure you have:
- Node.js 18+ and npm/yarn/pnpm installed
- PostgreSQL database (local or cloud)
- Git for version control
- A Vercel, Netlify, or similar hosting account

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/nordeim/Kanban-Board-Application.git

# Navigate to project directory
cd Kanban-Board-Application

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Step 2: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sponsorflow"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Service
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@sponsorflow.io"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### Step 3: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### Step 4: Local Development

```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev

# Open http://localhost:3000
```

### Step 5: Production Build

```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

### Step 6: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables
5. Deploy!

### Step 7: Post-Deployment

1. **Configure Domain**: Add your custom domain in Vercel settings
2. **Enable Analytics**: Set up Vercel Analytics for performance monitoring
3. **Set up Monitoring**: Configure error tracking with Sentry
4. **Enable Backups**: Set up automated database backups
5. **Configure CDN**: Optimize asset delivery with Vercel's Edge Network

## 🤝 Contributing

We welcome contributions from developers of all skill levels! SponsorFlow is built by the community, for the community.

### How to Contribute

1. **Fork the Repository**: Click the "Fork" button at the top right
2. **Create a Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Implement your feature or fix
4. **Test Thoroughly**: Ensure all tests pass
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Pull Request**: Open a PR with a clear description

### Contribution Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Be respectful and constructive in discussions

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📄 License

SponsorFlow is open source software licensed under the MIT License. See the [LICENSE](LICENSE) file for full details.

## 🙏 Acknowledgments

### Built With Love Using
- [Next.js](https://nextjs.org/) - The React framework for production
- [Shadcn-UI](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Vercel](https://vercel.com/) - Deployment and hosting

### Special Thanks
- The amazing open source community
- All our contributors and early adopters
- YouTube creators who inspired this project

## 💬 Community & Support

### Get Help
- 📖 [Documentation](https://docs.sponsorflow.io)
- 💬 [Discord Community](https://discord.gg/sponsorflow)
- 🐛 [Issue Tracker](https://github.com/nordeim/Kanban-Board-Application/issues)
- 📧 [Email Support](mailto:support@sponsorflow.io)

### Stay Updated
- 🐦 [Twitter](https://twitter.com/sponsorflow)
- 📰 [Blog](https://blog.sponsorflow.io)
- 📺 [YouTube Channel](https://youtube.com/@sponsorflow)

---

<div align="center">
  <p>Built with ❤️ by creators, for creators</p>
  <p>© 2025 SponsorFlow. All rights reserved.</p>
</div>
