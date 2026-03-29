import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateWorkflow, useUpdateWorkflow, useGetWorkflowById } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const workflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  rules: z.array(z.object({
    field: z.string(),
    operator: z.enum(["gt", "lt", "gte", "lte", "eq", "neq"]),
    value: z.string()
  })),
  steps: z.array(z.object({
    order: z.number(),
    approverRole: z.enum(["manager", "admin", "finance"]),
  }))
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

export default function WorkflowBuilder() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');
  const isEdit = !!id;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingData, isLoading: loadingExisting } = useGetWorkflowById(id || '', {
    query: { enabled: isEdit },
    request: { headers: getAuthHeaders() }
  });

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      rules: [],
      steps: [{ order: 1, approverRole: "manager" }]
    }
  });

  const { fields: rules, append: appendRule, remove: removeRule } = useFieldArray({
    control: form.control,
    name: "rules"
  });

  const { fields: steps, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: "steps"
  });

  useEffect(() => {
    if (existingData) {
      form.reset({
        name: existingData.name,
        description: existingData.description || "",
        isActive: existingData.isActive,
        rules: existingData.rules as any || [],
        steps: existingData.steps as any || []
      });
    }
  }, [existingData, form]);

  const { mutate: createWf, isPending: creating } = useCreateWorkflow({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        toast({ title: "Workflow created" });
        queryClient.invalidateQueries({ queryKey: ["/api/approval-flows"] });
        setLocation("/admin/workflows");
      }
    }
  });

  const { mutate: updateWf, isPending: updating } = useUpdateWorkflow({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        toast({ title: "Workflow updated" });
        queryClient.invalidateQueries({ queryKey: ["/api/approval-flows"] });
        setLocation("/admin/workflows");
      }
    }
  });

  const onSubmit = (data: WorkflowFormValues) => {
    // Reorder steps before saving
    const cleanedData = {
      ...data,
      steps: data.steps.map((s, i) => ({ ...s, order: i + 1 }))
    };
    
    if (isEdit && id) {
      updateWf({ id, data: cleanedData as any });
    } else {
      createWf({ data: cleanedData as any });
    }
  };

  if (isEdit && loadingExisting) return <div className="p-10 text-center">Loading workflow...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/workflows")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold font-display">{isEdit ? 'Edit Workflow' : 'Build Workflow'}</h2>
          <p className="text-muted-foreground text-sm">Define rules and approval sequences.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input {...form.register("name")} placeholder="e.g. Executive Travel Approvals" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...form.register("description")} placeholder="Applies to travel > $1000" />
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="isActive" 
                checked={form.watch("isActive")} 
                onCheckedChange={(c) => form.setValue("isActive", c as boolean)} 
              />
              <Label htmlFor="isActive">Active Workflow</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Trigger Rules</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => appendRule({ field: "amount", operator: "gt", value: "0" })}>
              <Plus className="w-4 h-4 mr-1" /> Add Rule
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.length === 0 && (
              <div className="text-sm text-muted-foreground italic">No rules defined. Workflow will apply to all expenses.</div>
            )}
            {rules.map((rule, index) => (
              <div key={rule.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                <Select value={form.watch(`rules.${index}.field`)} onValueChange={(v) => form.setValue(`rules.${index}.field`, v)}>
                  <SelectTrigger className="w-[150px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount ($)</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={form.watch(`rules.${index}.operator`)} onValueChange={(v) => form.setValue(`rules.${index}.operator`, v as any)}>
                  <SelectTrigger className="w-[120px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">{">"} Greater than</SelectItem>
                    <SelectItem value="lt">{"<"} Less than</SelectItem>
                    <SelectItem value="eq">{"="} Equals</SelectItem>
                    <SelectItem value="neq">{"!="} Not equal</SelectItem>
                  </SelectContent>
                </Select>

                <Input className="flex-1 bg-background" placeholder="Value..." {...form.register(`rules.${index}.value`)} />
                
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(index)} className="text-red-500 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Approval Sequence</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => appendStep({ order: steps.length + 1, approverRole: "manager" })}>
              <Plus className="w-4 h-4 mr-1" /> Add Step
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border relative">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Label className="text-xs mb-1 block">Approver Role</Label>
                  <Select value={form.watch(`steps.${index}.approverRole`)} onValueChange={(v) => form.setValue(`steps.${index}.approverRole`, v as any)}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Direct Manager</SelectItem>
                      <SelectItem value="finance">Finance Dept</SelectItem>
                      <SelectItem value="admin">System Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)} disabled={steps.length === 1} className="text-red-500 mt-5 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => setLocation("/admin/workflows")}>Cancel</Button>
          <Button type="submit" disabled={creating || updating}>
            <Save className="w-4 h-4 mr-2" />
            {creating || updating ? "Saving..." : "Save Workflow"}
          </Button>
        </div>
      </form>
    </div>
  );
}
