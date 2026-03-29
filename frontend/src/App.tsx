import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminWorkflows from "@/pages/admin/Workflows";
import AdminWorkflowBuilder from "@/pages/admin/WorkflowBuilder";
import ManagerPending from "@/pages/manager/PendingApprovals";
import ManagerTeam from "@/pages/manager/TeamExpenses";
import EmployeeSubmit from "@/pages/employee/SubmitExpense";
import EmployeeHistory from "@/pages/employee/ExpenseHistory";

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-background"><div className="animate-pulse font-display font-semibold text-primary text-xl">Loading Expensify...</div></div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role doesn't match, send them to their home
    return <Redirect to={
      user.role === 'admin' ? '/admin/dashboard' : 
      user.role === 'manager' ? '/manager/approvals' : 
      '/employee/submit'
    } />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
};

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      {/* Root redirect based on auth */}
      <Route path="/">
        {isLoading ? null : user ? (
          <Redirect to={
            user.role === 'admin' ? '/admin/dashboard' : 
            user.role === 'manager' ? '/manager/approvals' : 
            '/employee/submit'
          } />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} allowedRoles={['admin']} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} allowedRoles={['admin']} />
      </Route>
      <Route path="/admin/workflows">
        <ProtectedRoute component={AdminWorkflows} allowedRoles={['admin']} />
      </Route>
      <Route path="/admin/workflow-builder">
        <ProtectedRoute component={AdminWorkflowBuilder} allowedRoles={['admin']} />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager/approvals">
        <ProtectedRoute component={ManagerPending} allowedRoles={['manager', 'admin']} />
      </Route>
      <Route path="/manager/team-expenses">
        <ProtectedRoute component={ManagerTeam} allowedRoles={['manager', 'admin']} />
      </Route>

      {/* Employee Routes */}
      <Route path="/employee/submit">
        <ProtectedRoute component={EmployeeSubmit} allowedRoles={['employee', 'manager', 'admin']} />
      </Route>
      <Route path="/employee/history">
        <ProtectedRoute component={EmployeeHistory} allowedRoles={['employee', 'manager', 'admin']} />
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
