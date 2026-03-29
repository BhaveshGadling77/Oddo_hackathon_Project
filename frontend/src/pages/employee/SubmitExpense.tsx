import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useCreateExpense } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Receipt, Send, Link as LinkIcon } from "lucide-react";

const expenseSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().default("USD"),
  category: z.string().min(1, "Category is required"),
  receiptUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function SubmitExpense() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createExpense, isPending } = useCreateExpense({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        toast({ title: "Success", description: "Expense submitted for approval." });
        queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
        setLocation("/employee/history");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to submit expense." });
      }
    }
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { title: "", description: "", currency: "USD", category: "", receiptUrl: "" },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    createExpense({ data });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-border shadow-md">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display">Submit Expense</CardTitle>
              <CardDescription>Enter details for your reimbursement request.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Expense Title</Label>
              <Input placeholder="e.g. Client Dinner at Dorsia" className="h-12 text-lg" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                  <Input type="number" step="0.01" className="h-12 pl-8 text-lg font-semibold" placeholder="0.00" {...form.register("amount")} />
                </div>
                {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(val) => form.setValue("category", val)} defaultValue={form.getValues("category")}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Travel">Travel & Transit</SelectItem>
                    <SelectItem value="Meals">Meals & Entertainment</SelectItem>
                    <SelectItem value="Software">Software & Subscriptions</SelectItem>
                    <SelectItem value="Equipment">Office Equipment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description / Business Purpose</Label>
              <Textarea placeholder="Explain why this expense was necessary..." className="resize-none h-24" {...form.register("description")} />
            </div>

            <div className="space-y-2">
              <Label>Receipt Link (Optional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="https://..." className="pl-9" {...form.register("receiptUrl")} />
              </div>
              {form.formState.errors.receiptUrl && <p className="text-sm text-destructive">{form.formState.errors.receiptUrl.message}</p>}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button type="submit" size="lg" className="px-8 shadow-md" disabled={isPending}>
                <Send className="w-4 h-4 mr-2" />
                {isPending ? "Submitting..." : "Submit for Approval"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
