
"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader } from './loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAuth = async (isSignUp: boolean) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account created!", description: "You're now logged in." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: "You're now logged in." });
      }
      // The dialog will be closed by the parent component's useEffect
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Log In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <div className="py-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
      <TabsContent value="login">
        <Button onClick={() => handleAuth(false)} disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Logging In...' : 'Log In'}
        </Button>
      </TabsContent>
      <TabsContent value="signup">
         <Button onClick={() => handleAuth(true)} disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </TabsContent>
    </Tabs>
  );
}
