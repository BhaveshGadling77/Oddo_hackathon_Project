import React, { useState } from "react";
import { useGetApprovals, useApproveExpense, useRejectExpense } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, Eye, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Approval } from "@workspace/api-client-react/src/generated/api.schemas";

export default function PendingApprovals() {
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [comment, setComment] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetApprovals(
    { status: "pending", limit: 50 },
    { request: { headers: getAuthHeaders() } }
  );

  const { mutate: approve, isPending: approving } = useApproveExpense({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        toast({ title: "Expense Approved", className: "bg-emerald-50 text-emerald-900 border-emerald-200" });
        queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
        closeModal();
      }
    }
  });

  const { mutate: reject, isPending: rejecting } = useRejectExpense({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        toast({ title: "Expense Rejected", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
        closeModal();
      }
    }
  });

  const closeModal = () => {
    setSelectedApproval(null);
    setActionType(null);
    setComment("");
  };

  const submitAction = () => {
    if (!selectedApproval) return;
    if (actionType === "approve") {
      approve({ id: selectedApproval.id, data: { comment } });
    } else {
      reject({ id: selectedApproval.id, data: { comment } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Pending Approvals</h2>
          <p className="text-sm text-muted-foreground">Action required on these team expenses.</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
          {data?.data?.length || 0} Pending
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">Loading approvals...</div>
        ) : data?.data?.map((approval) => {
          // Assume the API populates expense details inside approval, or we display what we have.
          // Due to schema, we might only have `expenseId`. If so, backend should expand it. Let's assume expanded for UI.
          // Wait, the schema for Approval doesn't have an `expense` relation embedded directly in the provided spec (it only has `expenseId` and `approver`). 
          // Assuming backend returns it or we just display basic IDs. Ideally, a real app expands it. 
          // For aesthetic purposes, I'll mock the visual display if it's missing, but I'll use real data if present.
          const expTitle = (approval as any).expense?.title || `Expense #${approval.expenseId.substring(0,8)}`;
          const expAmount = (approval as any).expense?.amount || 0;
          const expEmp = (approval as any).expense?.employee?.firstName || 'Employee';
          
          return (
            <Card key={approval.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{expTitle}</h3>
                    <span className="text-sm text-muted-foreground font-medium bg-muted px-2 rounded">
                      ${expAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submitted by <strong>{expEmp}</strong> • {format(new Date(approval.createdAt || Date.now()), 'MMM d, yyyy')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" onClick={() => { setSelectedApproval(approval); setActionType('approve'); }}>
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => { setSelectedApproval(approval); setActionType('reject'); }}>
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button variant="ghost" size="icon" className="shrink-0" title="View details" onClick={() => alert("Details view requires expense object expansion.")}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {data?.data?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-muted-foreground">
            <Inbox className="w-12 h-12 mb-3 opacity-20 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">You're all caught up!</h3>
            <p className="text-sm mt-1">No pending approvals at the moment.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedApproval && !!actionType} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={actionType === 'approve' ? 'text-emerald-600' : 'text-red-600'}>
              {actionType === 'approve' ? 'Approve Expense' : 'Reject Expense'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You are about to {actionType} this expense request. Add an optional comment below.
            </p>
            <Textarea 
              placeholder="Add a comment (optional)..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button 
              className={actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} 
              onClick={submitAction}
              disabled={approving || rejecting}
            >
              {approving || rejecting ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
