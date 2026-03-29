require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const { testConnection }  = require('./src/config/db');
const passport            = require('./src/config/passport');
const logger              = require('./src/utils/logger');
const { errorHandler, notFoundHandler } = require('./src/middlewares/error.middleware');

const authRoutes     = require('./src/routes/auth.routes');
const userRoutes     = require('./src/routes/user.routes');
const expenseRoutes  = require('./src/routes/expense.routes');
const approvalRoutes = require('./src/routes/approval.routes');
const workflowRoutes = require('./src/routes/workflow.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({

  origin: '*',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// ─── Rate limiting ──────────────────────────────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Too many auth attempts, try again later' },
}));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
}));

// ─── Parsers ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Passport ────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ─── Static uploads (fallback if not using Cloudinary) ──────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/expenses',       expenseRoutes);
app.use('/api/approvals',      approvalRoutes);
app.use('/api/approval-flows', workflowRoutes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── 404 + Error ─────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
async function start() {
  await testConnection();
  app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));
}

start();

module.exports = app;