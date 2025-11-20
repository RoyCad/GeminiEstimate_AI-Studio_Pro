
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, UserCheck, ShieldQuestion, AlertTriangle, Copy, Check, RefreshCw, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';


const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});


const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.022,44,30.032,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


export default function AuthForm({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithGoogle, signInAsClient, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginType, setLoginType] = useState('Client');
  
  // Unauthorized Domain State
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleCopyDomain = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
        await signInWithGoogle();
        // The useEffect in the login page will handle redirection
    } catch (error: any) {
        if (error.code === 'auth/unauthorized-domain') {
            setUnauthorizedDomain(window.location.hostname);
            return;
        }

        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-in was cancelled. Please try again.";
        } else if (error.message.includes("Access Denied")) {
            errorMessage = error.message;
        } else if (error.message.includes("Only admins can sign in with Google")) {
            errorMessage = "Only admins can sign in with Google. Please use the Client login.";
        }
        
        toast({
            title: "Google Sign-In Failed",
            description: errorMessage,
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      await signInAsClient(values.email, values.password);
      // The useEffect will handle redirection after state update
    } catch (error: any) {
       if (error.code === 'auth/unauthorized-domain') {
            setUnauthorizedDomain(window.location.hostname);
            setIsSubmitting(false);
            return;
       }

      let errorMessage = 'An unexpected error occurred. Please try again.';
       if (error.code) {
          switch (error.code) {
              case 'auth/invalid-credential':
              case 'auth/wrong-password':
              case 'auth/user-not-found':
                  errorMessage = 'Invalid email or password. Please try again.';
                  break;
              case 'auth/too-many-requests':
                  errorMessage = 'Access temporarily disabled due to too many failed login attempts.';
                  break;
              default:
                  errorMessage = error.message || 'Authentication failed. Please try again later.';
          }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive"
      });
      form.setError("password", { type: "manual", message: "" });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDevLogin = async () => {
      setIsSubmitting(true);
      const devEmail = 'developer@example.com';
      const devPass = '123456';

      try {
          try {
              // Try logging in directly via Firebase SDK to bypass the 'Client' check in `signInAsClient` hook for first-time setup
              await signInWithEmailAndPassword(auth, devEmail, devPass);
          } catch (loginErr: any) {
              if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
                  // Create if doesn't exist
                  const result = await createUserWithEmailAndPassword(auth, devEmail, devPass);
                  const user = result.user;
                  // Force Admin Role for Dev
                  await setDoc(doc(firestore, 'users', user.uid), {
                      id: user.uid,
                      email: user.email,
                      displayName: 'Developer Admin',
                      photoURL: '',
                      role: 'Admin',
                      createdAt: serverTimestamp()
                  });
              } else {
                  throw loginErr;
              }
          }
          // Success - Auth state listener will pick up and redirect
      } catch (err: any) {
          console.error(err);
           if (err.code === 'auth/unauthorized-domain') {
              setUnauthorizedDomain(window.location.hostname);
          }
          toast({ title: "Dev Login Failed", description: err.message, variant: "destructive" });
      } finally {
          setIsSubmitting(false);
      }
  };
  
  const isLoading = isSubmitting || authLoading;

  if (unauthorizedDomain) {
    return (
        <Card className={cn("w-full max-w-lg glass-card transition-all duration-300 ease-in-out border-amber-500/30")}>
            <CardHeader>
                <div className="flex items-center gap-3 text-amber-500 mb-2">
                    <AlertTriangle size={24} />
                    <CardTitle className="text-xl">Authorization Required</CardTitle>
                </div>
                <CardDescription>
                    This domain is not authorized for authentication in Firebase.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                    To fix this, add the following domain to the <strong>Authorized Domains</strong> list in your Firebase Console under <em>Authentication {'>'} Settings</em>.
                </p>
                
                <div className="bg-muted/50 rounded-lg p-4 border border-border relative group">
                    <div className="flex items-center justify-between gap-4">
                        <code className="text-primary font-mono text-sm break-all">{unauthorizedDomain}</code>
                        <Button
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleCopyDomain(unauthorizedDomain)}
                            className="shrink-0 h-8 w-8"
                        >
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </Button>
                    </div>
                </div>

                <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full gap-2"
                >
                    <RefreshCw size={16} />
                    I've added it, Refresh Page
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-sm glass-card transition-all duration-300 ease-in-out")}>
        <CardHeader className="text-center">
            <div className="mx-auto mb-6 flex h-[100px] w-[180px] items-center justify-center p-4">
                <Image 
                    src="/my_logo.png" 
                    alt="Logo" 
                    width={180} 
                    height={45} 
                    priority 
                    className="object-contain drop-shadow-sm dark:invert"
                />
            </div>
            <CardTitle>Welcome to GeminiEstimate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <Tabs value={loginType} onValueChange={setLoginType} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="Client">Client</TabsTrigger>
                    <TabsTrigger value="Admin">Admin</TabsTrigger>
                </TabsList>
                <TabsContent value="Client">
                    <CardDescription className="text-center my-4">
                        Sign in with your project credentials.
                    </CardDescription>
                     <Form {...form}>
                        <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input placeholder="client@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...field}
                                        />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                                ) : (<>Login as Client</>)}
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="Admin">
                    <CardDescription className="text-center my-4">
                        Sign in with your Google account.
                    </CardDescription>
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2"/> : <GoogleIcon />}
                            <span className="ml-2">Sign in with Google</span>
                        </Button>
                         <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full border border-dashed border-primary/20" onClick={handleDevLogin} disabled={isLoading}>
                             {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Code2 className="mr-2 h-4 w-4" />}
                             Developer Quick Login
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
