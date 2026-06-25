# Codentra — Frontend Architecture

**Version:** 1.0  
**Framework:** Next.js 15 (App Router)  
**Last Updated:** 2025-06-25

---

## 1. Overview

The Codentra frontend is a Next.js 15 application using the App Router, TypeScript, Tailwind CSS, and Shadcn UI. It follows a feature-based architecture with clear separation between server state (React Query), client state (Zustand), and presentation components.

### 1.1 Design Goals

- **Performance:** Server Components by default; client components only when needed.
- **Type Safety:** Strict TypeScript; shared API types.
- **Mobile First:** Responsive design with Tailwind breakpoints.
- **Developer Experience:** Feature colocation; predictable patterns.
- **User Experience:** Loading, empty, and error states on every feature.

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      App Router (Next.js)                    │
│  Layouts → Pages → Server Components → Client Components    │
├─────────────────────────────────────────────────────────────┤
│                     Feature Modules                          │
│  components/ hooks/ api/ types/ schemas/ stores/            │
├─────────────────────────────────────────────────────────────┤
│                      State Layer                             │
│  React Query (server state) │ Zustand (client UI state)     │
├─────────────────────────────────────────────────────────────┤
│                       API Layer                              │
│  api-client → interceptors → backend REST API               │
├─────────────────────────────────────────────────────────────┤
│                    Shared Components                         │
│  Shadcn UI │ Layout │ Forms │ Feedback │ Data Display        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Folder Structure

```
frontend/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   │
│   │   ├── (marketing)/                  # Public marketing routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Landing (redirect from root or alias)
│   │   │   └── pricing/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/                       # Auth routes
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── google/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (dashboard)/                  # Authenticated user routes
│   │   │   ├── layout.tsx                # Dashboard shell (sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   ├── contests/                 # Phase 2
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── leaderboards/             # Phase 2
│   │   │   │   └── page.tsx
│   │   │   ├── jobs/                     # Phase 3
│   │   │   │   └── page.tsx
│   │   │   ├── referrals/                # Phase 3
│   │   │   │   └── page.tsx
│   │   │   └── services/                 # Phase 4
│   │   │       └── page.tsx
│   │   │
│   │   └── (admin)/                      # Admin routes
│   │       ├── layout.tsx
│   │       └── admin/
│   │           ├── page.tsx              # Overview
│   │           ├── users/
│   │           │   ├── page.tsx
│   │           │   └── [id]/
│   │           │       └── page.tsx
│   │           ├── subscriptions/
│   │           │   └── page.tsx
│   │           ├── payments/
│   │           │   └── page.tsx
│   │           └── activity-logs/
│   │               └── page.tsx
│   │
│   ├── features/                         # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   ├── google-auth-button.tsx
│   │   │   │   ├── forgot-password-form.tsx
│   │   │   │   └── reset-password-form.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-login.ts
│   │   │   │   └── use-register.ts
│   │   │   ├── api/
│   │   │   │   └── auth-api.ts
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── landing/
│   │   │   ├── components/
│   │   │   │   ├── hero-section.tsx
│   │   │   │   ├── features-section.tsx
│   │   │   │   ├── pricing-section.tsx
│   │   │   │   ├── testimonials-section.tsx
│   │   │   │   └── cta-section.tsx
│   │   │   └── constants/
│   │   │       └── features.ts
│   │   │
│   │   ├── subscription/
│   │   │   ├── components/
│   │   │   │   ├── pricing-card.tsx
│   │   │   │   ├── subscription-status.tsx
│   │   │   │   ├── checkout-button.tsx
│   │   │   │   └── cancel-subscription-dialog.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-subscription.ts
│   │   │   │   └── use-checkout.ts
│   │   │   ├── api/
│   │   │   │   └── subscription-api.ts
│   │   │   ├── schemas/
│   │   │   │   └── subscription.schema.ts
│   │   │   └── types/
│   │   │       └── subscription.types.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── dashboard-shell.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── stats-cards.tsx
│   │   │   │   └── recent-activity.tsx
│   │   │   └── hooks/
│   │   │       └── use-dashboard.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   │   ├── profile-form.tsx
│   │   │   │   └── avatar-upload.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-profile.ts
│   │   │   └── api/
│   │   │       └── profile-api.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── components/
│   │   │   │   └── payment-history-table.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-payments.ts
│   │   │   └── api/
│   │   │       └── payments-api.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── admin-shell.tsx
│   │   │   │   ├── metrics-overview.tsx
│   │   │   │   ├── users-table.tsx
│   │   │   │   ├── user-detail-card.tsx
│   │   │   │   ├── subscriptions-table.tsx
│   │   │   │   ├── payments-table.tsx
│   │   │   │   └── activity-logs-table.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-admin-metrics.ts
│   │   │   │   ├── use-admin-users.ts
│   │   │   │   └── use-activity-logs.ts
│   │   │   └── api/
│   │   │       └── admin-api.ts
│   │   │
│   │   ├── contests/                   # Phase 2
│   │   ├── leaderboards/               # Phase 2
│   │   ├── jobs/                       # Phase 3
│   │   ├── referrals/                  # Phase 3
│   │   ├── services/                   # Phase 4
│   │   └── notifications/              # Phase 2
│   │
│   ├── shared/                           # Shared across features
│   │   ├── components/
│   │   │   ├── ui/                       # Shadcn UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── navbar.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   └── mobile-nav.tsx
│   │   │   ├── feedback/
│   │   │   │   ├── loading-spinner.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── error-state.tsx
│   │   │   │   └── page-skeleton.tsx
│   │   │   ├── data-display/
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   └── status-badge.tsx
│   │   │   └── forms/
│   │   │       ├── form-field.tsx
│   │   │       └── password-input.tsx
│   │   ├── hooks/
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-media-query.ts
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   ├── query-client.ts
│   │   │   ├── utils.ts                  # cn() helper
│   │   │   └── constants.ts
│   │   ├── providers/
│   │   │   ├── query-provider.tsx
│   │   │   ├── auth-provider.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── stores/
│   │   │   ├── ui-store.ts
│   │   │   └── auth-store.ts
│   │   └── types/
│   │       ├── api.types.ts
│   │       └── common.types.ts
│   │
│   └── middleware.ts                     # Auth route protection
│
├── public/
│   ├── logo.svg
│   ├── og-image.png
│   └── favicon.ico
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json                       # Shadcn config
├── package.json
└── tsconfig.json
```

