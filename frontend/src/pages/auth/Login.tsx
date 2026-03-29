import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { getRoleHome } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  
  const { mutate: login, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        setLocation(getRoleHome(data.user.role));
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.response?.data?.message || "Invalid credentials. Please try again.",
        });
      },
    }
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    login({ data });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
           <img 
              src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
              alt="Auth Background"
              className="w-full h-full object-cover"
           />
        </div>
        <div className="relative z-10 text-primary-foreground">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">Expensify</span>
          </div>
          <div>
            <h1 className="text-5xl font-display font-bold leading-tight mb-6">
              Modern corporate <br/>expense management.
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-md font-light">
              Streamline approvals, track spending, and empower your team with a beautiful financial experience.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-primary-foreground/60 text-sm">
          © {new Date().getFullYear()} Expensify Inc. All rights reserved.
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 h-full">
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-lg">
          <CardHeader className="space-y-2 pb-8">
            <div className="flex items-center gap-3 lg:hidden mb-4">
              <div className="bg-primary p-2 rounded-xl">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Expensify</span>
            </div>
            <CardTitle className="text-3xl font-bold font-display">Sign In</CardTitle>
            <CardDescription className="text-base">
              Enter your corporate email and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    className="h-12"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    className="h-12"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </div>
              
              <Button type="submit" className="w-full h-12 text-base shadow-md" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
