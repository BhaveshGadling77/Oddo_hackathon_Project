import React, { useState } from "react";
import { useGetExpenses, useGetExpenseById } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { ExpenseCard } from "@/components/expense/ExpenseCard";
import { ApprovalTimeline } from "@/components/approval/ApprovalTimeline";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Receipt } from "lucide-react";
import { format } from "date-fns";

export default function ExpenseHistory() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useGetExpenses(
    { employeeId: user?.id, status: statusFilter === "all" ? undefined : statusFilter as any },
    { request: { headers: getAuthHeaders() } }
  );

  const { data: detailData, isLoading: detailLoading } = useGetExpenseById(selectedId || '', {
    query: { enabled: !!selectedId },
    request: { headers: getAuthHeaders() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">My Expenses</h2>
          <p className="text-sm text-muted-foreground">Track your submitted reimbursement requests.</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card shadow-sm">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">Loading history...</div>
        ) : data?.data?.map(exp => (
          <ExpenseCard 
            key={exp.id} 
            expense={exp} 
            onClick={() => setSelectedId(exp.id)} 
          />
        ))}
        
        {data?.data?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-muted-foreground">
            <History className="w-12 h-12 mb-3 opacity-20" />
            <h3 className="font-semibold text-lg text-foreground">No expenses found</h3>
            <p className="text-sm mt-1">You haven't submitted any expenses matching this filter.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-2xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Expense Details</DialogTitle>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="py-10 text-center">Loading details...</div>
          ) : detailData ? (
            <div className="space-y-6 pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{detailData.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> {detailData.category}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-bold text-primary">
                    {detailData.currency === 'USD' ? '$' : detailData.currency}{detailData.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(detailData.submittedAt!), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>
              
              {detailData.description && (
                <div className="bg-muted/40 p-4 rounded-lg border text-sm text-foreground">
                  <strong className="block mb-1 text-xs uppercase tracking-wider text-muted-foreground">Purpose</strong>
                  {detailData.description}
                </div>
              )}

              {detailData.receiptUrl && (
                <a href={detailData.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-primary hover:underline font-medium">
                  View Attached Receipt ↗
                </a>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-display font-bold mb-6 text-lg">Approval Timeline</h4>
                <ApprovalTimeline approvals={detailData.approvals || []} />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
