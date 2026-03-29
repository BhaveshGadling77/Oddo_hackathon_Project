import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, XOctagon } from "lucide-react";
import { ExpenseStatus, ApprovalStatus } from "@workspace/api-client-react/src/generated/api.schemas";

interface StatusBadgeProps {
  status: ExpenseStatus | ApprovalStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "approved":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2 py-1 gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 px-2 py-1 gap-1">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 px-2 py-1 gap-1">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 px-2 py-1 gap-1">
          <XOctagon className="w-3.5 h-3.5" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
