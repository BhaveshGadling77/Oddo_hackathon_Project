import React from "react";
import { Link } from "wouter";
import { useGetWorkflows, useDeleteWorkflow } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, GitMerge, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Workflows() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useGetWorkflows({
    request: { headers: getAuthHeaders() }
  });

  const { mutate: deleteWf } = useDeleteWorkflow({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        toast({ title: "Workflow deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/approval-flows"] });
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Configure routing rules for expense approvals.</p>
        <Link href="/admin/workflow-builder">
          <Button className="shadow-sm">
            <PlusCircle className="mr-2 w-4 h-4" />
            Create Workflow
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-12">Loading workflows...</div>
        ) : data?.data?.map((wf) => (
          <Card key={wf.id} className="border-border shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-xl font-display">{wf.name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant={wf.isActive ? 'default' : 'secondary'}>
                    {wf.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {wf.rules?.length || 0} Rules
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Link href={`/admin/workflow-builder?id=${wf.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => confirm('Delete this workflow?') && deleteWf({ id: wf.id })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {wf.description || 'No description provided.'}
              </p>
              
              <div className="bg-muted/40 rounded-lg p-3 border border-border">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-foreground/80">
                  <GitMerge className="w-3.5 h-3.5" /> Approval Sequence
                </h4>
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  {wf.steps?.sort((a,b)=>a.order-b.order).map((step, i) => (
                    <React.Fragment key={step.id || i}>
                      <span className="bg-background border border-border px-2 py-1 rounded shadow-xs capitalize text-xs font-medium">
                        {step.approverRole}
                      </span>
                      {i < (wf.steps?.length || 0) - 1 && <span className="text-muted-foreground">→</span>}
                    </React.Fragment>
                  ))}
                  {(!wf.steps || wf.steps.length === 0) && (
                    <span className="text-muted-foreground text-xs italic">No steps defined</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {data?.data?.length === 0 && (
          <div className="col-span-2 py-16 text-center border-2 border-dashed border-border rounded-xl">
            <GitMerge className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No workflows found</h3>
            <p className="text-muted-foreground mb-4">Create your first workflow to automate approvals.</p>
            <Link href="/admin/workflow-builder">
              <Button variant="outline">Create Workflow</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
