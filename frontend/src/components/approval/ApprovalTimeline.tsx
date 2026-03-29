import React from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import type { Approval } from "@workspace/api-client-react/src/generated/api.schemas";

interface ApprovalTimelineProps {
  approvals: Approval[];
}

export function ApprovalTimeline({ approvals }: ApprovalTimelineProps) {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
        <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm">No approval workflow generated for this expense.</p>
      </div>
    );
  }

  // Sort approvals by ID or order assuming they are returned in sequence
  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {approvals.map((approval, index) => {
        const isApproved = approval.status === 'approved';
        const isRejected = approval.status === 'rejected';
        const isPending = approval.status === 'pending';

        return (
          <div key={approval.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
              isApproved ? 'bg-emerald-500 text-white' : 
              isRejected ? 'bg-red-500 text-white' : 
              'bg-amber-400 text-white'
            }`}>
              {isApproved ? <CheckCircle2 className="w-5 h-5" /> : 
               isRejected ? <XCircle className="w-5 h-5" /> : 
               <Clock className="w-5 h-5" />}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded-xl border shadow-sm group-hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground capitalize">
                  {approval.approver?.role || 'Approver'} Review
                </span>
                {approval.actionAt && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(approval.actionAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {approval.approver?.firstName} {approval.approver?.lastName} 
                <span className="opacity-70 ml-1">({approval.approver?.email})</span>
              </p>
              
              {approval.comment && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm italic text-foreground border border-border/50">
                  "{approval.comment}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
