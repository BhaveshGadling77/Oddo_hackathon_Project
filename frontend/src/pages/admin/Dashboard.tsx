import React from "react";
import { useGetExpenseStats, useGetExpenses } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExpenseCard } from "@/components/expense/ExpenseCard";
import { DollarSign, FileText, CheckCircle2, Clock, Activity } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetExpenseStats({
    request: { headers: getAuthHeaders() }
  });

  const { data: recentExp, isLoading: recentLoading } = useGetExpenses(
    { limit: 5 },
    { request: { headers: getAuthHeaders() } }
  );

  if (statsLoading || recentLoading) {
    return <div className="flex items-center justify-center h-64"><Activity className="animate-spin text-primary w-8 h-8" /></div>;
  }

  const chartData = stats?.byCategory?.map(c => ({
    name: c.category,
    value: c.amount,
    count: c.count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Processed</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">${stats?.totalAmount?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.totalSubmitted || 0} total expenses</p>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-amber-400 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">${stats?.pendingAmount?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.totalPending || 0} waiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Amount</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">${stats?.approvedAmount?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.totalApproved || 0} approved expenses</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-slate-300 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejection Rate</CardTitle>
            <FileText className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">
              {stats?.totalSubmitted ? Math.round((stats.totalRejected / stats.totalSubmitted) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.totalRejected || 0} rejected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
            <CardDescription>Total amount processed across all departments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg">Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pb-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold">Recent Activity</h3>
        <div className="grid grid-cols-1 gap-3">
          {recentExp?.data?.map(expense => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
          {(!recentExp?.data || recentExp.data.length === 0) && (
            <div className="text-center py-10 bg-card rounded-xl border text-muted-foreground">
              No recent expenses found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