---

## 3. Route Structure

### 3.1 Route Groups

| Group | Path Prefix | Auth | Description |
|-------|------------|------|-------------|
| `(marketing)` | `/` | Public | Landing, pricing |
| `(auth)` | `/login`, `/register` | Public | Authentication |
| `(dashboard)` | `/dashboard`, `/settings` | User | Authenticated user area |
| `(admin)` | `/admin` | Admin | Admin panel |

### 3.2 Phase 1 Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing homepage |
| `/pricing` | Pricing | Membership plan details |
| `/login` | Login | Email + Google login |
| `/register` | Register | Email registration |
| `/forgot-password` | Forgot Password | Password reset request |
| `/reset-password` | Reset Password | Set new password |
| `/callback/google` | Google Callback | OAuth redirect handler |
| `/dashboard` | Dashboard | User home |
| `/settings` | Settings | Profile management |
| `/subscription` | Subscription | Manage membership |
| `/payments` | Payments | Payment history |
| `/admin` | Admin Overview | Platform metrics |
| `/admin/users` | Users | User management |
| `/admin/users/[id]` | User Detail | Single user view |
| `/admin/subscriptions` | Subscriptions | All subscriptions |
| `/admin/payments` | Payments | All payments |
| `/admin/activity-logs` | Activity Logs | Audit trail |

### 3.3 Middleware Protection

```typescript
// middleware.ts
const publicRoutes = ['/', '/login', '/register', '/pricing', '/forgot-password'];
const authRoutes = ['/login', '/register', '/forgot-password'];
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (token && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard routes
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin routes checked in layout (role verification via API)
  return NextResponse.next();
}
```

---

## 4. Feature Module Pattern

Each feature is self-contained:

```
features/subscription/
├── components/     # UI components specific to this feature
├── hooks/          # React Query hooks + custom hooks
├── api/            # API functions (calls to backend)
├── schemas/        # Zod validation schemas
└── types/          # TypeScript interfaces
```

### 4.1 Feature Module Example: Subscription

**types/subscription.types.ts**
```typescript
export interface Subscription {
  id: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
}

export interface CheckoutResponse {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
}
```

**schemas/subscription.schema.ts**
```typescript
import { z } from 'zod';

export const verifySubscriptionSchema = z.object({
  razorpayPaymentId: z.string().min(1),
  razorpaySubscriptionId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
```

