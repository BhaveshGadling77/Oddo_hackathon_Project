import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Receipt, DollarSign, Calendar, Tag } from "lucide-react";
import type { Expense } from "@workspace/api-client-react/src/generated/api.schemas";

interface ExpenseCardProps {
  expense: Expense;
  onClick?: () => void;
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const isClickable = !!onClick;
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 border border-border shadow-sm group ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 items-start gap-4">
            <div className={`mt-1 p-3 rounded-xl flex-shrink-0 ${
              expense.status === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
              expense.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
              'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
            }`}>
              <Receipt className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                {expense.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {expense.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {expense.submittedAt ? format(new Date(expense.submittedAt), 'MMM d, yyyy') : 'Draft'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 md:gap-2 bg-muted/30 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none">
            <div className="flex items-baseline gap-1 font-display font-bold text-lg text-foreground">
              <span>{expense.currency === 'USD' ? '$' : expense.currency}</span>
              <span>{expense.amount.toFixed(2)}</span>
            </div>
            <StatusBadge status={expense.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
