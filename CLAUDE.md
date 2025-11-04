# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KarmAnk is a production-ready Vedic numerology web application built with React 18, TypeScript, and Vite. It provides authentic numerological analysis including Vedic Kundli 3×3 grid calculations, compatibility analysis, name analysis (Chaldean & Pythagorean), and Bhagavad Gita wisdom integration. The app features a cosmic-themed UI with glassmorphism design, starfield backgrounds, and multilingual support (English, Hindi, Hinglish).

## Development Commands

```bash
# Start development server on port 8080
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Project Structure (Updated)

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── nlg/            # NLG & speech components
│   ├── ErrorBoundary.tsx  # Global error boundary
│   └── ...
├── config/             # Application configuration
│   └── app.config.ts   # Centralized app config
├── constants/          # Constants & enums
│   └── index.ts        # All app constants
├── context/            # React context providers
│   └── ReportContext.tsx  # Report state context
├── features/           # Feature-specific code
│   ├── dashboard/
│   └── numerology/
├── lib/                # Utilities & libraries
│   ├── numerology/     # Numerology calculation engine
│   ├── utils.ts        # Utility functions
│   └── i18n.ts         # Internationalization
├── pages/              # Page components
│   ├── app/            # App feature pages
│   ├── landing/        # Landing pages
│   └── ...
├── store/              # Zustand state management
│   └── appStore.ts     # Global app store
├── types/              # TypeScript type definitions
│   └── index.ts        # Centralized types
├── utils/              # Utility functions
│   └── logger.ts       # Logging & error tracking
├── validations/        # Zod validation schemas
│   └── schemas.ts      # Input validation schemas
└── App.tsx             # Root component with error boundary
```

## Architecture

### Routing & Code Splitting

The app uses React Router v6 with **lazy loading** for optimal performance:

- **Eager-loaded**: Login, NotFound (critical paths)
- **Lazy-loaded**: All other pages (code splitting for better performance)
- **Protected routes**: Require authentication via `ProtectedRoute` wrapper
- **App shell**: [/app](src/pages/AppShell.tsx) provides layout with header, navigation, and language switcher

**Routes**:
- `/login` - Authentication page
- `/welcome` - Welcome gateway (protected)
- `/app/numerology` - Vedic Kundli grid analysis (protected)
- `/app/compatibility` - Relationship compatibility (protected)
- `/app/name-analysis` - Name numerology (protected)
- `/app/gita-gyan` - Bhagavad Gita wisdom (protected)

See [App.tsx](src/App.tsx) for complete routing with Suspense and ErrorBoundary.

### State Management

**Zustand Store** ([appStore.ts](src/store/appStore.ts)):
- Global state with localStorage persistence
- **Authentication**: `user`, `isAuthenticated`, `login()`, `logout()`
- **UI preferences**: `language` (en/hi/en-hi), `activeTab`
- **User data**: `plan` (Free/Pro/Supreme), quotas for features
- Uses centralized types from [types/index.ts](src/types/index.ts)

**React Context** ([ReportContext.tsx](src/context/ReportContext.tsx)):
- Provides numerology report data globally
- `report` - Current numerology report (typed)
- `overlayNumbers` - Dasha period numbers
- `dashaReport` - Timeline data for dasha periods

### Type Safety

**Centralized types** in [src/types/index.ts](src/types/index.ts):
- `User`, `Language`, `PlanType` - Auth & user types
- `NumerologyReport`, `KundliGridResult` - Numerology types
- `CompatibilityResult` - Compatibility analysis types
- `DashaReport`, `OverlayNumbers` - Dasha period types

**No more `any` types** - All components use proper TypeScript types.

### Constants & Configuration

**Constants** ([src/constants/index.ts](src/constants/index.ts)):
- Application constants (APP_NAME, VERSION)
- Authentication constants (DEMO_CREDENTIALS)
- Plan quotas (PLANS.FREE, PLANS.PRO, PLANS.SUPREME)
- Language definitions (LANGUAGES array)
- Numerology constants (VEDIC_KUNDLI_MATRIX, MASTER_NUMBERS)
- Validation rules (NAME, DATE, EMAIL patterns)
- Route paths (ROUTES object)
- Error messages (multilingual)
- Feature flags (from environment variables)

**Configuration** ([src/config/app.config.ts](src/config/app.config.ts)):
- Centralized app configuration
- Environment-based settings
- Feature flags
- External service configuration (Google AI, Analytics, Sentry)
- Helper functions: `isFeatureEnabled()`, `isDev()`, `isProd()`

### Validation

**Zod schemas** ([src/validations/schemas.ts](src/validations/schemas.ts)):
- `loginSchema` - Email & password validation
- `numerologyInputSchema` - Name & DOB validation
- `compatibilityInputSchema` - Two-person compatibility validation
- `nameAnalysisInputSchema` - Name analysis validation

**Helper functions**:
- `validateInput(schema, data)` - Validate and parse with Zod
- `getFirstError(error)` - Get first error message
- `getAllErrors(error)` - Get all errors as object

**Usage example**:
```typescript
import { numerologyInputSchema, validateInput } from "@/validations/schemas";

const result = validateInput(numerologyInputSchema, { name, dob });
if (!result.success) {
  const errorMsg = getFirstError(result.errors);
  // Show error to user
}
```

### Error Handling & Logging

**Error Boundary** ([src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx)):
- Global error boundary wraps entire app
- Catches React errors and displays fallback UI
- Logs errors to monitoring service in production
- `FeatureErrorBoundary` - Lightweight boundary for specific features