**api/subscription-api.ts**
```typescript
import { apiClient } from '@/shared/lib/api-client';
import type { Subscription, CheckoutResponse } from '../types/subscription.types';

export const subscriptionApi = {
  getMySubscription: () =>
    apiClient.get<Subscription | null>('/subscriptions/me'),

  create: (planId: string) =>
    apiClient.post<CheckoutResponse>('/subscriptions', { planId }),

  verify: (data: VerifySubscriptionInput) =>
    apiClient.post<{ subscription: Subscription }>('/subscriptions/verify', data),

  cancel: () =>
    apiClient.post<{ subscription: Subscription }>('/subscriptions/cancel'),
};
```

**hooks/use-subscription.ts**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscription-api';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: subscriptionApi.getMySubscription,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
```

**components/subscription-status.tsx**
```typescript
'use client';

import { useSubscription } from '../hooks/use-subscription';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { Badge } from '@/shared/components/ui/badge';

export function SubscriptionStatus() {
  const { data, isLoading, error } = useSubscription();

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (error) return <ErrorState message="Failed to load subscription" />;
  if (!data) return <EmptyState title="No active subscription" actionLabel="Subscribe" actionHref="/subscription" />;

  return (
    <div>
      <Badge variant={data.status === 'ACTIVE' ? 'default' : 'secondary'}>
        {data.status}
      </Badge>
      <p>Renews on {new Date(data.currentPeriodEnd).toLocaleDateString()}</p>
    </div>
  );
}
```

---

## 5. State Management

### 5.1 Server State — React Query

All API data managed via React Query:

| Query Key Pattern | Data | Stale Time |
|-------------------|------|------------|
| `['auth', 'me']` | Current user | 5 min |
| `['subscription', 'me']` | User subscription | 5 min |
| `['payments', 'me']` | Payment history | 2 min |
| `['admin', 'metrics']` | Admin dashboard | 1 min |
| `['admin', 'users', params]` | User list | 30 sec |
| `['contests', params]` | Contest list | 1 min |

**Query Client Configuration:**

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
    mutations: {
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    },
  },
});
```

### 5.2 Client State — Zustand

Only for UI state that doesn't belong on the server:

**stores/ui-store.ts**
```typescript
interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));
```

**stores/auth-store.ts**
```typescript
interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}
```

Used for access token in memory; refresh token in httpOnly cookie.

---

## 6. API Layer

### 6.1 API Client

```typescript
// shared/lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // for refresh token cookie
    });

    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request(method, path, body);
      }
      // Redirect to login
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    if (!data.success) {
      throw new ApiError(data.error);
    }

    return data.data;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) return false;
      const data = await response.json();
      this.setAccessToken(data.data.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(path: string) { return this.request<T>('GET', path); }
  post<T>(path: string, body?: unknown) { return this.request<T>('POST', path, body); }
  patch<T>(path: string, body?: unknown) { return this.request<T>('PATCH', path, body); }
  delete<T>(path: string) { return this.request<T>('DELETE', path); }
}

export const apiClient = new ApiClient();
```

### 6.2 Error Handling

```typescript
export class ApiError extends Error {
  constructor(public error: { code: string; message: string; details?: unknown[] }) {
    super(error.message);
    this.name = 'ApiError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
```

---

## 7. Shared Components

### 7.1 UI Components (Shadcn)

Installed via `npx shadcn@latest add <component>`:

- Button, Input, Card, Dialog, Table
- Skeleton, Toast, Badge, Avatar
- Dropdown Menu, Sheet, Tabs
- Form (with React Hook Form integration)

### 7.2 Feedback Components

**EmptyState** — Used when no data exists:
```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}
```

**ErrorState** — Used on fetch failures:
```typescript
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}
```

**PageSkeleton** — Full page loading state with skeleton placeholders.

### 7.3 Data Display

**DataTable** — Reusable table with sorting, pagination:
```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}
```

---

## 8. Form Handling

### 8.1 Pattern

React Hook Form + Zod resolver:

```typescript
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});

const loginMutation = useLogin();

function onSubmit(data: LoginInput) {
  loginMutation.mutate(data);
}

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField name="email" ... />
      <FormField name="password" ... />
      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  </Form>
);
```

---

## 9. Layouts

### 9.1 Root Layout

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 9.2 Dashboard Layout

