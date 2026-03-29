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

