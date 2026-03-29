# Expense Management System

A full-stack expense management application with role-based access control for employees, managers, and admins. Built with React + Vite (frontend) and Express + MongoDB (backend).

---

## Features

- **Authentication** — JWT-based login and registration
- **Role-based access** — Admin, Manager, Employee dashboards
- **Expense submission** — Create, edit, delete expenses with receipt URL
- **Approval workflow** — Managers approve/reject with comments; approval timeline tracking
- **Admin controls** — User management, workflow builder, approval rules
- **Dashboard stats** — Charts by category, totals, and status breakdown

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, Vite, TypeScript, Tailwind CSS, TanStack Query |
| Backend   | Express 5, TypeScript, Node.js 18+      |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |

---

## Project Structure

```
expense-management/
├── backend/                        # Express API server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts               # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.ts             # User schema (admin/manager/employee)
│   │   │   ├── Expense.ts          # Expense schema
│   │   │   ├── Approval.ts         # Approval schema
│   │   │   └── Workflow.ts         # Workflow + rules + steps schema
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts  # JWT authentication + role guards
│   │   ├── routes/
│   │   │   ├── index.ts            # Route aggregator
│   │   │   ├── auth.routes.ts      # POST /login, /register, /logout, GET /me
│   │   │   ├── user.routes.ts      # CRUD /users (admin only)
│   │   │   ├── expense.routes.ts   # CRUD /expenses + /stats
│   │   │   ├── approval.routes.ts  # GET /approvals, POST /:id/approve|reject
│   │   │   └── workflow.routes.ts  # CRUD /approval-flows
│   │   ├── seed.ts                 # Database seeder with test accounts
│   │   ├── app.ts                  # Express app setup (CORS, middleware)
│   │   └── index.ts                # Server entry point
│   ├── .env.example                # Environment variable template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn UI components (Button, Input, Badge …)
│   │   │   ├── layout/             # AppLayout, Sidebar, Navbar
│   │   │   ├── expense/            # ExpenseCard, StatusBadge
│   │   │   └── approval/           # ApprovalTimeline
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Auth state + JWT storage
│   │   ├── lib/
│   │   │   └── auth.ts             # Token helpers
│   │   ├── pages/
│   │   │   ├── auth/               # Login.tsx, Signup.tsx
│   │   │   ├── admin/              # Dashboard.tsx, Users.tsx, Workflows.tsx, WorkflowBuilder.tsx
│   │   │   ├── manager/            # PendingApprovals.tsx, TeamExpenses.tsx
│   │   │   └── employee/           # SubmitExpense.tsx, ExpenseHistory.tsx
│   │   ├── App.tsx                 # Router + role-based route guards
│   │   ├── index.css               # Tailwind + theme tokens
│   │   └── main.tsx
│   ├── public/
│   │   └── images/
│   │       └── auth-bg.png
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

---

## Prerequisites

Make sure the following are installed on your machine:

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) account

---

## Getting Started

### 1. Extract the zip

```bash
unzip expense-management-mongodb.zip -d expense-management
cd expense-management
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
MONGODB_URI=mongodb://localhost:27017/expense_db
SESSION_SECRET=replace_with_a_long_random_string
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Using MongoDB Atlas?** Replace `MONGODB_URI` with your Atlas connection string:
> ```
> MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense_db
> ```

Seed the database with demo data:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
pnpm install
pnpm run dev
```

The app will be available at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint                          | Access          | Description                |
|--------|-----------------------------------|-----------------|----------------------------|
| POST   | `/api/auth/login`                 | Public          | Login and receive JWT       |
| POST   | `/api/auth/register`              | Public          | Register a new user         |
| GET    | `/api/auth/me`                    | Authenticated   | Get current user            |
| POST   | `/api/auth/logout`                | Authenticated   | Logout                      |
| GET    | `/api/users`                      | Admin           | List all users              |
| PUT    | `/api/users/:id`                  | Admin           | Update user                 |
| DELETE | `/api/users/:id`                  | Admin           | Deactivate user             |
| GET    | `/api/expenses`                   | Authenticated   | List expenses (role-scoped) |
| POST   | `/api/expenses`                   | Employee+       | Submit new expense          |
| GET    | `/api/expenses/stats`             | Authenticated   | Expense statistics          |
| PUT    | `/api/expenses/:id`               | Owner / Admin   | Update expense              |
| DELETE | `/api/expenses/:id`               | Owner / Admin   | Delete expense              |
| GET    | `/api/approvals`                  | Manager / Admin | List pending approvals      |
| POST   | `/api/approvals/:id/approve`      | Manager / Admin | Approve an expense          |
| POST   | `/api/approvals/:id/reject`       | Manager / Admin | Reject an expense           |
| GET    | `/api/approval-flows`             | Authenticated   | List workflows              |
| POST   | `/api/approval-flows`             | Admin           | Create workflow             |
| PUT    | `/api/approval-flows/:id`         | Admin           | Update workflow             |
| DELETE | `/api/approval-flows/:id`         | Admin           | Delete workflow             |

---

## Test Accounts (after seeding)

| Role     | Email                   | Password      |
|----------|-------------------------|---------------|
| Admin    | admin@company.com       | admin123      |
| Manager  | manager@company.com     | manager123    |
| Employee | employee@company.com    | employee123   |
| Employee | jane@company.com        | employee123   |

---

## Role Permissions

| Feature                  | Employee | Manager | Admin |
|--------------------------|----------|---------|-------|
| Submit expense           | ✅       | ✅      | ✅    |
| View own expenses        | ✅       | ✅      | ✅    |
| View team expenses       | ❌       | ✅      | ✅    |
| Approve / reject         | ❌       | ✅      | ✅    |
| View all users           | ❌       | ❌      | ✅    |
| Manage users             | ❌       | ❌      | ✅    |
| Manage workflows         | ❌       | ❌      | ✅    |
| View admin dashboard     | ❌       | ❌      | ✅    |

---

## Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
pnpm run build
# Serve the dist/ folder with any static server e.g. nginx or serve
npx serve dist
```
