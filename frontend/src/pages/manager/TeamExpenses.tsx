import React, { useState } from "react";
import { useGetExpenses } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { ExpenseCard } from "@/components/expense/ExpenseCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

export default function TeamExpenses() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // As a manager, getting all expenses likely respects a backend scoping to their team.
  // Or we just call the regular list and backend filters by managerId.
  const { data, isLoading } = useGetExpenses(
    { status: statusFilter === "all" ? undefined : statusFilter as any, limit: 50 },
    { request: { headers: getAuthHeaders() } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Team Expenses</h2>
          <p className="text-sm text-muted-foreground">History of expenses from your direct reports.</p>
        </div>
      </div>

      <div className="flex gap-3 bg-card p-3 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employee or expense..." className="pl-9 bg-background border-transparent shadow-none" />
        </div>
        <div className="w-px bg-border my-1" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-transparent border-transparent shadow-none">
            <SelectValue placeholder="Status" />
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
          <div className="py-12 text-center text-muted-foreground animate-pulse">Loading team expenses...</div>
        ) : data?.data?.map(exp => (
          <ExpenseCard key={exp.id} expense={exp} />
        ))}
        
        {data?.data?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-muted-foreground">
            <Users className="w-12 h-12 mb-3 opacity-20" />
            <h3 className="font-semibold text-lg text-foreground">No team expenses</h3>
            <p className="text-sm mt-1">There are no expenses matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
