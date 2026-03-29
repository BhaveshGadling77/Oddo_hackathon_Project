# Oddo Hackathon 

##Backend
src/
├── config/
│   ├── db.js               # MySQL connection pool (mysql2/promise)
│   ├── passport.js         # Google OAuth strategy
│   └── env.js              # Validated env vars
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── expense.controller.js
│   ├── approval.controller.js
│   └── workflow.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── expense.routes.js
│   ├── approval.routes.js
│   └── workflow.routes.js
├── services/
│   ├── auth.service.js
│   ├── expense.service.js
│   ├── approval.service.js      # Core engine
│   ├── ocr.service.js
│   ├── currency.service.js
│   └── notification.service.js
├── models/
│   ├── user.model.js
│   ├── expense.model.js
│   ├── approval.model.js
│   └── company.model.js
├── middlewares/
│   ├── auth.middleware.js        # JWT verify
│   ├── role.middleware.js        # RBAC guard
│   ├── upload.middleware.js      # multer
│   └── error.middleware.js
└── utils/
    ├── jwt.util.js
    ├── response.util.js
    └── logger.js



## Fronted
components/
│   ├── ui/              # Button, Input, Badge, Modal
│   ├── layout/          # Sidebar, Navbar, PageWrapper
│   ├── expense/         # ExpenseCard, StatusBadge, ReceiptUploader
│   └── approval/        # ApprovalTimeline, RuleBuilder
pages/
│   ├── auth/            # Login.jsx, Signup.jsx
│   ├── admin/           # Dashboard, Users, WorkflowBuilder, Rules
│   ├── employee/        # SubmitExpense, ExpenseHistory
│   └── manager/         # PendingApprovals, TeamExpenses
services/
│   ├── api.js           # Axios instance with interceptors
│   ├── auth.service.js
│   ├── expense.service.js
│   └── approval.service.js
hooks/
│   ├── useAuth.js
│   ├── useExpenses.js
│   └── useApprovals.js
context/
│   └── AuthContext.jsx
utils/
│   ├── formatCurrency.js
│   └── roleGuard.js

## Rest API
# Auth
POST   /api/auth/signup          → create company + admin user + set currency
POST   /api/auth/login           → email/password → JWT
POST   /api/auth/google          → Google id_token → JWT
GET    /api/auth/me              → current user profile

# Users (admin only for POST/PUT)
POST   /api/users                → create employee/manager
GET    /api/users                → list company users
PUT    /api/users/:id            → update role, manager assignment

# Expenses
POST   /api/expenses             → submit (triggers approval engine)
GET    /api/expenses             → list (filtered by role)
GET    /api/expenses/:id         → detail + approval timeline
PUT    /api/expenses/:id         → edit draft only

# Approvals
GET    /api/approvals/pending    → my pending actions
POST   /api/approvals/:id/approve
POST   /api/approvals/:id/reject

# Workflows (admin)
POST   /api/approval-flows       → create flow with steps + rules
GET    /api/approval-flows       → list flows
PUT    /api/approval-flows/:id   → update

# ExpenseFlow — Expense Reimbursement Management System

Part 1 of a production-level React frontend.

## Tech Stack

| Layer        | Technology                  |
|--------------|-----------------------------|
| Framework    | React 18 + Vite 5           |
| Styling      | Tailwind CSS v3             |
| Routing      | React Router v6             |
| HTTP client  | Axios (with interceptors)   |
| Forms        | React Hook Form             |
| State        | Context API + useReducer    |

## Project Structure

```
src/
├── components/
│   ├── forms/          # GoogleSignInButton, shared form components
│   ├── guards/         # ProtectedRoute, AdminRoute, ManagerRoute, EmployeeRoute
│   └── ui/             # Logo, Spinner, icons, LoadingScreen
├── context/
│   └── AuthContext.jsx # Auth state + actions (login, signup, googleLogin, logout)
├── hooks/
│   └── useCountries.js # Restcountries API hook
├── layouts/
│   ├── AuthLayout.jsx       # Shared auth page wrapper
│   └── DashboardLayout.jsx  # Sidebar + topbar shell
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   ├── dashboard/
│   │   └── DashboardHome.jsx
│   ├── NotFound.jsx
│   └── Unauthorized.jsx
├── services/
│   ├── api.js          # Axios instance + interceptors
│   └── authService.js  # Auth API calls
└── utils/
    └── validation.js   # RHF rules + password strength
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit environment variables
cp .env.example .env

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable              | Description                             |
|-----------------------|-----------------------------------------|
| `VITE_API_URL`        | Backend base URL (default: localhost:5000/api) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (leave blank for demo mode) |

## Auth Context API

```jsx
const {
  user, token, role,
  isAuthenticated, isLoading, error,
  isAdmin, isManager, isEmployee,
  login, signup, googleLogin, logout,
  clearError, updateUser, hasRole,
} = useAuth()
```

## Role Hierarchy

```
admin    →  full access (all routes)
manager  →  approvals, reports, team + employee routes
employee →  expenses, profile
```

## Route Guards

```jsx
<ProtectedRoute />   // Any authenticated user
<AdminRoute />       // admin only
<ManagerRoute />     // manager + admin
<EmployeeRoute />    // any authenticated role
```

## Countries API

The Signup page fetches countries from:
```
https://restcountries.com/v3.1/all?fields=name,currencies,cca2
```
A fallback list is shown if the API is unreachable.

## What's Next (Part 2)

- Expense submission form with receipt upload
- Manager approval workflow
- Admin user management
- Reports & analytics with charts
- Notification system
- Profile & settings pages
update
