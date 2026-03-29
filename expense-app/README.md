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