**Logger** ([src/utils/logger.ts](src/utils/logger.ts)):
- Centralized logging utility
- `logDebug()`, `logInfo()`, `logWarn()`, `logError()` - Different log levels
- `logApiError()` - Special handler for API errors
- `logUserAction()` - Log user actions for analytics
- In production: sends to Sentry/error tracking (when configured)
- In development: console logging with prefixes

**Usage example**:
```typescript
import { logError, logUserAction } from "@/utils/logger";

try {
  // Your code
} catch (error) {
  logError("Failed to generate report", error, { userId: user.id });
}

// Log user actions
logUserAction("report_generated", { reportType: "kundli" });
```

### Numerology Engine

Core calculation logic in [src/lib/numerology/](src/lib/numerology/):

**Main exports from [compute.ts](src/lib/numerology/compute.ts)**:
- `computeCoreNumbers()` - Calculate life path and master numbers
- `computeKundliGrid()` - Generate 3×3 Vedic matrix with plane analysis
- `compatibility()` - Analyze relationship between two birth dates

**Key files**:
- [utils.ts](src/lib/numerology/utils.ts) - `calculateLifePath()`, date parsing
- [data.ts](src/lib/numerology/data.ts) - 81 compatibility combinations
- [letters.ts](src/lib/numerology/letters.ts) - Letter-to-number mappings
- [dashaCalculator.ts](src/lib/numerology/dashaCalculator.ts) - Dasha calculations

### Multilingual Support

Three languages: `"en"` | `"hi"` | `"en-hi"`

**Translation system**:
- Global helper: `t(value, lang)` in [i18n.ts](src/lib/i18n.ts)
- All user-facing text supports multilingual objects:
  ```typescript
  { en: "Hello", hi: "नमस्ते", "en-hi": "Namaste" }
  ```

### UI Components & Design System

**Core UI**: shadcn/ui components in [src/components/ui/](src/components/ui/)

**Custom components**:
- [GlassCard](src/components/ui/glass-card.tsx) - Glassmorphism cards
- [StarfieldBackground](src/components/StarfieldBackground.tsx) - Animated starfield
- [ErrorBoundary](src/components/ErrorBoundary.tsx) - Error boundary with fallback UI

**Design tokens** (in [tailwind.config.ts](tailwind.config.ts)):
- Colors: `cosmic-blue`, `nebula-violet`, `auric-gold`, `stardust`
- Typography: Cinzel (headings), Inter (body), Noto Sans Devanagari (Hindi)

## Environment Variables

Create `.env.local` from [.env.example](.env.example):

```bash
# Required
VITE_APP_NAME=KarmAnk
VITE_ENVIRONMENT=development

# Optional
VITE_GOOGLE_API_KEY=         # For rephrasing feature
VITE_SENTRY_DSN=              # Error tracking
VITE_GA_MEASUREMENT_ID=       # Google Analytics

# Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_CHATBOT=true
VITE_DEBUG_MODE=true
```

## Demo Authentication

**Development/Testing credentials**:
- Email: `demo@karmank.com`
- Password: Any password (accepts all for demo account)

The mock auth system in [appStore.ts](src/store/appStore.ts) should be replaced with real authentication (Firebase, Supabase, Auth0) for production.

## Build Optimizations

**Vite configuration** ([vite.config.ts](vite.config.ts)) includes:

1. **Code splitting**: Manual chunks for vendor libs and numerology engine
2. **Asset organization**: Images, fonts, JS in separate folders with hashing
3. **Tree shaking**: Remove unused code
4. **Minification**: Terser with console.log removal in production
5. **Lazy loading**: Routes loaded on-demand via React.lazy()

**Bundle structure**:
- `vendor-react` - React, React DOM, React Router
- `vendor-ui` - Radix UI components
- `vendor-forms` - React Hook Form, Zod
- `vendor-state` - Zustand, React Query
- `vendor-animation` - Framer Motion
- `vendor-charts` - Recharts
- `numerology-engine` - Custom numerology logic

## Performance Features

✅ **Lazy loading** for all routes (except Login, NotFound)
✅ **Code splitting** with manual chunks
✅ **Global error boundary** to prevent crashes
✅ **Optimized builds** with terser minification
✅ **Asset hashing** for cache busting
✅ **React Query** configured with smart defaults

## Development Workflow

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Make changes** - TypeScript & ESLint will catch errors
4. **Test locally** - Use demo credentials
5. **Build for production**: `npm run build`
6. **Preview build**: `npm run preview`

## Important Notes

- **No TypeScript strict mode** (currently disabled for gradual migration)
- **React Query installed** but properly configured (used globally)
- **Console logs removed** in production builds automatically
- **All paths use `@/` alias** for clean imports
- **Error logging ready** for Sentry integration (set VITE_SENTRY_DSN)
- **Analytics ready** for Google Analytics (set VITE_GA_MEASUREMENT_ID)

## Next Steps for Production

1. **Replace mock authentication** with real auth service
2. **Enable Sentry** for error tracking (add DSN to env)
3. **Enable TypeScript strict mode** gradually
4. **Add tests** (Vitest + React Testing Library)
5. **Add CI/CD pipeline** if needed
6. **Setup analytics** (Google Analytics or alternative)
7. **Configure CSP headers** in hosting platform

## Vedic Kundli Grid System

The 3×3 matrix follows traditional Vedic numerology:
```
3  1  9    ← Mental Plane (intellect, creativity)
6  7  5    ← Emotional Plane (feelings, relationships)
2  8  4    ← Physical Plane (material, practical)
```

Defined in `VEDIC_KUNDLI_MATRIX` constant ([constants/index.ts](src/constants/index.ts)).

Implementation in [compute.ts](src/lib/numerology/compute.ts):
- Counts digit occurrences from DOB (excluding zeros)
- Adds life path number to counts
- Evaluates each plane: strong (3 numbers), balanced (2), weak (1), missing (0)
