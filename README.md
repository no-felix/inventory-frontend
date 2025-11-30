<div align="center">

# 📦 Inventory Frontend

[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**A modern, responsive inventory management dashboard built with React 19 and TypeScript**

[Features](#-features) •
[Architecture](#-architecture) •
[Getting Started](#-getting-started) •
[Development](#-development) •
[Project Structure](#-project-structure)

</div>

---

## ✨ Features

- 🚀 **React 19** — Latest React with concurrent features and improved performance
- 📡 **API-First Development** — TypeScript client auto-generated from OpenAPI spec
- 🎨 **Modern UI** — Built with shadcn/ui (New York style) + Radix primitives
- 🔄 **Smart Data Fetching** — TanStack Query for caching, background updates, optimistic UI
- 📊 **Interactive Analytics** — Charts and metrics dashboards with Recharts
- 🔐 **JWT Authentication** — Secure login with automatic token refresh
- 🌙 **Dark Mode** — System-aware theme switching
- 📱 **Responsive Design** — Mobile-first approach with collapsible sidebar

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │   Pages          │  │   Components     │  │   Layout     │   │
│  │   (Routes)       │  │   (UI + Domain)  │  │   (Shell)    │   │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────────┘   │
│           │                     │                               │
├───────────┼─────────────────────┼───────────────────────────────┤
│           ▼                     ▼         State & Data Layer    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  React Query Hooks (useProducts, usePurchaseOrders...)  │    │
│  │  Auth Context (JWT tokens, user state)                  │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                     │
├───────────────────────────┼─────────────────────────────────────┤
│                           ▼              API Layer              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Generated API Client (@hey-api/openapi-ts)             │    │
│  │  • Types (types.gen.ts)  • SDK (sdk.gen.ts)             │    │
│  │  • Axios client with interceptors                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Inventory Backend   │
                    │   (REST API + JWT)    │
                    └───────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 10+** or pnpm/yarn
- **Backend API** — [inventory-backend](https://github.com/no-felix/inventory-backend) running on port 8080

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/no-felix/inventory-frontend.git
cd inventory-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:5173 in your browser
```

> **Note:** Make sure the backend is running at `http://localhost:8080` or set `VITE_API_BASE_URL` environment variable.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file for local overrides:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |

```bash
# Example .env.local
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # TypeScript check + production build
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run generate-api # Regenerate API client from OpenAPI spec
```

### Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) with the **New York** style:

```bash
# Add a new component
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form

# Components are added to src/components/ui/
```

### API Client Generation

The API client is auto-generated from the OpenAPI specification:

```bash
# After updating src/api/inventory-backend-api.yaml
npm run generate-api

# Generated files in src/api/generated/:
# - types.gen.ts    → Request/response types
# - sdk.gen.ts      → API functions
# - client.gen.ts   → Configured Axios client
```

> ⚠️ **Never manually edit files in `src/api/generated/`** — they will be overwritten!

---

## 📁 Project Structure

```
src/
├── api/                      # API layer
│   ├── client.ts             # Auth interceptors, token storage, error helpers
│   ├── inventory-backend-api.yaml  # OpenAPI specification
│   └── generated/            # Auto-generated (DO NOT EDIT)
│       ├── types.gen.ts      # TypeScript types
│       ├── sdk.gen.ts        # API functions
│       └── client.gen.ts     # Axios client
│
├── components/               # Reusable components
│   ├── ui/                   # shadcn/ui primitives
│   ├── data-table/           # Generic data table with pagination
│   ├── layout/               # App shell (sidebar, header)
│   └── auth/                 # Protected route wrapper
│
├── context/                  # React contexts
│   ├── auth-context.tsx      # JWT auth state & methods
│   └── theme-context.tsx     # Dark/light mode
│
├── hooks/                    # React Query hooks
│   ├── use-products.ts       # Product CRUD operations
│   ├── use-purchase-orders.ts
│   ├── use-stock-movements.ts
│   └── use-metrics.ts        # Analytics data
│
├── pages/                    # Route components
│   ├── dashboard/            # Home dashboard
│   ├── products/             # Product management
│   │   ├── index.tsx         # List page
│   │   ├── detail.tsx        # Detail view
│   │   ├── create.tsx        # Create form
│   │   ├── columns.tsx       # Table column definitions
│   │   └── product-form.tsx  # Reusable form component
│   ├── purchase-orders/      # PO management
│   ├── stock-movements/      # Movement history
│   ├── analytics/            # Charts & reports
│   └── auth/                 # Login & register
│
├── lib/                      # Utilities
│   └── utils.ts              # cn() helper for Tailwind
│
└── App.tsx                   # Root component with routing
```

### Key Patterns

#### React Query Hooks

All data fetching uses TanStack Query with query key factories:

```typescript
// src/hooks/use-products.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?) => [...productKeys.lists(), params] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
};

export function useProducts(params?) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await listProducts({ query: params });
      if (response.error) throw response.error;
      return response.data;
    },
  });
}
```

#### Form Validation

Forms use Zod schemas with react-hook-form:

```typescript
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  unitPrice: z.number().min(0, 'Price must be positive'),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', unitPrice: 0 },
});
```

#### Error Handling

API errors follow RFC 7807 ProblemDetail format:

```typescript
import { getErrorMessage } from '@/api/client';
import { toast } from 'sonner';

try {
  await createProduct(data);
  toast.success('Product created!');
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

---

## 🔐 Authentication Flow

1. **Login** → Receive access + refresh tokens
2. **Storage** → Tokens saved to localStorage
3. **Requests** → Access token added via Axios interceptor
4. **401 Response** → Automatic token refresh
5. **Refresh Failure** → Redirect to login

User info (username, role) is decoded from the JWT payload — no `/me` endpoint needed.

---

## 📊 Features Overview

| Module | Features |
|--------|----------|
| **Dashboard** | Summary cards, quick stats |
| **Products** | CRUD, search, pagination, stock adjustments |
| **Purchase Orders** | Create orders, receive inventory, status tracking |
| **Stock Movements** | Movement history, filtering by reason/date |
| **Analytics** | Stock levels, low stock alerts, slow-moving items, valuation |
| **Settings** | Theme toggle, user preferences |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="100">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="48" height="48" alt="React" />
<br>React 19
</td>
<td align="center" width="100">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
<br>TypeScript
</td>
<td align="center" width="100">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" width="48" height="48" alt="Vite" />
<br>Vite 7
</td>
<td align="center" width="100">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" alt="Tailwind" />
<br>Tailwind 4
</td>
</tr>
</table>

| Category | Technologies |
|----------|-------------|
| **Framework** | React 19, React Router 7, TanStack Query 5, TanStack Table 8 |
| **Styling** | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide Icons |
| **Forms** | React Hook Form 7, Zod 4, @hookform/resolvers |
| **API** | @hey-api/openapi-ts, Axios |
| **Charts** | Recharts 3 |
| **Build** | Vite 7, TypeScript 5.9, ESLint 9 |

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [no-felix](https://github.com/no-felix)

</div>
