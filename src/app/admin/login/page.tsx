"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // If already logged in as admin, redirect
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.replace("/admin");
    }
  }, [authLoading, user, isAdmin, router]);

  // After login attempt, wait for isAdmin to resolve
  useEffect(() => {
    if (loginAttempted && !authLoading && user) {
      if (isAdmin) {
        router.replace("/admin");
      } else {
        // Give a moment for the deferred admin check
        const timer = setTimeout(() => {
          if (!isAdmin) {
            toast({ title: "שגיאה", description: "אין לך הרשאות מנהל", variant: "destructive" });
            setLoginAttempted(false);
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [loginAttempted, authLoading, user, isAdmin, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "שגיאת התחברות", description: error.message, variant: "destructive" });
    } else {
      setLoginAttempted(true);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto p-6">
        <h1 className="font-rubik text-3xl font-bold text-heading mb-6 text-center">כניסת מנהל</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
          />
          <Input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "מתחבר..." : "התחבר"}
          </Button>
        </form>
      </div>
    </main>
  );
}
