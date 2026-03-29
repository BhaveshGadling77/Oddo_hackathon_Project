import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { getRoleHome } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Department is required"),
  role: z.enum(["admin", "manager", "employee"]),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [_, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  
  const { mutate: registerUser, isPending } = useRegister({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast({ title: "Account created!", description: "Welcome to Expensify." });
        setLocation(getRoleHome(data.user.role));
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.response?.data?.message || "Please check your details and try again.",
        });
      },
    }
  });

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      firstName: "", 
      lastName: "", 
      email: "", 
      password: "", 
      department: "",
      role: "employee" 
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    registerUser({ data });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="w-full max-w-xl border-border shadow-xl">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary p-3 rounded-2xl shadow-sm">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-display">Create Account</CardTitle>
          <CardDescription className="text-base">
            Join your organization's expense management platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@company.com" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="e.g. Engineering" {...form.register("department")} />
                {form.formState.errors.department && (
                  <p className="text-sm text-destructive">{form.formState.errors.department.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Role (Demo Only)</Label>
                <Select 
                  onValueChange={(val) => form.setValue("role", val as any)} 
                  defaultValue={form.getValues("role")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="w-full h-11 text-base mt-4" disabled={isPending}>
              {isPending ? "Creating account..." : "Sign Up"}
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