```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

### 9.3 Admin Layout

Same shell as dashboard with admin-specific sidebar navigation and role check:

```typescript
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuth();

  if (isLoading) return <PageSkeleton />;
  if (user?.role !== 'ADMIN') return <ErrorState message="Access denied" />;

  return <AdminShell>{children}</AdminShell>;
}
```

---

## 10. Landing Page Structure

```
Landing Page (/)
├── Navbar (logo, nav links, login/signup CTA)
├── Hero Section
│   ├── Headline: "Learn. Compete. Grow."
│   ├── Subheadline: Platform description
│   └── CTA: "Get Started" → /register
├── Features Section (8 feature cards)
│   ├── DSA Contests
│   ├── CP Contests
│   ├── System Design
│   ├── Tech Quizzes
│   ├── Jobs Board
│   ├── Referrals
│   ├── Leaderboards
│   └── Premium Services
├── Pricing Section
│   └── ₹49/month membership card
├── Social Proof (testimonials — placeholder)
├── CTA Section
└── Footer (links, social, legal)
```

---

## 11. Responsive Design

### 11.1 Breakpoints (Tailwind)

| Breakpoint | Width | Usage |
|------------|-------|-------|
| default | 0px+ | Mobile first |
| `sm` | 640px+ | Large phones |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Desktop |
| `xl` | 1280px+ | Wide desktop |

### 11.2 Mobile Patterns

- Sidebar collapses to hamburger menu on `< lg`.
- Tables become card lists on mobile.
- Forms stack vertically.
- Touch targets minimum 44×44px.

---

## 12. Authentication Flow (Frontend)

```
┌──────────┐   Click "Sign in    ┌──────────┐
│  Login   │   with Google"     │  Google  │
│  Page    │ ─────────────────▶ │  OAuth   │
│          │                    └────┬─────┘
│          │                         │
│          │   Redirect to           │
│          │   /callback/google      │
│          │ ◀───────────────────────┘
│          │
│          │   POST /auth/google     ┌──────────┐
│          │ ─────────────────────▶ │ Backend  │
│          │                         └────┬─────┘
│          │   accessToken + cookie       │
│          │ ◀───────────────────────────┘
│          │
│          │   Redirect to /dashboard
└──────────┘
```

---

## 13. Razorpay Checkout Integration

```typescript
// features/subscription/hooks/use-checkout.ts
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscriptionApi.create(planId),
    onSuccess: (data) => {
      const options = {
        key: data.razorpayKeyId,
        subscription_id: data.razorpaySubscriptionId,
        name: 'Codentra',
        description: 'Monthly Membership',
        handler: async (response: RazorpayResponse) => {
          await subscriptionApi.verify({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySubscriptionId: response.razorpay_subscription_id,
            razorpaySignature: response.razorpay_signature,
          });
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
          toast.success('Subscription activated!');
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
  });
}
```

Load Razorpay script in subscription page:
```typescript
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

---

## 14. Testing Strategy

| Type | Tool | Scope |
|------|------|-------|
| Unit | Vitest | Hooks, utils, schemas |
| Component | Vitest + Testing Library | Feature components |
| E2E | Playwright | Auth, subscription, dashboard flows |

### 14.1 E2E Test Scenarios (Phase 1)

1. Landing page renders all sections
2. User can register with email
3. User can login with email
4. User can subscribe via Razorpay (sandbox)
5. User can view dashboard
6. Admin can view metrics and users

---

## 15. Environment Variables

```bash
# .env.example
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 16. Performance Optimizations

- **Server Components** for static content (landing page sections).
- **Dynamic imports** for heavy components (admin charts, Razorpay).
- **Image optimization** via `next/image` + Cloudinary.
- **Font optimization** via `next/font`.
- **React Query caching** to minimize API calls.
- **Route prefetching** via `<Link>` for dashboard navigation.

---

## 17. SEO & Metadata

```typescript
// app/page.tsx
export const metadata: Metadata = {
  title: 'Codentra — Learn. Compete. Grow.',
  description: 'Platform for developers to participate in DSA contests, competitive programming, system design challenges, and advance their careers.',
  openGraph: {
    title: 'Codentra — Learn. Compete. Grow.',
    description: '...',
    images: ['/og-image.png'],
  },
};
```

---

## 18. Deployment (Vercel)

- Connect GitHub repo to Vercel.
- Set environment variables in Vercel dashboard.
- Preview deployments on PRs.
- Production deployment on merge to `main`.

---

## 19. Component Decision Tree

```
Need interactivity (onClick, useState, useEffect)?
├── YES → 'use client' component
└── NO  → Server Component (default)

Fetching data?
├── On page load → Server Component with fetch OR React Query in client
├── On user action → React Query mutation
└── Real-time updates → React Query with refetchInterval (Phase 2+)

Shared across features?
├── YES → shared/components/
└── NO  → features/<feature>/components/
```

---

## 20. Accessibility

- All interactive elements keyboard accessible.
- Form fields have associated labels.
- Error messages linked via `aria-describedby`.
- Color contrast meets WCAG AA.
- Focus indicators visible.
- Shadcn/Radix components provide ARIA attributes by default.
